
# LeadFlow

  
A lightweight CRM for managing leads, tracking conversations, and
scheduling follow-ups.

## Features

  

### Lead Management

  

- Create leads with a required name and optional company and phone

number.

- Track leads through six statuses: New, Contacted, Qualified,

Proposal Sent, Won, and Lost.

- View each lead's latest discussion and time since the last

interaction.

- Search leads by name or company.

- Filter the list by status.

  

### Discussions and Follow-ups

  

- Open a lead's timeline in a dialog without navigating away from the

main screen.

- View discussion history in reverse chronological order.

- Add discussion notes with an optional follow-up date and time.

- Update a lead's status from the timeline dialog.

- Pin today's follow-ups near the top of the list.

- Highlight overdue follow-ups in red.

- Reflect changes in the lead list immediately.

  

### Developer Experience

  

- Docker Compose setup for running the application stack.

- Seed script with 5 sample leads and 8 discussions.

- Interactive API documentation through FastAPI.

- Environment configuration documented in `.env.example`.

 `  
##  Tech Stack

| Layer | Technology | Purpose |
|----------|----------|---------|
| Frontend | Next.js 16, React 19, TypeScript | Single-screen lead management interface |
| Styling | Tailwind CSS 4 | Responsive UI styling |
| Backend | FastAPI, Python | REST API and application logic |
| Validation | Pydantic | Request validation and data schemas |
| ORM | SQLAlchemy 2 | Database models and queries |
| Database | PostgreSQL 16 | Persistent storage for leads and discussions |
| Containerization | Docker, Docker Compose | Consistent development environment |

## System Architecture

The frontend communicates with the FastAPI backend through REST APIs.

The backend validates requests, runs application logic, and uses

SQLAlchemy to persist data in PostgreSQL.

  

```mermaid

flowchart TB

U["Sales Representative"]

  

subgraph Frontend["Presentation Layer"]

UI["Next.js Application"]

LIST["Lead List and Filters"]

TIMELINE["Lead Timeline Dialog"]

FORMS["Lead and Discussion Forms"]

UI --> LIST

UI --> TIMELINE

UI --> FORMS

end

  

subgraph Backend["Application Layer"]

API["FastAPI REST API"]

VALIDATION["Pydantic Validation"]

LOGIC["Lead and Follow-up Logic"]

ORM["SQLAlchemy ORM"]

API --> VALIDATION

VALIDATION --> LOGIC

LOGIC --> ORM

end

  

DB[("PostgreSQL")]

  

U --> UI

LIST --> API

TIMELINE --> API

FORMS --> API

ORM --> DB

```

  

### Request Lifecycle

  

1. A user performs an action in the frontend.

2. The frontend sends an HTTP request to a FastAPI endpoint.

3. Pydantic validates incoming request data.

4. The backend applies the relevant application logic.

5. SQLAlchemy reads from or writes to PostgreSQL.

6. The API returns a response and the frontend updates the displayed

data.

  

## Data Model

  

A lead can have multiple discussions. Each discussion belongs to one
lead.

```mermaid
erDiagram
    LEAD ||--o{ DISCUSSION : has

    LEAD {
        int id PK
        string name
        string company
        string phone
        string status
        datetime follow_up_at
        datetime created_at
        datetime updated_at
    }

    DISCUSSION {
        int id PK
        int lead_id FK
        text note
        datetime follow_up_at
        datetime created_at
    }
```


**Relationship:** One lead can have zero or more discussions, and each

discussion references its parent lead through `lead_id`.

  

The diagram describes the intended relationship. Keep the fields aligned

with the actual SQLAlchemy models in the repository.

  

## Follow-up Workflow
LeadFlow distinguishes between overdue follow-ups, follow-ups due today,

and future follow-ups.

  

```mermaid

flowchart TD

A["Evaluate Lead Follow-up"] --> B{"Follow-up Scheduled?"}

B -->|No| C["No Scheduled Follow-up"]

B -->|Yes| D{"Compare Due Date"}

D -->|Before Today| E["Highlight as Overdue"]

D -->|Today| F["Pin Near Top of List"]

D -->|After Today| G["Show Upcoming Follow-up"]

```

  


## Project Structure

```text
LeadFlow/
├── backend/
│   ├── main.py            # FastAPI application and routes
│   ├── models.py          # SQLAlchemy database models
│   ├── schemas.py         # Pydantic request/response schemas
│   ├── database.py        # Database engine and sessions
│   ├── seed.py            # Sample data initialization
│   ├── requirements.txt   # Python dependencies
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js App Router
│   │   ├── components/    # Lead cards, forms, and dialogs
│   │   ├── lib/api.ts     # API client and time helpers
│   │   └── types/         # TypeScript types
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

  


## Getting Started

### Prerequisites

**Docker setup**

- Docker Desktop or Docker Engine with Docker Compose

**Local development**

- Python 3.12+
- Node.js 22+
- PostgreSQL 16+
- npm

### Option 1: Docker Compose

#### 1. Clone the repository

Replace `<your-username>` with your GitHub username.

```bash
git clone https://github.com/<your-username>/LeadFlow.git
cd LeadFlow
```

#### 2. Configure environment variables

```bash
cp .env.example .env
```

Review the environment configuration and update credentials if required.

#### 3. Build and start the application

```bash
docker compose up --build
```

#### 4. Open the application

| Service | URL |
|---|---|
| Frontend | [http://localhost:3000](http://localhost:3000) |
| Backend API | [http://localhost:8000](http://localhost:8000) |
| Interactive API Docs | [http://localhost:8000/docs](http://localhost:8000/docs) |
| Health Check | [http://localhost:8000/api/health](http://localhost:8000/api/health) |

#### 5. Load sample data

Run this in a separate terminal:

```bash
docker compose exec backend python -m backend.seed
```

#### 6. Stop the application

```bash
docker compose down
```

To stop the application and also remove the database volume and its persisted data:

```bash
docker compose down -v
```

> **Warning:** `docker compose down -v` deletes the database volume. Use it only when you want to reset the local database.

### Option 2: Local Development

#### 1. Configure the environment

From the project root:

```bash
cp .env.example .env
```

Example configuration:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/leadflow
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Ensure PostgreSQL is running and the `leadflow` database exists.

#### 2. Set up the backend

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on macOS or Linux:

```bash
source .venv/bin/activate
```

On Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r backend/requirements.txt
```

Start the API server from the project root:

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

#### 3. Seed the database

In another terminal, activate the virtual environment and run:

```bash
python -m backend.seed
```

#### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

  


## API Reference

All endpoints use the `/api` prefix.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Check API health |
| `GET` | `/api/leads` | List leads |
| `POST` | `/api/leads` | Create a lead |
| `GET` | `/api/leads/{id}` | Retrieve a lead and its discussions |
| `PATCH` | `/api/leads/{id}/status` | Update a lead's status |
| `POST` | `/api/leads/{id}/discussions` | Add a discussion and optional follow-up |

### Filtering Leads

The lead listing endpoint supports optional `status` and `search` query parameters.

Example:

```http
GET /api/leads?status=Qualified&search=Sarah
```

Interactive request and response schemas are available at [http://localhost:8000/docs](http://localhost:8000/docs) when the backend is running.

## Author

**Nishant Kumar**
