# City of the Future 🌍

> A carbon footprint tracking application designed to help citizens in future cities reduce their environmental impact through automated emission calculations and interactive engagement mechanisms.

## Overview

A carbon emission tracking application that automatically calculates users' carbon emissions from transportation and purchases, and presents Earth's "happiness level" through an interactive visualization system.

## Key Features

### 🌱 Automatic Carbon Emission Tracking

- **Transportation Emissions**: Calculates emissions from GPS location tracking and movement distance
- **Purchase Emissions**: Analyzes invoice/receipt data to calculate purchase-related emissions
- **Real-time Calculations**: Continuous monitoring of carbon footprint

### 🌍 Earth Happiness Visualization

Interactive Earth status system reflecting daily carbon emissions:

- **Lush & Thriving** (< 100 kg CO₂)
- **Slight Fluctuations** (100–150 kg CO₂)
- **Needs Attention** (150–180 kg CO₂)
- **Alert Status** (180–200 kg CO₂)
- **Emergency State** (> 200 kg CO₂)

### 📊 Comprehensive Dashboard

- Daily, weekly, and monthly statistics
- Category breakdown and trend analysis
- Achievement system and leaderboard

### 🗺️ Interactive Map

- Route visualization from GPS tracking
- Green restaurant locations overlay
- Location-based emission tracking

### 💬 Real Chatbot

- Interactive environmental assistant ("Elf")
- Personalized recommendations for reducing carbon footprint

### 📱 Smart Features

- **AI Text Similarity Matching**: Matches product names from invoices with carbon-labeled products using multiple algorithms (exact match, contains match, Dice coefficient, word matching)
- **Travel Mode Detection**: Automatically detects travel modes (walking, biking, scooter, car) based on GPS speed
- **Invoice Integration**: Parses electronic invoices to calculate purchase-related emissions
- **GPS & Health Kit Integration**: Tracks location and physical activity data

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Runtime**: Node.js 22
- **Language**: TypeScript
- **Database**: PostgreSQL with PostGIS (spatial extensions)
- **ORM**: Prisma
- **UI Framework**: React 19
- **Styling**: Tailwind CSS 4
- **API Framework**: Hono
- **State Management**: TanStack Query (React Query)
- **Maps**: MapLibre GL
- **Validation**: [Zod](https://zod.dev/) - TypeScript-first schema validation library
- **Text Similarity**: string-similarity - AI-powered text matching for product name comparison
- **Package Manager**: pnpm

## APIs and External Services

### Official Government APIs

- **Electronic Invoice Application API**: [API 規格](https://www.einvoice.nat.gov.tw/static/ptl/ein_upload/attachments/1693297176294_0.pdf) - Retrieve product names and quantities from invoices
- **Product Carbon Footprint Information Network**: [產品碳足跡資訊網](https://cfp-calculate.tw/cfpc/Carbon/WebPage/visitors/FLProductinfo.aspx) - Map product names to carbon emissions data
- **Net Zero Green Living Information Platform**: [淨零綠生活資訊平台](https://greenlifestyle.moenv.gov.tw/categories/restaurant) - Find green-certified restaurants

### Third-Party APIs

- **Climatiq.io**: [Climatiq.io](https://www.climatiq.io/) - Transportation to carbon emissions conversion
- **GPS Location**: [Google Maps Geolocation API](https://developers.google.com/maps/documentation/geolocation/overview?hl=zh-tw) - Track movement and calculate travel distance
- **Health Kit**: [Apple HealthKit](https://developer.apple.com/documentation/healthkit) - Track physical activity data

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd web
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://postgres:password@postgres-db.face-on-keyboard-web.orb.local:5432/web
NODE_ENV=development
INVOICE_API_BASE_URL=http://localhost:3001
```

**Note**: If using Docker Desktop (not OrbStack), replace the domain with `localhost` in `DATABASE_URL`.

### 4. Start the Database

```bash
docker compose up -d
```

### 5. Run Database Migrations

```bash
pnpm db:generate
# or
pnpm db:push
```

### 6. (Optional) Seed Database and Import Carbon Labels

```bash
pnpm db:seed
pnpm db:import-carbon
```

### 7. Start the Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

## Database Models

- **Invoice**: Electronic invoice/receipt data
- **InvoiceDetail**: Individual items from invoices
- **CarbonLabel**: Carbon-labeled products database for matching purchases
- **Segments**: Travel segments with GPS coordinates, timestamps, travel mode, and CO₂ emissions

## Carbon Calculation

### Transportation Emissions

Travel mode detection based on GPS speed:

- **Walking** (< 5 km/h): 0 kg CO₂/km
- **Biking** (5–25 km/h): 0.1 kg CO₂/km
- **Scooter** (25–80 km/h): 0.2 kg CO₂/km
- **Car** (> 80 km/h): 0.5 kg CO₂/km

Distance is calculated using geospatial calculations, and emissions are computed by multiplying distance by the emission factor for the detected mode.

### Purchase Emissions

Uses AI text similarity matching to match product names from invoices with carbon-labeled products:

- **Exact Match**: Perfect string matches (score: 1.0)
- **Contains Match**: Substring matching (0.8-1.0)
- **Dice Coefficient**: Bigram similarity (threshold: > 0.6)
- **Word Matching**: Common word detection (score: 0.7 × word ratio)

Only matches with similarity scores ≥ 0.3 are considered valid.

## Development

- **Code Quality**: Uses Biome for formatting and linting (`pnpm check:write`)
- **Database**: Prisma Studio (`pnpm db:studio`) for database inspection
- **API**: Built with Hono, located in `src/app/api/`

## Acknowledgments

This project is part of the "City of the Future" initiative, aimed at creating sustainable urban solutions through technology.
