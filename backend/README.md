# Sowo — Backend

> API and server-side logic for the Sowo platform.

## Planned Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | PostgreSQL |
| Auth | JWT + refresh tokens |
| Payments | Stripe (escrow flow) |
| File storage | AWS S3 |
| Email | SendGrid |

## Planned API Endpoints

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
```

### Providers
```
GET    /api/providers
GET    /api/providers/:id
POST   /api/providers
PUT    /api/providers/:id
GET    /api/providers/:id/vouches
```

### Consumers
```
GET    /api/consumers/:id
POST   /api/consumers
PUT    /api/consumers/:id
```

### Bookings
```
GET    /api/bookings
POST   /api/bookings
PUT    /api/bookings/:id
DELETE /api/bookings/:id
```

### Vouches
```
GET    /api/vouches/:providerId
POST   /api/vouches
```

### Payments
```
POST   /api/payments/initiate
POST   /api/payments/release
POST   /api/payments/refund
```

---

*Backend development coming in v2.0.*
