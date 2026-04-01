from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from uuid import uuid4
import json

from db import engine, get_db
from models import Base, Order, ShoeListing, User
from schemas import (
    LoginRequest,
    OrderCreate,
    OrderResponse,
    ShoeListingCreate,
    ShoeListingResponse,
    ShoeListingUpdate,
    UserResponse,
)

Base.metadata.create_all(bind=engine)
app = FastAPI(title="Shoe Marketplace API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/login", response_model=UserResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    # Mocked login: match plain-text credentials or create a basic seller user.
    user = (
        db.query(User)
        .filter(User.email == payload.email, User.password == payload.password)
        .first()
    )
    if not user:
        user = User(
            id=f"user_{uuid4().hex[:12]}",
            email=payload.email,
            password=payload.password,
            role="seller",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


@app.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.post("/listings", response_model=ShoeListingResponse, status_code=201)
def create_listing(listing: ShoeListingCreate, db: Session = Depends(get_db)):
    seller = db.query(User).filter(User.id == listing.seller_id).first()
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")

    data = listing.model_dump(exclude={"materials", "colors"})
    db_listing = ShoeListing(
        **data,
        materials=",".join(listing.materials),
        colors=",".join(listing.colors),
    )
    db.add(db_listing)
    db.commit()
    db.refresh(db_listing)
    return db_listing


@app.get("/listings", response_model=list[ShoeListingResponse])
def get_listings(
    search: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    size: float | None = None,
    style: str | None = None,
    material: str | None = None,
    color: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(ShoeListing)
    if search:
        query = query.filter(
            ShoeListing.title.ilike(f"%{search}%")
            | ShoeListing.description.ilike(f"%{search}%")
        )
    if min_price is not None:
        query = query.filter(ShoeListing.price >= min_price)
    if max_price is not None:
        query = query.filter(ShoeListing.price <= max_price)
    if size is not None:
        query = query.filter(ShoeListing.size == size)
    if style:
        query = query.filter(ShoeListing.style == style)
    if material:
        query = query.filter(ShoeListing.materials.ilike(f"%{material}%"))
    if color:
        query = query.filter(ShoeListing.colors.ilike(f"%{color}%"))
    return query.all()


@app.get("/listings/{listing_id}", response_model=ShoeListingResponse)
def get_listing(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(ShoeListing).filter(ShoeListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing


@app.put("/listings/{listing_id}", response_model=ShoeListingResponse)
def update_listing(
    listing_id: int, payload: ShoeListingUpdate, db: Session = Depends(get_db)
):
    listing = db.query(ShoeListing).filter(ShoeListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.seller_id != payload.seller_id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this listing")

    seller = db.query(User).filter(User.id == payload.seller_id).first()
    if not seller:
        raise HTTPException(status_code=404, detail="Seller not found")

    listing.title = payload.title
    listing.description = payload.description
    listing.price = payload.price
    listing.image_url = payload.image_url
    listing.size = payload.size
    listing.materials = ",".join(payload.materials)
    listing.colors = ",".join(payload.colors)
    listing.style = payload.style

    db.commit()
    db.refresh(listing)
    return listing


@app.delete("/listings/{listing_id}", status_code=204)
def delete_listing(listing_id: int, seller_id: str, db: Session = Depends(get_db)):
    listing = db.query(ShoeListing).filter(ShoeListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.seller_id != seller_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this listing")

    db.delete(listing)
    db.commit()
    return None


@app.post("/orders", response_model=OrderResponse, status_code=201)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    buyer = db.query(User).filter(User.id == payload.buyer_id).first()
    if not buyer:
        raise HTTPException(status_code=404, detail="Buyer not found")
    if buyer.role != "buyer":
        raise HTTPException(status_code=403, detail="Only buyers can create orders")
    if len(payload.items) == 0:
        raise HTTPException(status_code=400, detail="Order must include at least one item")

    total_amount = sum(item.price for item in payload.items)
    cleaned_card = payload.card_number.replace(" ", "")
    if len(cleaned_card) < 4:
        raise HTTPException(status_code=400, detail="Card number is invalid")

    order = Order(
        buyer_id=payload.buyer_id,
        items_json=json.dumps([item.model_dump() for item in payload.items]),
        total_amount=total_amount,
        payment_last4=cleaned_card[-4:],
        shipping_name=payload.shipping_name,
        address_line1=payload.address_line1,
        city=payload.city,
        state=payload.state,
        zip=payload.zip,
        country=payload.country,
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@app.get("/buyers/{buyer_id}/orders", response_model=list[OrderResponse])
def get_buyer_orders(buyer_id: str, db: Session = Depends(get_db)):
    buyer = db.query(User).filter(User.id == buyer_id).first()
    if not buyer:
        raise HTTPException(status_code=404, detail="Buyer not found")
    if buyer.role != "buyer":
        raise HTTPException(status_code=403, detail="Only buyers can view buyer orders")
    return (
        db.query(Order)
        .filter(Order.buyer_id == buyer_id)
        .order_by(Order.created_at.desc())
        .all()
    )


@app.get("/sellers/{seller_id}/listings", response_model=list[ShoeListingResponse])
def get_seller_listings(seller_id: str, db: Session = Depends(get_db)):
    return db.query(ShoeListing).filter(ShoeListing.seller_id == seller_id).all()
