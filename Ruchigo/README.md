# RuchiGo

Food delivery app. React + Vite frontend, Django REST backend, MySQL schema in database folder.

Folders:

- src -> frontend code (all pages: customer, restaurant, delivery, admin, superadmin)
- backend -> Django API (login/register with JWT, all endpoints under /api/v1/)
- database -> RuchiGo_DB.sql (MySQL 8 schema)

## Backend setup

```
cd backend
python -m venv .venv
source .venv/bin/activate        (Windows: .venv\Scripts\activate)
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py seed_ruchigo    (demo data, optional)
python manage.py runserver
```

Runs at http://127.0.0.1:8000, api docs at /api/docs/

Uses SQLite by default for local dev. For MySQL, run database/RuchiGo_DB.sql first and update backend/.env with the credentials.

## Deployment checklist
See `DEPLOYMENT_CHECKLIST.md` for production readiness and final deployment steps.

## Frontend setup

```
npm install
cp .env.example .env
npm run dev
```

Runs at http://localhost:5173. VITE_API_BASE_URL in .env points to the backend.

More details in PROJECT_AUDIT.md
