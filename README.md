# Kasi360 Platform — MVP

Mobile-first SMME marketplace for township, urban, and rural South Africa.

---

## Project Structure

```
kasi360/
├── backend/        # Node.js + Express + PostgreSQL REST API
├── mobile/         # React Native + Expo (iOS & Android)
├── admin/          # React.js web admin dashboard
└── README.md
```

---

## Backend Setup

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your DB credentials and JWT secret
```

### 3. Create the PostgreSQL database
```sql
CREATE DATABASE kasi360;
```

### 4. Run migrations (creates all tables)
```bash
npm run db:migrate
```

### 5. Start the dev server
```bash
npm run dev
```

API will be live at: `http://localhost:5000`

Health check: `GET http://localhost:5000/health`

---

## API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/auth/register | Public | Register smme or customer |
| POST | /api/auth/login | Public | Login |
| GET | /api/auth/me | Protected | Get current user |

### Listings
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/listings | Public | Browse listings (search/filter) |
| GET | /api/listings/:id | Public | Single listing |
| POST | /api/listings | SMME | Create listing |
| PATCH | /api/listings/:id | SMME/Admin | Update listing |
| DELETE | /api/listings/:id | SMME/Admin | Delete listing |

### Orders
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/orders | Customer | Place order |
| GET | /api/orders | All roles | View orders (filtered by role) |
| PATCH | /api/orders/:id/status | SMME/Admin | Update order status |

---

## Database Schema

- **users** — all roles (smme, customer, admin)
- **business_profiles** — SMME business pages
- **listings** — products and services
- **orders** — customer orders
- **order_items** — line items per order
- **transactions** — payment records (Paystack/Yoco — TBC)

---

## Open Items (Pending Josh)
- [ ] Payment gateway: Paystack vs Yoco (white-label for KasiPay)
- [ ] Cloud hosting: AWS / Azure / GCP / Render
- [ ] Apple Developer Account ($99/yr)
- [ ] Google Play Developer Account ($25 once-off)
- [ ] Confirm Kasi Panic Button API access
