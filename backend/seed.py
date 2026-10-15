from datetime import datetime, timedelta, timezone
from backend.database import Base, SessionLocal, engine
from backend.models import Discussion, Lead, LeadStatus


def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        db.query(Discussion).delete()
        db.query(Lead).delete()
        db.commit()

        now = datetime.now(timezone.utc)
        today_later = now + timedelta(hours=3)
        today_overdue = now - timedelta(hours=2)

        # 1. Sarah Connor (Pinned in Today's Follow-ups - Upcoming Today)
        sarah = Lead(
            name="Sarah Connor",
            company="Acme Corp",
            phone="555-0199",
            status=LeadStatus.PROPOSAL_SENT,
            follow_up_at=today_later,
            created_at=now - timedelta(days=6),
        )
        db.add(sarah)
        db.flush()

        db.add_all(
            [
                Discussion(
                    lead_id=sarah.id,
                    note="Lead created via web form.",
                    created_at=now - timedelta(days=6),
                ),
                Discussion(
                    lead_id=sarah.id,
                    note="Initial discovery call. They need a CRM for 50 reps. Pain points include dropping leads and no follow-up tracking.",
                    created_at=now - timedelta(days=5),
                ),
                Discussion(
                    lead_id=sarah.id,
                    note="Sent pricing tier PDF. Said she would review with her boss.",
                    follow_up_at=today_later,
                    created_at=now - timedelta(days=2),
                ),
            ]
        )

        # 2. Michael Scott (Pinned in Today's Follow-ups - Overdue Today for Bonus #2)
        michael = Lead(
            name="Michael Scott",
            company="Dunder Mifflin",
            phone="555-0142",
            status=LeadStatus.QUALIFIED,
            follow_up_at=today_overdue,
            created_at=now - timedelta(days=4),
        )
        db.add(michael)
        db.flush()

        db.add_all(
            [
                Discussion(
                    lead_id=michael.id,
                    note="Lead created via web form.",
                    created_at=now - timedelta(days=4),
                ),
                Discussion(
                    lead_id=michael.id,
                    note="Demoed the dashboard. Requested a quick call to finalize regional branch seats.",
                    follow_up_at=today_overdue,
                    created_at=now - timedelta(days=1),
                ),
            ]
        )

        # 3. Hank Scorpio (All Leads - New)
        hank = Lead(
            name="Hank Scorpio",
            company="Globex",
            phone="555-0188",
            status=LeadStatus.NEW,
            created_at=now - timedelta(hours=2),
        )
        db.add(hank)
        db.flush()

        db.add(
            Discussion(
                lead_id=hank.id,
                note="Inbound lead from website contact form.",
                created_at=now - timedelta(hours=2),
            )
        )

        # 4. Bill Lumbergh (All Leads - Contacted)
        bill = Lead(
            name="Bill Lumbergh",
            company="Initech",
            phone="555-0177",
            status=LeadStatus.CONTACTED,
            created_at=now - timedelta(days=7),
        )
        db.add(bill)
        db.flush()

        db.add(
            Discussion(
                lead_id=bill.id,
                note="Left a voicemail with his assistant.",
                created_at=now - timedelta(days=7),
            )
        )

        # 5. Bruce Wayne (All Leads - Won)
        bruce = Lead(
            name="Bruce Wayne",
            company="Wayne Ent",
            phone="555-0100",
            status=LeadStatus.WON,
            created_at=now - timedelta(days=21),
        )
        db.add(bruce)
        db.flush()

        db.add(
            Discussion(
                lead_id=bruce.id,
                note="Contract signed! Sending welcome package.",
                created_at=now - timedelta(days=21),
            )
        )

        db.commit()
        print("Successfully seeded 5 leads and 8 discussions!")

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()