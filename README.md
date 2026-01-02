# Tynys AI: Intelligent Platform for Real-Time Air Quality Monitoring

<div align="center">

![Tynys AI](tynys-logo.png)

**Intelligent IoT Platform for Indoor Air Quality Monitoring in Public Transport**

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

[Website](https://tynys.kz) • [Documentation](#documentation) • [Features](#features) • [Getting Started](#getting-started)

</div>

---

## 📖 Abstract

Tynys AI is an integrated IoT platform designed for autonomous monitoring, analysis, and visualization of indoor air quality (IAQ) within dynamic enclosed environments. The system is designed to process environmental data from custom hardware units, providing actionable insights for transit operators and urban planners to ensure public health safety in buses, metro trains, and trolleybuses.

**Keywords:** *Internet of Things (IoT), Indoor Air Quality (IAQ), Environmental Monitoring, Smart Cities, Public Transport, Data Visualization*

---

## 🎯 Project Overview

### Vision

Air quality in high-density public transportation is a critical factor in urban public health. High concentrations of Particulate Matter (PM) and CO₂ in enclosed spaces like metro cars and buses can lead to significant health risks. Tynys AI addresses the lack of real-time, granular data regarding mobile environmental conditions.

### Current Implementation Status

The current version implements a **cloud-based data visualization and management platform** that:
- Accepts sensor data uploads via REST API (CSV format)
- Stores time-series environmental data in PostgreSQL
- Provides real-time dashboards for monitoring air quality metrics
- Supports multi-language interfaces (English, Russian, Kazakh)
- Implements role-based access control for operators and administrators

### Architecture Philosophy

The platform follows a modular, scalable architecture designed to eventually support:
- Edge computing on IoT devices
- MQTT-based real-time telemetry
- Machine learning analytics for pollution prediction
- Multi-device fleet management

---

## ✨ Features

### 🔐 Authentication & Authorization
- **Secure Authentication**: Built with NextAuth.js
- **Multiple Auth Methods**: Email/password authentication
- **Role-Based Access Control (RBAC)**: Separate permissions for Users and Admins
- **Session Management**: Secure session handling with JWT tokens

### 👤 User Dashboard
- **Real-Time Monitoring**: Live sensor value display with animated status indicators
- **Key Performance Metrics**:
  - Total data points ingested
  - Active sensors count
  - Recent readings statistics
  - Average sensor values
- **Interactive Visualizations**: Line charts with time-series data
- **Advanced Filtering**: Filter by sensor ID, location, transport type, and date range
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### 🛡️ Admin Dashboard
- **System-Wide Analytics**:
  - Total users and registration trends
  - System-wide data points and sensor readings
  - Active sensor fleet monitoring
- **User Management**:
  - View all registered users in an interactive table
  - Role management (Admin/User privileges)
  - User activity tracking and analytics
- **Advanced Insights**:
  - Real-time sensor charts across all users
  - Statistical analysis (min, max, average values)
  - Top sensor distribution analysis
  - Recent activity feed from entire system

### 📊 Data Visualization
- **Interactive Charts**: Built with Recharts for smooth, responsive visualizations
- **Real-Time Badge**: Shows the most recent sensor reading with full metadata
- **Multi-Dimensional Filtering**:
  - Sensor ID filtering
  - Location-based filtering
  - Transport type filtering
  - Date range selection
- **Live Statistics**: Automatically calculated min, max, average, and count
- **Export Capabilities**: (Roadmap feature)

### 📥 Data Ingestion API
- **REST API Endpoint**: `/api/ingest` for bulk sensor data uploads
- **CSV Format Support**: Flexible schema with validation
- **Batch Processing**: Efficient bulk insertion for high-volume data
- **Error Handling**: Graceful handling of malformed data with detailed error reporting
- **Authentication**: Bearer token authentication for IoT devices

#### Supported CSV Formats

**Basic Format (3 columns)**:
```csv
timestamp,sensor_id,value
2026-01-02T10:00:00.000Z,sensor_001,23.5
2026-01-02T10:05:00.000Z,sensor_001,24.1
```

**Extended Format (5 columns)**:
```csv
timestamp,sensor_id,value,location,transport_type
2026-01-02T10:00:00.000Z,sensor_001,450.0,Bus_Route_32,Bus
2026-01-02T10:05:00.000Z,sensor_002,12.5,Metro_Line_1,Metro
```

### 🌍 Internationalization
- **Multi-Language Support**: English (en), Russian (ru), Kazakh (kz)
- **Automatic Detection**: Locale detection from browser preferences
- **Dynamic Switching**: Change language on-the-fly
- **SEO Optimized**: Locale-based routing for better search engine visibility

### 🎨 User Interface
- **Modern Design**: Built with shadcn/ui components
- **Dark Mode**: Full dark mode support with system preference detection
- **Accessibility**: ARIA-compliant components for screen readers
- **Responsive Layout**: Mobile-first design approach

---

## 🏗️ Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 (App Router) | Server-side rendering, static generation |
| **UI Framework** | React 18 | Component-based UI development |
| **Language** | TypeScript 5 | Type-safe development |
| **Styling** | Tailwind CSS 3.4 | Utility-first CSS framework |
| **UI Components** | shadcn/ui | Pre-built accessible components |
| **Charts** | Recharts 3.6 | Data visualization |
| **Authentication** | NextAuth.js 4 | Authentication and session management |
| **Database** | PostgreSQL 15+ | Relational database with time-series support |
| **ORM** | Drizzle ORM | Type-safe database queries |
| **Password Hashing** | bcryptjs | Secure password storage |
| **Internationalization** | Custom i18n | Multi-language support |
| **Theme Management** | next-themes | Dark/light mode management |

### Development Tools
- **Package Manager**: npm
- **Linter**: ESLint
- **Database Migrations**: Drizzle Kit
- **Environment Variables**: dotenv

---

## 🗄️ Database Schema

### Tables

#### `users`
Stores user account information with authentication credentials.
```typescript
{
  id: serial (Primary Key)
  clerkId: text (Unique, Optional - for legacy support)
  name: text (Required)
  email: text (Unique, Required)
  password: text (Hashed password)
  isAdmin: text (Default: 'false')
  createdAt: timestamp (Default: now())
}
```

#### `sensor_readings`
Time-series sensor data with optional metadata.
```typescript
{
  id: serial (Primary Key)
  timestamp: timestamp (Required - ISO-8601)
  sensorId: text (Required)
  value: double precision (Required)
  location: text (Optional)
  transportType: text (Optional)
  ingestedAt: timestamp (Default: now())
}
```

#### `iot_data`
Legacy table for JSON payload storage (user-specific data).
```typescript
{
  id: serial (Primary Key)
  timestamp: timestamp (Default: now())
  dataPayload: jsonb (Required)
  userId: integer (Foreign Key → users.id)
}
```

#### `devices`
Device registry for IoT unit management (prepared for future use).
```typescript
{
  id: serial (Primary Key)
  serial: text (Unique, Required)
  type: text (Required)
}
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher (comes with Node.js)
- **PostgreSQL**: Version 15 or higher
- **Git**: For cloning the repository

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/tynys.git
cd tynys
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/tynys
DB_URL=postgresql://username:password@localhost:5432/tynys

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl

# IoT Device Authentication
IOT_DEVICE_SECRET=your-iot-device-secret-token

# Optional: OAuth Providers (for future use)
# GOOGLE_CLIENT_ID=your_google_client_id
# GOOGLE_CLIENT_SECRET=your_google_client_secret
# GITHUB_ID=your_github_client_id
# GITHUB_SECRET=your_github_client_secret
```

**Generate NEXTAUTH_SECRET**:
```bash
openssl rand -base64 32
```

4. **Set up the database**

Create a PostgreSQL database:
```bash
createdb tynys
```

Run database migrations:
```bash
npx drizzle-kit push
```

5. **Create an admin user**

First, create an account through the sign-up page at `http://localhost:3000/en/sign-up`, then promote it to admin:

```bash
npm run set:admin your-email@example.com
```

6. **Start the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📊 Data Ingestion

### API Endpoint

**POST** `/api/ingest`

### Authentication

Include your IoT device secret in the Authorization header:

```bash
Authorization: Bearer YOUR_IOT_DEVICE_SECRET
```

### Example Usage

**Using cURL**:
```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Authorization: Bearer your-iot-device-secret" \
  -H "Content-Type: text/csv" \
  --data-binary @sample-data.csv
```

**Using Python**:
```python
import requests

csv_data = """timestamp,sensor_id,value,location,transport_type
2026-01-02T10:00:00.000Z,sensor_001,450.0,Bus_Route_32,Bus
2026-01-02T10:05:00.000Z,sensor_001,455.0,Bus_Route_32,Bus
2026-01-02T10:10:00.000Z,sensor_002,12.5,Metro_Line_1,Metro"""

headers = {
    'Authorization': 'Bearer your-iot-device-secret',
    'Content-Type': 'text/csv'
}

response = requests.post(
    'http://localhost:3000/api/ingest',
    headers=headers,
    data=csv_data
)

print(response.json())
```

### Response Format

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Data ingested successfully",
  "summary": {
    "totalLines": 10,
    "validReadings": 9,
    "skippedLines": 1,
    "inserted": 9
  },
  "timestamp": "2026-01-02T12:00:00.000Z"
}
```

**Error Response (400/401/500)**:
```json
{
  "error": "Error message",
  "details": "Detailed error description",
  "summary": {
    "totalLines": 10,
    "validReadings": 0,
    "skippedLines": 10,
    "inserted": 0
  }
}
```

---

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Seed dummy data
npm run seed:dummy

# Set admin privileges
npm run set:admin <email>
```

### Database Migrations

**Generate a new migration**:
```bash
npx drizzle-kit generate
```

**Push schema changes**:
```bash
npx drizzle-kit push
```

**View the database**:
```bash
npx drizzle-kit studio
```

### Project Structure

```
tynys/
├── app/                      # Next.js App Router
│   ├── [lang]/              # Internationalized routes
│   │   ├── dashboard/       # User dashboard
│   │   ├── sign-in/         # Authentication pages
│   │   ├── sign-up/
│   │   └── page.tsx         # Home page
│   ├── api/                 # API routes
│   │   ├── auth/            # NextAuth endpoints
│   │   └── ingest/          # Data ingestion endpoint
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── sensor-chart.tsx     # Chart visualization
│   ├── navbar.tsx           # Navigation bar
│   └── ...
├── lib/                     # Utility libraries
│   ├── db/                  # Database configuration
│   │   ├── index.ts         # Database client
│   │   └── schema.ts        # Drizzle schema
│   ├── i18n/                # Internationalization
│   │   ├── dictionaries/    # Translation files
│   │   └── config.ts
│   ├── auth.ts              # NextAuth configuration
│   ├── csv-parser.ts        # CSV parsing logic
│   └── data-access.ts       # Database queries
├── scripts/                 # Utility scripts
│   ├── seed-dummy-data.ts   # Data seeding
│   └── set-admin.ts         # Admin management
├── drizzle/                 # Database migrations
├── public/                  # Static assets
└── types/                   # TypeScript type definitions
```

---

## 🎭 Role-Based Access Control (RBAC)

### User Roles

#### 👤 Regular User
- View personal dashboard
- Upload sensor data (via API)
- View historical data
- Filter and analyze sensor readings
- Access multi-language interface

#### 🛡️ Administrator
- **All User permissions, plus:**
- View system-wide statistics
- User management
  - View all registered users
  - Manage user roles
  - Track user activity
- Access to all sensor data across the system
- System health monitoring
- Advanced analytics and reporting

### Setting Admin Privileges

```bash
# Promote a user to admin
npm run set:admin user@example.com

# The script will:
# 1. Find the user by email
# 2. Set isAdmin flag to 'true'
# 3. Confirm the update
```

---

## 🌐 Internationalization (i18n)

### Supported Languages

| Language | Code | Status |
|----------|------|--------|
| English | `en` | ✅ Complete |
| Russian | `ru` | ✅ Complete |
| Kazakh | `kz` | ✅ Complete |

### URL Structure

The application uses locale-prefixed URLs:
- English: `http://localhost:3000/en/dashboard`
- Russian: `http://localhost:3000/ru/dashboard`
- Kazakh: `http://localhost:3000/kz/dashboard`

### Adding a New Language

1. Create a new dictionary file:
```bash
touch lib/i18n/dictionaries/fr.json
```

2. Add translations based on existing dictionary structure

3. Update `lib/i18n/config.ts`:
```typescript
export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'ru', 'kz', 'fr'],
} as const;
```

4. Add language option to the language switcher component

---

## 🗺️ Roadmap & Future Development

### Phase 1: Hardware Integration (Planned)
- [ ] Raspberry Pi Zero 2W firmware development
- [ ] ZPHS01B sensor integration (CO₂, PM2.5, PM10, Temperature, Humidity)
- [ ] Real-time MQTT telemetry implementation
- [ ] Edge data processing and filtering
- [ ] Offline buffer mechanism with automatic sync

### Phase 2: Real-Time Communication (Planned)
- [ ] MQTT broker setup (Eclipse Mosquitto)
- [ ] WebSocket support for real-time dashboard updates
- [ ] Device fleet management interface
- [ ] OTA (Over-The-Air) firmware updates
- [ ] Device health monitoring

### Phase 3: Machine Learning & Analytics (Planned)
- [ ] Anomaly detection models (XGBoost, Random Forest)
- [ ] Air quality classification (Good, Moderate, Poor, Hazardous)
- [ ] Predictive maintenance for sensors
- [ ] Route optimization based on air quality
- [ ] Edge ML deployment on Raspberry Pi

### Phase 4: Advanced Features (Planned)
- [ ] TimescaleDB integration for optimized time-series queries
- [ ] LoRaWAN support for areas without Wi-Fi
- [ ] Public API for third-party integrations
- [ ] Mobile application (React Native)
- [ ] Real-time alerting system (SMS, Email, Push notifications)
- [ ] Export functionality (CSV, PDF reports)
- [ ] Advanced data comparison (route-to-route, vehicle-to-vehicle)

### Phase 5: Scale & Production (Planned)
- [ ] Docker containerization
- [ ] Kubernetes orchestration
- [ ] Load balancing for high-traffic scenarios
- [ ] CDN integration for global access
- [ ] Multi-tenant architecture
- [ ] Compliance certifications (GDPR, ISO)

---

## 🔬 Validation & Hardware Specifications

### Planned Hardware Components

| Component | Model | Specifications | Purpose |
|-----------|-------|----------------|---------|
| **Microcontroller** | Raspberry Pi Zero 2 W | Quad-core ARM Cortex-A53 @ 1GHz, 512MB RAM, Wi-Fi, Bluetooth | Edge processing |
| **Multi-Sensor Module** | ZPHS01B | All-in-one sensor package | Combined air quality monitoring |
| **CO₂ Sensor** | MH-Z19C | NDIR, 0-5000 ppm, ±50ppm accuracy | Carbon dioxide detection |
| **PM Sensor** | ZH06 | Laser scattering, PM2.5 & PM10 | Particulate matter detection |
| **Environmental Sensor** | ZS05 | Temperature & Humidity | Ambient conditions |

### Validation Methodology

The Tynys IoT device will be benchmarked against the **Qingping Air Quality Monitor Gen 2** (reference-grade device):
- PM2.5 correlation target: R² ≥ 0.85
- CO₂ deviation target: < ±5% in controlled environments
- Long-term stability: < 3% drift over 6 months

---

## 📝 API Documentation

### Authentication Endpoints

#### Sign Up
**POST** `/api/auth/signup`

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "User created successfully"
}
```

#### Sign In
**POST** `/api/auth/signin`

Uses NextAuth.js credentials provider. Access via the sign-in page or use session management.

### Data Endpoints

#### Ingest Sensor Data
**POST** `/api/ingest`

**Headers**:
```
Authorization: Bearer YOUR_IOT_DEVICE_SECRET
Content-Type: text/csv
```

**Body**: CSV formatted sensor data (see [Data Ingestion](#data-ingestion))

---

## 🚀 Deployment

### Production Environment Setup

1. **Production Environment Variables**

```env
# Production Database
DATABASE_URL=postgresql://user:password@production-db:5432/tynys
DB_URL=postgresql://user:password@production-db:5432/tynys

# NextAuth (use your production domain)
NEXTAUTH_URL=https://tynys.kz
NEXTAUTH_SECRET=<generate-strong-secret>

# IoT Device Secret
IOT_DEVICE_SECRET=<strong-random-token>
```

2. **Build the application**
```bash
npm run build
```

3. **Start production server**
```bash
npm start
```

### Deployment on VPS

**Recommended for production deployment on DigitalOcean, AWS, Azure, or similar platforms:**

```bash
# Install Node.js 18+ and PostgreSQL 15+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs postgresql

# Clone repository
git clone <repository-url>
cd tynys

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
nano .env.local

# Run database migrations
npx drizzle-kit push

# Build and start
npm run build
npm start
```

### Process Management

For production, use a process manager like PM2:

```bash
# Install PM2
npm install -g pm2

# Start the application
pm2 start npm --name "tynys" -- start

# Enable startup script
pm2 startup
pm2 save
```

### Docker Support
Docker containerization support is planned for Phase 5 of the roadmap.

---

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, improving documentation, or proposing new features, your help is appreciated.

# Contributing Guide

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/amanai-kz/aman-ai.git
cd aman-ai

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env

# 4. Run development server
npm run dev
```

## 🌿 Branch Naming

```
feature/issue-number-short-description
bugfix/issue-number-short-description
hotfix/critical-fix-description
```

**Examples:**
- `feature/1-simplify-reports`
- `bugfix/15-fix-pdf-export`
- `hotfix/auth-crash`

## 📝 Commit Messages

Use conventional commits format:

```
type(scope): description

[optional body]
[optional footer]
```

**Types:**
| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting, no code change |
| `refactor` | Code restructuring |
| `test` | Adding tests |
| `chore` | Maintenance tasks |

**Examples:**
```bash
feat(reports): add PDF export functionality
fix(auth): resolve login redirect issue
docs(readme): update installation steps
refactor(api): simplify consultation endpoint
```

## 🔄 Workflow

### 1. Start Working on an Issue

```bash
# Get latest changes
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/1-simplify-reports
```

### 2. Make Changes & Commit

```bash
# Stage changes
git add .

# Commit with message
git commit -m "feat(reports): remove sleep/mood/stress fields"

# Push to remote
git push origin feature/1-simplify-reports
```

### 3. Create Pull Request

1. Go to GitHub → Pull Requests → New
2. Select your branch → `main`
3. Fill in description:
   - What changes were made
   - Link to issue: `Closes #1`
   - Screenshots (if UI changes)
4. Request review from team member

### 4. After Review

```bash
# If changes requested, make them and push
git add .
git commit -m "fix(reports): address review comments"
git push origin feature/1-simplify-reports
```

### 5. Merge & Cleanup

After approval:
1. Squash and merge on GitHub
2. Delete the branch on GitHub
3. Locally:
```bash
git checkout main
git pull origin main
git branch -d feature/1-simplify-reports
```

## ⚠️ Rules

1. **Never push directly to `main`** - always use PRs
2. **One feature = one branch** - don't mix unrelated changes
3. **Keep PRs small** - easier to review
4. **Write clear commit messages** - future you will thank you
5. **Test before pushing** - run `npm run build` locally

## 🛠️ Useful Commands

```bash
# Check current branch
git branch

# See all branches
git branch -a

# Switch branch
git checkout branch-name

# See changes
git status
git diff

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Stash changes temporarily
git stash
git stash pop
```

## 📋 PR Checklist

Before submitting PR:
- [ ] Code builds without errors (`npm run build`)
- [ ] No console errors in browser
- [ ] Tested on localhost
- [ ] Commit messages follow convention
- [ ] PR description is clear
- [ ] Issue is linked

---

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Error
```
Error: Database connection failed
```
**Solution**: Verify your `DATABASE_URL` in `.env.local` and ensure PostgreSQL is running.

#### NextAuth Secret Error
```
Error: NEXTAUTH_SECRET is not set
```
**Solution**: Generate a secret with `openssl rand -base64 32` and add it to `.env.local`.

#### API Ingestion 401 Unauthorized
```
{ "error": "Unauthorized - Invalid credentials" }
```
**Solution**: Ensure your `Authorization` header matches the `IOT_DEVICE_SECRET` in your environment.

#### Module Not Found
```
Error: Cannot find module 'xyz'
```
**Solution**: Run `npm install` to install all dependencies.

---

## 📚 Documentation

- **[API Reference](#api-documentation)**: Complete API endpoint documentation
- **[Database Schema](#database-schema)**: Database structure and relationships
- **[Deployment Guide](#deployment)**: Production deployment instructions
- **[Contributing Guide](#contributing)**: How to contribute to the project

---

## 📄 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

```
MIT License

Copyright (c) 2026 Farabi AGI Center

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 👥 Research & Development

**Developed by**: Farabi AGI Center  
**Website**: [https://tynys.kz](https://tynys.kz)  
**Email**: contact@tynys.kz

### About Farabi AGI Center

The Farabi AGI Center is dedicated to advancing artificial intelligence and IoT solutions for smart cities and public health applications. The Tynys AI project represents our commitment to leveraging technology for improving urban air quality monitoring and public transportation safety.

### Acknowledgments

- **shadcn/ui** for the beautiful component library
- **Next.js** team for the powerful React framework
- **PostgreSQL** community for the robust database
- All contributors who help improve this project

---

<div align="center">

**Built with ❤️ for cleaner, safer public transportation**

[⬆ Back to Top](#tynys-ai-intelligent-platform-for-real-time-air-quality-monitoring)

</div>
