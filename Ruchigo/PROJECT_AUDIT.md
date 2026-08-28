# RuchiGo - project notes

## What is done

Frontend (React/Vite) was using demo login and static food data earlier. Now login and register go through the Django backend with JWT tokens. Rest of the screens still use static data for now, can be moved to APIs one by one.

Backend has models and APIs for users, restaurants, menu items, cart, wishlist, orders, payments, delivery, notifications, reviews, coupons etc. Swagger docs at /api/docs/

All APIs are under /api/v1/. Restaurants, categories and menu items are public. Everything else needs login. Role based access for restaurant/delivery/admin endpoints.

## Testing

- migrate runs clean
- python manage.py test api -> 4 tests pass (register/login, cart to checkout, public vs protected APIs, restaurant data isolation)
- frontend lint and build pass

## Pending for production

- real MySQL setup (schema is in database folder)
- payment gateway integration
- email/OTP provider
- HTTPS, monitoring, rate limiting
- e2e tests
