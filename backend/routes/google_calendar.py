from fastapi import APIRouter, Request, HTTPException, Query
from fastapi.responses import RedirectResponse, JSONResponse
from services.google_calendar_service import google_calendar_service

router = APIRouter(prefix="/api/google", tags=["google_calendar"])

@router.get("/auth")
def google_auth():
    url = google_calendar_service.get_auth_url()
    return RedirectResponse(url)

@router.get("/callback")
def google_callback(code: str):
    try:
        google_calendar_service.save_token(code)
        return JSONResponse({"message": "Connexion Google Calendar réussie"})
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erreur callback Google: {str(e)}")

@router.get("/events/today")
def get_events_today():
    try:
        events = google_calendar_service.get_events_today()
        return {"events": events}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erreur récupération events: {str(e)}")

@router.post("/add_event")
def add_event(summary: str = Query(...), description: str = Query(""), start: str = Query(None), end: str = Query(None)):
    try:
        event = google_calendar_service.add_event(summary, description, start, end)
        return {"event": event}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erreur ajout event: {str(e)}") 