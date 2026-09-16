# RuchiGo backend

Production-oriented Django REST API for the RuchiGo React frontend.

## Local run

1. Create a virtual environment and install `pip install -r requirements.txt`.
2. Copy `.env.example` to `.env`; SQLite is the default local database.
3. Run `python manage.py migrate`, `python manage.py createsuperuser`, then `python manage.py runserver`.
4. Open `http://127.0.0.1:8000/api/docs/` for the OpenAPI/Swagger UI and use the API at `/api/v1/`.

SQLite needs no system database libraries. For MySQL, install the operating system's MySQL client development package and then run `pip install -r requirements-mysql.txt`.

## Frontend connection

Set `VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1` in the React app's `.env`. Login uses `POST /auth/login/`; persist `tokens.access` in memory and send it as `Authorization: Bearer <token>`. Refresh through `POST /auth/token/refresh/`.

Note for local development with Vite:

- If your Vite dev server runs on a different port (for example `http://localhost:5174`), set the backend env var `FRONTEND_URL` to that origin (comma-separated list if multiple) in `backend/.env` so `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS` include it. Example:

```
FRONTEND_URL=http://localhost:5174
```

This keeps CORS restrictive while allowing the dev frontend to call the API. Avoid enabling global CORS allowlists in production.

## Key endpoints

- `/auth/register/`, `/auth/login/`, `/auth/me/`, `/auth/forgot_password/`, `/auth/reset_password/`, `/auth/request_email_verification/`, `/auth/verify_email/`
- `/restaurants/`, `/categories/`, `/menu-items/`, `/addresses/`, `/wishlist/`, `/cart/`, `/orders/`
- `/coupons/`, `/offers/`, `/deliveries/`, `/notifications/`, `/reviews/`, `/analytics/`

The API enforces role gates for restaurant, delivery, and admin activities, and supports pagination, filtering, search, ordering, OpenAPI documentation, media files, CORS, JWT refresh tokens, and MySQL configuration.
