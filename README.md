# Trading Tracker Performance

A personal trading journal and performance dashboard built with **Next.js**, **Prisma**, and **SQLite**. Track your trades day by day, visualise your P&L on an interactive calendar, monitor live prices, and analyse key statistics such as win rate and average risk/reward ratio.

---

## Features

- 📊 **Dashboard** – At-a-glance stats: Total P&L, Win Rate, Average Risk/Reward, Total Trades
- 📅 **Trading Calendar** – Daily colour-coded P&L overview
- 💹 **Live Price Widget** – Real-time asset prices on the dashboard
- 📝 **Trade Log** – Add, view, and manage individual trade entries
- 🗓️ **No-Trade Days** – Mark days where you intentionally sat out the market

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| ORM | [Prisma 5](https://www.prisma.io/) |
| Database | SQLite (local file `prisma/dev.db`) |
| Runtime | Node.js |

---

## Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9 (comes with Node.js)

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/ItsmeHelmy/Trading-Tracker-Performance.git
cd Trading-Tracker-Performance
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up the database

The project uses **SQLite** — no external database server needed. Prisma will create the `dev.db` file automatically.

```bash
# Generate the Prisma client
npm run db:generate

# Push the schema to the database (creates prisma/dev.db)
npm run db:push
```

> **Note:** Run `db:generate` whenever you change `prisma/schema.prisma`.  
> Run `db:push` to apply schema changes to the database.

---

## Running the App

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.  
The app hot-reloads on file changes.

### Production

```bash
# Build the optimised production bundle
npm run build

# Start the production server
npm start
```

---

## Essential Commands Reference

| Command | Description |
|---------|-------------|
| `npm install` | Install all project dependencies |
| `npm run dev` | Start the development server (hot reload) |
| `npm run build` | Build the app for production |
| `npm start` | Start the production server |
| `npm run db:generate` | Generate the Prisma client from the schema |
| `npm run db:push` | Push schema changes to the SQLite database |

---

## Project Structure

```
├── prisma/
│   ├── schema.prisma      # Database models (Trade, DailyRecord)
│   └── dev.db             # SQLite database file (auto-generated)
├── src/
│   ├── app/               # Next.js App Router pages & API routes
│   │   ├── page.tsx       # Dashboard page
│   │   ├── trades/        # Trade log page
│   │   ├── calendar/      # Calendar page
│   │   └── api/           # API route handlers
│   ├── components/        # Reusable UI components
│   ├── lib/
│   │   ├── prisma.ts      # Prisma client singleton
│   │   └── utils.ts       # Utility helpers
│   └── types/             # Shared TypeScript types
└── package.json
```

---

## Database Schema

### `Trade`

| Column | Type | Description |
|--------|------|-------------|
| `id` | Int | Auto-increment primary key |
| `date` | String | Trade date (YYYY-MM-DD) |
| `asset` | String | Traded asset symbol |
| `entry_price` | Float | Entry price |
| `exit_price` | Float | Exit price |
| `pnl` | Float | Profit & Loss |
| `risk_reward` | Float? | Risk/Reward ratio (optional) |
| `notes` | String | Trade notes |
| `createdAt` | DateTime | Record creation timestamp |

### `DailyRecord`

| Column | Type | Description |
|--------|------|-------------|
| `id` | Int | Auto-increment primary key |
| `date` | String | Date (unique, YYYY-MM-DD) |
| `no_trade` | Boolean | `true` if intentionally no trade that day |