from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, computed_field

from backend.models import LeadStatus


class DiscussionCreate(BaseModel):
    note: str = Field(..., min_length=1, description="Discussion summary note")
    follow_up_at: Optional[datetime] = None


class DiscussionResponse(BaseModel):
    id: int
    lead_id: int
    note: str
    follow_up_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LeadCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    company: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    status: LeadStatus = LeadStatus.NEW


class LeadStatusUpdate(BaseModel):
    status: LeadStatus


class LeadDetailResponse(BaseModel):
    id: int
    name: str
    company: Optional[str] = None
    phone: Optional[str] = None
    status: LeadStatus
    follow_up_at: Optional[datetime] = None
    created_at: datetime
    discussions: list[DiscussionResponse] = []

    model_config = ConfigDict(from_attributes=True)

    @computed_field
    @property
    def last_note(self) -> Optional[str]:
        return self.discussions[0].note if self.discussions else None

    @computed_field
    @property
    def last_discussion_at(self) -> Optional[datetime]:
        return self.discussions[0].created_at if self.discussions else None