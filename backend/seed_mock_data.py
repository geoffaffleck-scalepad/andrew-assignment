from db import SessionLocal, engine
from models import Base, ShoeListing, User

DEFAULT_SHOE_IMAGE_URL = (
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgmNFZkIccTlrJP80AxNhMxLe4KiNk5AM3Sg&s"
)


MOCK_USERS = [
    {"id": "seller_1", "email": "seller1@example.com", "password": "pass1", "role": "seller"},
    {"id": "seller_2", "email": "seller2@example.com", "password": "pass2", "role": "seller"},
    {"id": "buyer_1", "email": "buyer1@example.com", "password": "pass3", "role": "buyer"},
    {"id": "buyer_2", "email": "buyer2@example.com", "password": "pass4", "role": "buyer"},
]

MOCK_LISTINGS = [
    {
        "title": "Urban Runner Blue",
        "description": "Lightweight city running shoe.",
        "price": 129.99,
        "image_url": DEFAULT_SHOE_IMAGE_URL,
        "size": 9.0,
        "materials": "mesh,rubber",
        "colors": "blue,white",
        "style": "sport",
        "seller_id": "seller_1",
    },
    {
        "title": "Retro Court White",
        "description": "Classic low-top everyday sneaker.",
        "price": 109.0,
        "image_url": DEFAULT_SHOE_IMAGE_URL,
        "size": 8.5,
        "materials": "leather,rubber",
        "colors": "white,cream",
        "style": "casual",
        "seller_id": "seller_2",
    },
    {
        "title": "Trail Grip Pro",
        "description": "Durable trail shoe with strong grip.",
        "price": 149.5,
        "image_url": DEFAULT_SHOE_IMAGE_URL,
        "size": 10.0,
        "materials": "synthetic,rubber",
        "colors": "black,green",
        "style": "outdoor",
        "seller_id": "seller_1",
    },
    {
        "title": "Minimal Knit Slip",
        "description": "Breathable knit slip-on design.",
        "price": 89.99,
        "image_url": DEFAULT_SHOE_IMAGE_URL,
        "size": 7.5,
        "materials": "knit,foam",
        "colors": "gray,white",
        "style": "casual",
        "seller_id": "seller_2",
    },
    {
        "title": "Street High Volt",
        "description": "High-top statement sneaker.",
        "price": 139.0,
        "image_url": DEFAULT_SHOE_IMAGE_URL,
        "size": 11.0,
        "materials": "canvas,rubber",
        "colors": "yellow,black",
        "style": "streetwear",
        "seller_id": "seller_1",
    },
    {
        "title": "Daily Flex Sand",
        "description": "Comfort-first shoe for daily wear.",
        "price": 99.99,
        "image_url": DEFAULT_SHOE_IMAGE_URL,
        "size": 9.5,
        "materials": "mesh,foam",
        "colors": "tan,brown",
        "style": "casual",
        "seller_id": "seller_2",
    },
    {
        "title": "SpeedForm Elite",
        "description": "Performance racer with responsive sole.",
        "price": 179.0,
        "image_url": DEFAULT_SHOE_IMAGE_URL,
        "size": 10.5,
        "materials": "mesh,carbon",
        "colors": "red,black",
        "style": "sport",
        "seller_id": "seller_1",
    },
    {
        "title": "Heritage Court Navy",
        "description": "Vintage-inspired court silhouette.",
        "price": 119.5,
        "image_url": DEFAULT_SHOE_IMAGE_URL,
        "size": 8.0,
        "materials": "leather,suede",
        "colors": "navy,white",
        "style": "lifestyle",
        "seller_id": "seller_2",
    },
]


def seed_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    users_created = 0
    listings_created = 0

    try:
        for mock_user in MOCK_USERS:
            user = db.query(User).filter(User.id == mock_user["id"]).first()
            if user:
                for key, value in mock_user.items():
                    setattr(user, key, value)
            else:
                db.add(User(**mock_user))
                users_created += 1

        db.commit()

        for mock_listing in MOCK_LISTINGS:
            listing = (
                db.query(ShoeListing)
                .filter(
                    ShoeListing.title == mock_listing["title"],
                    ShoeListing.seller_id == mock_listing["seller_id"],
                )
                .first()
            )
            if listing:
                for key, value in mock_listing.items():
                    setattr(listing, key, value)
            else:
                db.add(ShoeListing(**mock_listing))
                listings_created += 1

        db.commit()
        print(f"Seed complete: users created={users_created}, listings created={listings_created}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()
