# 🐄 DairyMitra AI - Smart Dairy Farm Management Platform

**DairyMitra AI** is a production-quality, responsive agricultural SaaS platform engineered specifically for modern dairy farmers, with tailored support for Indian livestock breeds, milk cooperatives (Amul, Mother Dairy, local dairies), bilingual operations (English & हिन्दी), and AI-driven cattle advisory.

---

## 🌟 Key Features

### 1. 📊 Farm Analytics Dashboard (`/dashboard`)
- **Real-Time KPIs**: Total Registered Animals, Today's Milk Production (L), Monthly Milk Yield, Total Farm Expenses, Total Milk Sales, and Net Farm Profit (calculated as `Actual Sales - Expenses`).
- **Interactive Visualizations**:
  - 14-day morning vs evening milk production area chart.
  - 6-month revenue vs expenses comparative bar chart.
  - Top daily yielding livestock leaderboard with breed and butterfat metrics.
- **Activity Streams**: Recent financial transactions and recent veterinary/vaccination milestones.
- **Quick Actions**: One-click modals to log milk, register livestock, record expenses, record sales, or query the AI Advisor.

### 2. 🐂 Livestock Management (`/animals` & `/animals/[id]`)
- **Livestock Registry**: Manage Cow and Buffalo breeds (Gir, Sahiwal, Murrah, Jaffarabadi, HF Cross, Jersey Cross, etc.).
- **Animal Profiles**:
  - Detailed metadata: Tag ID (e.g., `DM-101`), DOB, weight, purchase price, milk capacity, lactation number.
  - Individual milk production trend chart and log history.
  - Vaccination tracking (FMD, HS, BQ, Brucellosis, Theileriosis) with status (*Completed*, *Due*, *Overdue*).
  - Clinical veterinary visit history, diagnoses, and prescriptions.
  - Dietary management and feeding schedules (morning/evening kg, supplements).
- **Search, Filter & Sort**: Fast filtering by species (Cow/Buffalo), health status (Lactating, Pregnant, Healthy, Dry, Sick, Under Treatment), and sorting by yield capacity, tag, or price.
- **Full CRUD**: Register, edit profile, and delete animals with confirmation.

### 3. 🥛 Milk Records & Yield Tracking (`/milk-records`)
- **Session-Based Logging**: Separate inputs for morning (6:00 AM) and evening (5:00 PM) milking sessions.
- **Duplicate Prevention**: Intelligently detects and prevents duplicate records for the same animal on the same date.
- **Automated Valuation**: Computes total daily liters and gross sales value based on breed-specific rates and optional Fat % / SNF % testing.
- **Interactive Yield Charts**: 7-day and 14-day production volume comparison.

### 4. 💰 Expenses & Milk Sales (`/expenses`)
- **Cost Categorization**: Animal Feed (silage, pellets, green fodder), Veterinary & Medicine, Labour Wages, Transportation, Electricity & Water, Equipment & Maintenance, Other.
- **Milk Sales Ledger**: Log dispatches to dairy cooperatives (Amul, Mother Dairy), bulk sweet makers, or village direct deliveries with payment status (*Paid*, *Pending*, *Partial*).
- **Financial Analytics**: Donut chart breakdown of operational overheads and net margin calculation.

### 5. 🤖 Bilingual AI Advisor (`/ai-advisor`)
- **Bilingual Conversations**: Seamless English and Hindi (हिन्दी) support.
- **Domain Specialization**: Nutritional guidelines (TMR ration formulation, bypass fat, mineral mixtures), milk yield optimization, and vaccination schedules.
- **Veterinary Safety Safeguard**: Adheres to strict medical safety guidelines; clearly warns farmers that AI is for advisory purposes and prompts immediate veterinary intervention for acute illnesses (such as Mastitis or high fever).

### 6. 📑 Reports & Analytics (`/reports`)
- **Multi-Module Reporting**: Production logs, profit & loss statements, and livestock rankings.
- **Timeframe Filtering**: Last 7 days, Last 30 days, All time.
- **One-Click CSV Export**: Directly generates and downloads standard CSV spreadsheet files.
- **Print / PDF Formatted Export**: Clean print media stylesheet for physical filing and bank loan documentation.

### 7. ⚙️ Farm Settings (`/settings`)
- Farm profile configuration (Farm name, Owner name, Location, Dairy registration number).
- Alert preferences (Low yield alert threshold, vaccination advance reminder days, daily milk target).
- One-click **Reset to Demo Data** button to quickly restore rich sample datasets.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts (AreaChart, BarChart, PieChart)
- **Icons**: Lucide React
- **Forms & Validation**: React Hook Form with Zod schemas
- **HTTP Client**: Axios with client/server fallbacks
- **State Management**: Reactive in-memory and local storage synchronizer (`src/lib/store.ts`)

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.x
- npm

### Installation
```bash
# Clone or navigate into the project directory
cd "DairyMitra AI"

# Dependencies are already installed, or install via:
npm install

# Build for production
npm run build

# Start production server
npm start
```
The application will be accessible at [http://localhost:3000](http://localhost:3000).
