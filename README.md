# AgroMart – Farmer to Buyer Marketplace

A full-stack marketplace platform connecting farmers directly with buyers.

## Tech Stack
- **Frontend**: React 18 + React Router + Vite
- **Backend**: Node.js + Express
- **Auth**: JWT + bcryptjs
- **Storage**: In-memory (swap with MongoDB/PostgreSQL for production)

## Project Structure
```
agromart/
├── backend/
│   ├── server.js          # Express entry point
│   ├── db.js              # In-memory store + seed data
│   ├── middleware.js       # JWT auth middleware
│   └── routes/
│       ├── auth.js        # POST /api/auth/signup|login
│       ├── listings.js    # GET/POST /api/listings
│       ├── bids.js        # GET/POST /api/bids
│       └── questions.js   # POST /api/questions
├── frontend/
│   ├── src/
│   │   ├── api/index.js        # All API calls
│   │   ├── context/
│   │   │   ├── AuthContext.jsx  # Global user state
│   │   │   └── ToastContext.jsx # Notifications
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── AuthModal.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx         # Landing + daily prices
│   │   │   ├── Marketplace.jsx  # Browse listings
│   │   │   ├── ListingDetail.jsx# Bid + Q&A
│   │   │   └── Dashboard.jsx    # Farmer/buyer dashboards
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   └── vite.config.js    # Proxies /api → localhost:4000
└── README.md

## Getting Started

### 1. Install & run the backend
```bash
cd backend
npm install
node server.js
# API running on http://localhost:4000
```

### 2. Install & run the frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
# App running on http://localhost:5173
```

## Demo Accounts
| Role   | Username | Password   |
|--------|----------|------------|
| Farmer | ramlal   | farmer123  |
| Buyer  | priya    | buyer123   |

## API Endpoints
| Method | Path                              | Auth     | Description              |
|--------|-----------------------------------|----------|--------------------------|
| POST   | /api/auth/signup                  | —        | Create account           |
| POST   | /api/auth/login                   | —        | Login                    |
| GET    | /api/listings                     | —        | All open listings        |
| GET    | /api/listings/prices              | —        | Daily price table        |
| GET    | /api/listings/mine                | Farmer   | My listings + bids       |
| GET    | /api/listings/:id                 | —        | Single listing + Q&A     |
| POST   | /api/listings                     | Farmer   | Create listing           |
| POST   | /api/listings/:id/accept/:bidId   | Farmer   | Accept a bid             |
| DELETE | /api/listings/:id                 | Farmer   | Remove listing           |
| POST   | /api/bids                         | Buyer    | Place a bid              |
| GET    | /api/bids/mine                    | Buyer    | My bids + status         |
| POST   | /api/questions                    | Any user | Ask a question           |
| POST   | /api/questions/:id/answer         | Farmer   | Answer a question        |

## Features
- Farmer dashboard: add listings, view bids ranked by amount, accept deals
- Buyer dashboard: browse with category filters & search, place bids, track status
- Q&A thread per listing: buyers ask, farmers reply
- Daily crop price table with trend indicators (live from listings)
- JWT auth with role-based access (farmer / buyer)
- Responsive design, mobile-friendly

## Deployment
For production, swap the in-memory db.js with:
- **MongoDB**: mongoose models for User, Listing, Bid, Question
- **PostgreSQL**: pg + Prisma or Drizzle ORM
- **Hosting**: Railway, Render, or Vercel (split frontend/backend)
