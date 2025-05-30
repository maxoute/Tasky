import os
import datetime
import pickle
from typing import List, Dict, Any
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials

# Chemins des fichiers de credentials et token
CREDENTIALS_FILE = os.environ.get("GOOGLE_CREDENTIALS_FILE", "google_credentials.json")
TOKEN_FILE = os.environ.get("GOOGLE_TOKEN_FILE", "token_google_calendar.pickle")
SCOPES = ["https://www.googleapis.com/auth/calendar"]

class GoogleCalendarService:
    def __init__(self):
        self.creds = None
        self._load_credentials()

    def _load_credentials(self):
        if os.path.exists(TOKEN_FILE):
            with open(TOKEN_FILE, "rb") as token:
                self.creds = Credentials.from_authorized_user_info(pickle.load(token), SCOPES)
        if not self.creds or not self.creds.valid:
            if self.creds and self.creds.expired and self.creds.refresh_token:
                self.creds.refresh(Request())
            else:
                self.creds = None

    def get_auth_url(self) -> str:
        flow = Flow.from_client_secrets_file(
            CREDENTIALS_FILE,
            scopes=SCOPES,
            redirect_uri=os.environ.get("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/google/callback")
        )
        auth_url, _ = flow.authorization_url(prompt='consent', access_type='offline', include_granted_scopes='true')
        return auth_url

    def save_token(self, code: str) -> None:
        flow = Flow.from_client_secrets_file(
            CREDENTIALS_FILE,
            scopes=SCOPES,
            redirect_uri=os.environ.get("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/google/callback")
        )
        flow.fetch_token(code=code)
        creds_data = flow.credentials.to_json()
        with open(TOKEN_FILE, "wb") as token:
            pickle.dump(flow.credentials.to_json(), token)
        self.creds = flow.credentials

    def get_events_today(self) -> List[Dict[str, Any]]:
        if not self.creds:
            raise Exception("Google Calendar non connecté")
        service = build('calendar', 'v3', credentials=self.creds)
        now = datetime.datetime.utcnow().isoformat() + 'Z'
        end_of_day = (datetime.datetime.utcnow() + datetime.timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0).isoformat() + 'Z'
        events_result = service.events().list(
            calendarId='primary', timeMin=now, timeMax=end_of_day,
            maxResults=20, singleEvents=True, orderBy='startTime').execute()
        events = events_result.get('items', [])
        return events

    def add_event(self, summary: str, description: str = "", start: str = None, end: str = None) -> Dict[str, Any]:
        if not self.creds:
            raise Exception("Google Calendar non connecté")
        service = build('calendar', 'v3', credentials=self.creds)
        if not start:
            start = datetime.datetime.utcnow().isoformat()
        if not end:
            end = (datetime.datetime.utcnow() + datetime.timedelta(hours=1)).isoformat()
        event = {
            'summary': summary,
            'description': description,
            'start': {'dateTime': start, 'timeZone': 'UTC'},
            'end': {'dateTime': end, 'timeZone': 'UTC'},
        }
        created_event = service.events().insert(calendarId='primary', body=event).execute()
        return created_event

google_calendar_service = GoogleCalendarService() 