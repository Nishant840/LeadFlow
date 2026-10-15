from typing import Optional
from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from backend.database import Base, engine, get_db
from backend.models import Discussion, Lead, LeadStatus
from backend.schemas import (
    DiscussionCreate,
    LeadCreate,
    LeadDetailResponse,
    LeadStatusUpdate,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="LeadFlow API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", status_code=status.HTTP_200_OK)
def health_check():
    return {"status": "ok"}


@app.get("/api/leads", response_model=list[LeadDetailResponse], status_code=status.HTTP_200_OK)
def get_leads(
    status_filter: Optional[LeadStatus] = Query(None, alias="status"),
    search: Optional[str] = Query(None, description="Search leads by name or company"),
    db: Session = Depends(get_db),
):
    query = db.query(Lead).options(joinedload(Lead.discussions))

    if status_filter:
        query = query.filter(Lead.status == status_filter)

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(Lead.name.ilike(term), Lead.company.ilike(term))
        )

    return query.order_by(Lead.created_at.desc()).all()


@app.post("/api/leads", response_model=LeadDetailResponse, status_code=status.HTTP_201_CREATED)
def create_lead(payload: LeadCreate, db: Session = Depends(get_db)):
    lead = Lead(
        name=payload.name.strip(),
        company=payload.company.strip() if payload.company else None,
        phone=payload.phone.strip() if payload.phone else None,
        status=payload.status,
    )
    db.add(lead)
    db.flush()

    initial_note = Discussion(
        lead_id=lead.id,
        note="Lead created via web form.",
    )
    db.add(initial_note)
    db.commit()
    db.refresh(lead)
    return lead


@app.get("/api/leads/{lead_id}", response_model=LeadDetailResponse, status_code=status.HTTP_200_OK)
def get_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = (
        db.query(Lead)
        .options(joinedload(Lead.discussions))
        .filter(Lead.id == lead_id)
        .first()
    )
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead with id {lead_id} not found",
        )
    return lead


@app.patch("/api/leads/{lead_id}/status", response_model=LeadDetailResponse, status_code=status.HTTP_200_OK)
def update_lead_status(
    lead_id: int, payload: LeadStatusUpdate, db: Session = Depends(get_db)
):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead with id {lead_id} not found",
        )

    lead.status = payload.status
    db.commit()
    db.refresh(lead)
    return lead


@app.post(
    "/api/leads/{lead_id}/discussions",
    response_model=LeadDetailResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_discussion(
    lead_id: int, payload: DiscussionCreate, db: Session = Depends(get_db)
):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead with id {lead_id} not found",
        )

    discussion = Discussion(
        lead_id=lead.id,
        note=payload.note.strip(),
        follow_up_at=payload.follow_up_at,
    )
    db.add(discussion)

    if payload.follow_up_at is not None:
        lead.follow_up_at = payload.follow_up_at

    db.commit()
    db.refresh(lead)
    return lead