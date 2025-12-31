# Tynys IoT Dashboard

This is a [Next.js](https://nextjs.org) IoT data visualization platform with real-time sensor monitoring and historical analytics.

## Features

### 🔐 Authentication
- Secure authentication using NextAuth.js
- Email/password authentication
- Role-based access control (Admin/User)
- User management and session handling

### 🛡️ Admin Dashboard
- **System-wide monitoring** with comprehensive metrics:
  - Total users and new signups tracking
  - System-wide data points and sensor readings
  - Active sensor monitoring
- **User Management**:
  - View all registered users in interactive table
  - Role management (Admin/User)
  - User activity tracking
- **Advanced Analytics**:
  - Real-time sensor charts
  - Sensor statistics (min, max, avg)
  - Top sensor distribution
  - Recent activity feed from all users
- **Access Control**: Admin-only access with secure authentication

### 📊 User Dashboard
- Live sensor value display with animated "Real-Time" badge
- Key metrics cards showing:
  - Total data points
  - Active sensors
  - Recent readings count
  - Average sensor values

### 📈 Interactive Line Chart Visualization
The dashboard includes a powerful interactive chart component built with Recharts featuring:

- **Real-Time Badge**: Displays the most recent sensor value with location, transport type, and timestamp
- **Advanced Filtering**:
  - Filter by Sensor ID
  - Filter by Location
  - Filter by Transport Type
  - Date range filtering (Start Date & End Date)
- **Live Statistics**: Min, Max, Average, and data point count for filtered data
- **Responsive Design**: Optimized for all screen sizes

### 📥 Data Ingestion API
- REST API endpoint for bulk sensor data uploads
- CSV format support with validation
- Batch processing for efficient data insertion
- Supports two CSV formats:

**Basic Format (3 columns)**:
```csv
timestamp,sensor_id,value
2025-12-29T10:00:00.000Z,sensor_001,23.5
```

**Extended Format (5 columns)**:
```csv
timestamp,sensor_id,value,location,transport_type
2025-12-29T10:00:00.000Z,sensor_001,23.5,warehouse_a,truck
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- OAuth provider credentials (Google and/or GitHub)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tynys
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (create a `.env.local` file):
```env
# Database
DATABASE_URL=your_postgres_connection_string

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# OAuth Providers
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret

# IoT Device Authentication
IOT_DEVICE_SECRET=your_iot_device_secret
```

See `MIGRATION_GUIDE.md` for detailed instructions on setting up OAuth providers.

4. Run database migrations:
```bash
# Push schema changes
npx drizzle-kit push

# Or run the migration SQL manually
psql $DATABASE_URL < drizzle/0003_make_clerkid_optional.sql
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the dashboard.

## Admin Dashboard Setup

To access the admin dashboard with full system monitoring and user management:

1. Create a user account through the sign-up page
2. Set admin privileges for your account:

```bash
npm run set:admin your-email@example.com
```

3. Sign in and navigate to `/dashboard` to access the admin dashboard

For detailed admin dashboard documentation, see `ADMIN_DASHBOARD.md`.

## Data Ingestion

Send CSV data to the ingestion endpoint:

```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Authorization: Bearer YOUR_IOT_DEVICE_SECRET" \
  -H "Content-Type: text/csv" \
  --data-binary @sample-data-extended.csv
```

See `sample-data-extended.csv` for an example format.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
