# RuchiGo MySQL database

`RuchiGo_DB.sql` is an executable MySQL 8+ schema based on the supplied 143-page database document. It includes normalized tables, foreign keys, delete rules, indexes, and the document's core master data.

## Run it

Create the full database from a MySQL command prompt:

```bash
mysql -u root -p < database/RuchiGo_DB.sql
```

The script intentionally recreates `RuchiGo_DB` from scratch. Use it only for a new development database; remove the first two SQL statements before applying it to a database that contains data.

## Coverage

The schema covers identity and access, customers/wallets, restaurants and menus, carts and ordering, payment/invoicing, delivery, reviews, offers/coupons, notifications, admin/commission/refunds, support, geolocation, favourites/search, inventory, and platform configuration.
