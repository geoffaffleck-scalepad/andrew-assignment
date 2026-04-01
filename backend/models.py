from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, String, func

from db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)  # plain text (assignment scope)
    role = Column(String, nullable=False, default="seller")


class ShoeListing(Base):
    __tablename__ = "shoe_listings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    price = Column(Float, nullable=False)
    image_url = Column(String, nullable=True)
    size = Column(Float, nullable=False)
    materials = Column(String, nullable=True)  # comma-separated
    colors = Column(String, nullable=True)  # comma-separated
    style = Column(String, nullable=True)
    seller_id = Column(String, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, server_default=func.now())


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(String, nullable=False, index=True)
    items_json = Column(String, nullable=False)  # JSON string
    total_amount = Column(Float, nullable=False)
    payment_last4 = Column(String, nullable=False)
    shipping_name = Column(String, nullable=False)
    address_line1 = Column(String, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    zip = Column(String, nullable=False)
    country = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, server_default=func.now())
