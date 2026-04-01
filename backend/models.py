from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, String, func

from db import Base


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
