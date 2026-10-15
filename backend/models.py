import enum
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from backend.database import Base


class LeadStatus(str, enum.Enum):
    NEW = "New"
    CONTACTED = "Contacted"
    QUALIFIED = "Qualified"
    PROPOSAL_SENT = "Proposal Sent"
    WON = "Won"
    LOST = "Lost"


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    company = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    status = Column(Enum(LeadStatus), default=LeadStatus.NEW, nullable=False, index=True)
    follow_up_at = Column(DateTime(timezone=True), nullable=True, index=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    discussions = relationship(
        "Discussion",
        back_populates="lead",
        cascade="all, delete-orphan",
        order_by="desc(Discussion.created_at)",
    )


class Discussion(Base):
    __tablename__ = "discussions"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(
        Integer, ForeignKey("leads.id", ondelete="CASCADE"), nullable=False, index=True
    )
    note = Column(Text, nullable=False)
    follow_up_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    lead = relationship("Lead", back_populates="discussions")