# RuchiGo Deployment Checklist

## 1. Confirm local readiness
- [x] Frontend production build passes: `npm run build`
- [x] Backend API tests pass: `.venv/bin/python backend/manage.py test api` (Windows: `.venv\Scripts\python.exe backend\manage.py test api`)
- [ ] Review browser console for frontend runtime errors after local testing
- [ ] Verify backend migrations are current: `.venv/bin/python backend/manage.py migrate`

## 2. Production environment variables
Set these in production only, not in version control.

- `DJANGO_SECRET_KEY` — long random secret
- `DATABASE_URL` — persistent PostgreSQL connection string (required for Vercel)
- `RUCHIGO_ADMIN_EMAIL` — initial admin email
- `RUCHIGO_ADMIN_PASSWORD` — initial admin password (never commit this value)
- `DJANGO_DEBUG=false`
- `DJANGO_ALLOWED_HOSTS=<your-domain>,...`
- `FRONTEND_URL=<frontend-url>`
- `CSRF_TRUSTED_ORIGINS=<frontend-url>`
- `VITE_API_BASE_URL=<backend-api-url>/api/v1`
- When frontend and Django are deployed together on Vercel, use `/api/v1`.
- `DJANGO_SECURE_SSL_REDIRECT=true` when using HTTPS
- `DJANGO_SECURE_HSTS_SECONDS=31536000`
- `EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend` or production email driver
- `DEFAULT_FROM_EMAIL=<your-from-address>`

If using MySQL:
- Install the optional driver with `pip install -r backend/requirements-mysql.txt`
- `DJANGO_DB_ENGINE=mysql`
- `MYSQL_DATABASE=<db-name>`
- `MYSQL_USER=<db-user>`
- `MYSQL_PASSWORD=<db-password>`
- `MYSQL_HOST=<db-host>`
- `MYSQL_PORT=<db-port>`

## 3. Backend security/hardening
- Ensure `DJANGO_SECRET_KEY` is set and not the default placeholder
- Keep `DJANGO_DEBUG=false` in production
- Use secure cookies by enabling `DJANGO_SECURE_SSL_REDIRECT=true`
- Confirm `ALLOWED_HOSTS` contains only valid hosts
- Confirm `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS` match your frontend origin

## 4. Manual app flow testing
### Customer flows
- [ ] Register and login as customer
- [ ] Browse restaurants and menu items
- [ ] Add items to cart and proceed through checkout
- [ ] Configure and verify a real card/UPI payment provider before enabling those methods (COD is implemented)
- [ ] Verify order appears in `/orders`
- [ ] Verify tracking page loads and updates correctly

### Restaurant flows
- [ ] Login as restaurant user
- [ ] Open restaurant dashboard
- [ ] View and manage restaurant orders
- [ ] Confirm menu and earnings pages render correctly

### Delivery flows
- [ ] Login as delivery user
- [ ] View delivery orders and accept order assignments
- [ ] Confirm navigation and earnings pages render correctly

### Admin flows
- [ ] Login as admin user
- [ ] Access user, restaurant, delivery partner, orders, payments, and reports sections
- [ ] Verify role-based access is enforced

### Auth flows
- [ ] Attempt protected route redirect when not logged in
- [ ] Attempt guest route redirect when logged in
- [ ] Verify unauthorized/access-denied flows show expected pages
- [ ] Confirm session expiration and logout behavior

## 5. Performance and asset optimization
- [x] Remove demo food photos from the production route bundle
- [x] Split route pages into lazy-loaded chunks
- [ ] Optimize newly uploaded restaurant and menu images at ingestion/CDN level

## 6. Deployment steps
- Build frontend: `npm run build`
- Deploy frontend static assets to your hosting provider
- Deploy backend with `.env` set to production values
- Run backend migrations in production
- Configure web server or application service for Django and serve static files
- Run Django behind a production WSGI server, for example `gunicorn config.wsgi:application --chdir backend`

## 7. Post-deployment validation
- [ ] Confirm frontend loads at production URL
- [ ] Confirm API requests succeed with `Authorization: Bearer <token>`
- [ ] Check console and network logs for failed requests
- [ ] Run any smoke tests for the deployed app
