# 🐄 DairyMitra AI - Enterprise Smart Dairy Farm Platform

**DairyMitra AI** is a production-ready, full-stack agricultural SaaS platform engineered for modern dairy farmers, livestock cooperatives (Amul, Mother Dairy, local dairies), and agricultural organizations. It features an intuitive bilingual Next.js dashboard (English & हिन्दी) and an enterprise-grade Express.js backend architected for microservice readiness, extreme security, high throughput, and resilient offline capability.

---

## 🏛️ System Architecture

The DairyMitra platform is structured into two cleanly decoupled layers:

```
DairyMitra AI/
├── src/                          # Next.js 14 App Router (Frontend)
│   ├── app/                      # Page routes (Dashboard, Animals, Milk, Finance, AI, Reports, Settings)
│   ├── components/               # UI components, modals, Recharts, analytics widgets
│   └── lib/                      # Types, bilingual translations, reactive state store, Axios API client
│
└── server/                       # Enterprise Express.js API (Backend)
    ├── src/
    │   ├── bootstrap/            # Server lifecycle, MongoDB pool, Redis pool, Graceful shutdown
    │   ├── shared/               # Shared across all modules (prepped for microservice extraction)
    │   │   ├── constants/        # HTTP status, standardized domain error codes
    │   │   ├── errors/           # Centralized AppError hierarchy (ValidationError, ConflictError, etc.)
    │   │   ├── middleware/       # Security (Helmet, XSS, NoSQL, SSRF, HPP), Rate limiter, Bloom filter, Idempotency, JWT guard
    │   │   └── utils/            # Structured JSON logger, JWT rotators, Bcrypt hasher, Pagination helper
    │   ├── integration/          # External third-party adapters
    │   │   ├── mailer/           # Nodemailer transporter + HTML OTP email templates
    │   │   └── ai/               # Gemini AI cattle advisor client + veterinary safety safeguard
    │   └── modules/              # Feature-based business domain modules
    │       ├── auth/             # Signup, OTP verification, Login, Token refresh, Forgot/Reset password
    │       ├── users/            # User model, Super Admin seed, RBAC roles (ADMIN, FARMER, VET)
    │       ├── animals/          # Livestock registry, health milestones, vaccination records
    │       ├── milk-records/     # Milking session entries, yield analytics, duplicate prevention
    │       ├── expenses-sales/   # Feed/vet/labour expenses, customer milk sales ledgers
    │       ├── reports/          # KPI analytics & Node.js Readable stream CSV export
    │       ├── ai-advisor/       # Cattle nutrition, lactation guidance & medical disclaimer
    │       └── health/           # Liveness (`/live`) and readiness (`/health`) probes
    ├── .env                      # Active runtime environment
    ├── .env.example              # Production configuration template
    └── package.json
```

---

## 🌟 Key Features

### 1. 📊 Farm Analytics Dashboard (`/dashboard`)
- **Real-Time KPIs**: Total Registered Animals, Today's Milk Production (L), Monthly Milk Yield, Total Farm Expenses, Total Milk Sales, and Net Farm Profit (`Sales - Expenses`).
- **Interactive Visualizations**: 14-day morning vs evening yield area chart, 6-month revenue vs expenses comparative bar chart, top daily yielding livestock leaderboard.
- **Activity Streams**: Recent financial transactions and veterinary/vaccination milestones.
- **Quick Actions**: One-click modals to log milk, register livestock, record expenses, record sales, or query the AI Advisor.

### 2. 🐂 Livestock Management (`/animals` & `/animals/[id]`)
- **Livestock Registry**: Cow and Buffalo breeds (Gir, Sahiwal, Murrah, Jaffarabadi, HF Cross, Jersey Cross, etc.).
- **Animal Profiles**: Tag ID (e.g. `DM-101`), DOB, weight, purchase price, milk capacity, lactation number, vaccination tracking (FMD, HS, BQ, Brucellosis), clinical visits, and feeding schedules.
- **Search, Filter & Sort**: Filter by species, health status (Lactating, Pregnant, Healthy, Dry, Sick), and sort by capacity or price.

### 3. 🥛 Milk Records & Yield Tracking (`/milk-records`)
- **Session-Based Milking**: Morning (6:00 AM) and Evening (5:00 PM) logs.
- **Compound Unique Protection**: Prevents duplicate entries for the same animal on the same date.
- **Automated Valuation**: Computes gross sales value based on breed rates and optional Fat % / SNF % testing.

### 4. 💰 Expenses & Milk Sales (`/expenses`)
- **Cost Categorization**: Animal Feed (silage, pellets, green fodder), Veterinary & Medicine, Labour Wages, Transportation, Electricity & Water, Maintenance, Other.
- **Milk Sales Ledger**: Log dispatches to cooperatives (Amul, Mother Dairy) or direct buyers with payment statuses (*Paid*, *Pending*, *Partial*).
- **Financial Analytics**: Donut chart breakdown of operational overheads and net margin calculation.

### 5. 🤖 Bilingual AI Advisor (`/ai-advisor`)
- **Bilingual Conversations**: Seamless English and Hindi (हिन्दी) support.
- **Domain Specialization**: Nutritional guidelines (TMR ration, bypass fat, mineral mixtures), yield optimization, and vaccination alerts.
- **Veterinary Safety Safeguard**: Adheres to strict medical safety guidelines; warns farmers that AI is for advisory purposes and prompts immediate veterinary intervention for acute symptoms.

### 6. 📑 Reports & Streaming Export (`/reports`)
- **Multi-Module Reporting**: Production logs, profit & loss statements, livestock rankings.
- **High-Performance Streaming**: Node.js `Readable` streams push CSV data chunk-by-chunk to the browser without buffering gigabytes into memory.
- **Print / PDF Formatted Export**: Clean print media stylesheet for bank loan applications and audits.

---

## 🔒 Enterprise Backend Capabilities

1. **Pre-Auth Bloom Filter**: High-performance multi-hash Bloom filter checks whether an email exists in sub-millisecond memory before initiating costly database lookups or bcrypt hash verifications, neutralizing brute-force denial-of-service attempts.
2. **Double Token Rotation**: Short-lived JWT Access Tokens (15m) paired with cryptographically secure Refresh Tokens (7d).
3. **Nodemailer 6-Digit OTP Flow**: Email-based OTP verification with 10-minute expiry for user registration and password recovery.
4. **Idempotency Key Middleware**: Uses `Idempotency-Key` headers on POST/PUT requests to safely retry network calls without duplicate records or payments.
5. **Production Web Security**:
   - `helmet` with custom Content Security Policy.
   - CORS origin whitelisting with credentials support.
   - NoSQL query injection sanitization (strips `$` and `.` operators).
   - Cross-Site Scripting (XSS) payload sanitization.
   - HTTP Parameter Pollution (`hpp`) protection.
   - SSRF Guard blocking private IP ranges (`10.x.x.x`, `192.168.x.x`, `169.254.x.x`, `127.x.x.x`).
6. **Connection Pooling**: Mongoose MongoDB pool with `maxPoolSize=50`, `minPoolSize=5`, and `maxIdleTimeMS=30000`. Built with transparent in-memory fallback for zero-downtime offline evaluation.
7. **Structured JSON Logging**: Every log includes timestamp, log-level, `reqId`, method, route, IP, user-agent, and response latency with sensitive credential masking.
8. **Graceful Shutdown**: Intercepts `SIGTERM` and `SIGINT`, ceases accepting new connections, drains in-flight requests within a 30s timeout, and disconnects MongoDB and Redis pools cleanly.

---

## 📡 REST API Reference

All backend endpoints are prefixed with `/api/v1`:

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/health` | Server readiness probe & pool health | No |
| `GET` | `/health/live` | Server liveness probe | No |
| `POST` | `/auth/signup` | Register farmer account & dispatch OTP | No |
| `POST` | `/auth/verify-otp` | Verify 6-digit OTP & receive tokens | No |
| `POST` | `/auth/login` | Login with Bloom filter check & receive tokens | No |
| `POST` | `/auth/refresh-token` | Exchange refresh token for new access token | No |
| `POST` | `/auth/forgot-password` | Request password reset OTP | No |
| `POST` | `/auth/reset-password` | Reset password using verified OTP | No |
| `GET` | `/auth/me` | Fetch active user profile | Yes (`Bearer`) |
| `GET` | `/animals` | Paginated list of registered livestock | Yes (`Bearer`) |
| `POST` | `/animals` | Register new animal (`Idempotency-Key` supported) | Yes (`Bearer`) |
| `GET` | `/animals/:id` | Fetch animal profile with medical logs | Yes (`Bearer`) |
| `PUT` | `/animals/:id` | Update animal profile | Yes (`Bearer`) |
| `DELETE` | `/animals/:id` | Delete animal record | Yes (`Bearer`) |
| `GET` | `/milk-records` | Paginated daily milk production logs | Yes (`Bearer`) |
| `POST` | `/milk-records` | Record morning/evening milk session | Yes (`Bearer`) |
| `GET` | `/expenses` | List farm operating expenses | Yes (`Bearer`) |
| `POST` | `/expenses` | Record new expense (`Idempotency-Key` supported) | Yes (`Bearer`) |
| `GET` | `/sales` | List milk sales transactions | Yes (`Bearer`) |
| `POST` | `/sales` | Record milk dispatch & payment status | Yes (`Bearer`) |
| `GET` | `/reports` | Aggregate farm statistics (Yield, P&L, Cattle) | Yes (`Bearer`) |
| `GET` | `/reports/export/csv` | Stream CSV spreadsheet (`?type=milk\|finance`) | Yes (`Bearer`) |
| `POST` | `/ai-advisor` | Bilingual AI query with veterinary safety guard | Yes (`Bearer`) |

---

## ⚙️ Environment Variables (`server/.env`)

```ini
PORT=5001
NODE_ENV=production
APP_NAME=DairyMitra AI
APP_URL=http://localhost:3000
API_PREFIX=/api/v1

# Security & CORS
CORS_ORIGIN=http://localhost:3000
JWT_ACCESS_SECRET=dairymitra_super_secure_access_secret_2026_xyz
JWT_REFRESH_SECRET=dairymitra_super_secure_refresh_secret_2026_abc
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Database (MongoDB Connection Pool)
MONGODB_URI=mongodb://localhost:27017/dairymitra
MONGODB_MAX_POOL_SIZE=50
MONGODB_MIN_POOL_SIZE=5

# Cache & Bloom Filter (Redis Pool)
REDIS_URL=redis://localhost:6379

# Nodemailer OTP Delivery
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=dairymitra.alerts@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="DairyMitra AI <no-reply@dairymitra.ai>"

# Super Admin Seed Account
ADMIN_EMAIL=admin@dairymitra.ai
ADMIN_PASSWORD=Admin@DairyMitra2026!
ADMIN_NAME="DairyMitra SuperAdmin"
```

---

## 🚀 Running DairyMitra AI

### 1. Start Database & Redis (Optional / Production)
```bash
# In production, start MongoDB and Redis:
brew services start mongodb-community
brew services start redis
# Or via Docker:
# docker run -d -p 27017:27017 --name mongo mongo:latest
# docker run -d -p 6379:6379 --name redis redis:alpine
```
*(Note: DairyMitra's backend includes an automatic in-memory fallback adapter, allowing full startup and evaluation even before local databases are provisioned).*

### 2. Start the Backend API Server
```bash
cd "DairyMitra AI/server"
npm install
npm run build
npm start
```
The API server will listen on [http://localhost:5001](http://localhost:5001).

### 3. Start the Next.js Frontend
```bash
cd "DairyMitra AI"
npm install
npm run build
npm start
```
The web dashboard will be live at [http://localhost:3000](http://localhost:3000).

---

## 👨‍🌾 Default Demonstration Credentials

- **Proprietor**: Rajesh Patel (राजेश पटेल)
- **Dairy Farm**: Gokul Dairy Farm (गोकुल डेयरी फार्म), Anand, Gujarat
- **Admin Email**: `admin@dairymitra.ai`
- **Admin Password**: `Admin@DairyMitra2026!`
- **Sample Cattle Tags**: `DM-101` (Gauri - Gir Cow), `DM-102` (Kaveri - Sahiwal Cow), `DM-105` (Lakshmi - Murrah Buffalo)

---

## 📄 License
MIT License. Engineered for modern Indian agriculture and sustainable dairy farming.
