# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Minimal full-stack custom shoe marketplace (interview/assignment scope). Keep code simple and interview-appropriate — no unnecessary abstractions.

## Tech Stack

- **Backend:** FastAPI + SQLAlchemy + SQLite (`backend/` directory)
- **Frontend:** Next.js + TypeScript (`frontend/` directory) — not yet scaffolded
- **Database:** SQLite file `marketplace.db` (auto-created on first run)

## Development Commands

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
API docs available at http://localhost:8000/docs when running.

### Frontend (once scaffolded)
```bash
cd frontend
npm install
npm run dev        # dev server on port 3000
```

## Architecture

### Backend Structure (`backend/`)

- `main.py` — FastAPI app, CORS config (allows localhost:3000), all route handlers
- `models.py` — SQLAlchemy model (`ShoeListing`); `materials` and `colors` stored as comma-separated strings
- `schemas.py` — Pydantic schemas; `ShoeListingCreate` accepts lists for materials/colors, `ShoeListingResponse` has a `field_validator` that splits comma-separated DB strings back into lists
- `db.py` — Engine, session factory, `get_db` dependency

### Key Design Decisions

- **Comma-separated lists:** `materials` and `colors` are stored as comma-separated strings in SQLite, converted to/from Python lists in the Pydantic layer (schemas.py validator on response, join on create in main.py)
- **No migrations:** Tables auto-created via `Base.metadata.create_all()` in main.py on startup
- **No auth:** `seller_id` is a plain string passed by the client

### API Endpoints

- `POST /listings` — create listing
- `GET /listings` — list/search with filters (search, min_price, max_price, size, style, material, color)
- `GET /listings/{listing_id}` — single listing
- `GET /sellers/{seller_id}/listings` — listings by seller

## Git Conventions

- Keep commit messages simple and concise
- Do not mention Claude or Claude Code in commit messages
