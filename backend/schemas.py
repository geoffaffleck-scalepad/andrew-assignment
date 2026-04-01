from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator


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
