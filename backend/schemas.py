from datetime import datetime
import json

from pydantic import BaseModel, ConfigDict, Field, field_validator


class LoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    role: str


class ShoeListingCreate(BaseModel):
    title: str
    description: str | None = None
    price: float
    image_url: str | None = None
    size: float
    materials: list[str] = []
    colors: list[str] = []
    style: str | None = None
    seller_id: str


class ShoeListingUpdate(BaseModel):
    title: str
    description: str | None = None
    price: float
    image_url: str | None = None
    size: float
    materials: list[str] = []
    colors: list[str] = []
    style: str | None = None
    seller_id: str


class ShoeListingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None
    price: float
    image_url: str | None
    size: float
    materials: list[str]
    colors: list[str]
    style: str | None
    seller_id: str
    created_at: datetime

    @field_validator("materials", "colors", mode="before")
    @classmethod
    def split_comma_separated(cls, v):
        if isinstance(v, str):
            return [x.strip() for x in v.split(",") if x.strip()]
        return v or []


class OrderItem(BaseModel):
    listing_id: int
    title: str
    price: float
    seller_id: str


class OrderCreate(BaseModel):
    buyer_id: str
    items: list[OrderItem]
    card_number: str
    shipping_name: str
    address_line1: str
    city: str
    state: str
    zip: str
    country: str


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    buyer_id: str
    items: list[OrderItem] = Field(validation_alias="items_json")
    total_amount: float
    payment_last4: str
    shipping_name: str
    address_line1: str
    city: str
    state: str
    zip: str
    country: str
    created_at: datetime

    @field_validator("items", mode="before")
    @classmethod
    def parse_items_json(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return []
        return v or []
