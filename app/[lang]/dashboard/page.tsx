import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getUserByEmail,
  getUserData,
  getRecentSensorReadings,
} from "@/lib/data-access";
import { SensorChart } from "@/components/sensor-chart";
import { getSession } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { type Locale } from "@/lib/i18n/config";

export default async function DashboardPage({ params }: { params: { lang: Locale } }) {
  const dict = await getDictionary(params.lang);
  
  // Get the current session
  const session = await getSession();

  // Redirect to sign-in if not authenticated
  if (!session || !session.user) {
    redirect(`/${params.lang}/sign-in`);
  }

  // Fetch user from database using email
  const user = await getUserByEmail(session.user.email!);

  // If user doesn't exist, show error
  // User should be created automatically during sign-in callback
  if (!user) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <Card>
            <CardHeader>
              <CardTitle>{dict.dashboardPage.accountSetupError}</CardTitle>
              <CardDescription>
                {dict.dashboardPage.accountSetupErrorDesc}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  // Fetch user's IoT data and sensor readings (filtered by userId for data isolation)
  const [iotDataRecords, sensorReadings] = await Promise.all([
    getUserData(user.id),
    getRecentSensorReadings(user.id, 500), // Fetch more data for better chart visualization
  ]);

  // Calculate metrics from the data
  const totalDataPoints = iotDataRecords.length;
  const recentReadings = sensorReadings.length;
  
  // Get unique sensor IDs
  const uniqueSensors = new Set(sensorReadings.map((r) => r.sensorId));
  const activeSensors = uniqueSensors.size;

  // Calculate average sensor value
  const avgSensorValue =
    sensorReadings.length > 0
      ? (
          sensorReadings.reduce((sum, r) => sum + r.value, 0) /
          sensorReadings.length
        ).toFixed(2)
      : "0.00";

  // Get recent activity (last 5 IoT data entries)
  const recentActivity = iotDataRecords
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{dict.dashboardPage.title}</h1>
          <p className="text-muted-foreground">
            {dict.dashboardPage.welcome.replace('{{name}}', user.name)}
          </p>
        </div>

        {/* Real-Time Status Section */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">{dict.dashboardPage.realTimeStatus}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Metric Card 1 - Total Data Points */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {dict.dashboardPage.totalDataPoints}
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalDataPoints.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {dict.dashboardPage.iotDataRecordsReceived}
                </p>
              </CardContent>
            </Card>

            {/* Metric Card 2 - Active Sensors */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {dict.dashboardPage.activeSensors}
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeSensors}</div>
                <p className="text-xs text-muted-foreground">
                  {dict.dashboardPage.uniqueSensorsReporting}
                </p>
              </CardContent>
            </Card>

            {/* Metric Card 3 - Recent Readings */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {dict.dashboardPage.recentReadings}
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <path d="M2 10h20" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recentReadings}</div>
                <p className="text-xs text-muted-foreground">
                  {dict.dashboardPage.lastSensorReadings}
                </p>
              </CardContent>
            </Card>

            {/* Metric Card 4 - Average Value */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {dict.dashboardPage.averageValue}
                </CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgSensorValue}</div>
                <p className="text-xs text-muted-foreground">
                  {dict.dashboardPage.meanSensorReading}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Historical Analytics Section */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold">{dict.dashboardPage.historicalAnalytics}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Main Chart */}
            <div className="col-span-full lg:col-span-4">
              <SensorChart data={sensorReadings} />
            </div>

            {/* Recent Activity */}
            <Card className="col-span-full md:col-span-1 lg:col-span-3">
              <CardHeader>
                <CardTitle>{dict.dashboardPage.recentIotData}</CardTitle>
                <CardDescription>
                  {dict.dashboardPage.latestDataIngestion}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      {dict.dashboardPage.noRecentActivity}
                    </p>
                  ) : (
                    recentActivity.map((activity) => {
                      const timestamp = new Date(activity.timestamp);
                      const timeStr = timestamp.toLocaleTimeString();
                      const dateStr = timestamp.toLocaleDateString();
                      
                      return (
                        <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              className="h-4 w-4"
                            >
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                            </svg>
                          </div>
                          <div className="flex-1 space-y-1 min-w-0">
                            <p className="text-sm font-medium leading-none">
                              {dict.dashboardPage.dataIngestion}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {dateStr} at {timeStr}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              ID: {activity.id}
                            </p>
                          </div>
                          <div className="text-xs text-muted-foreground flex-shrink-0">
                            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                              {dict.dashboardPage.success}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sensor Statistics */}
            <Card className="col-span-full md:col-span-1 lg:col-span-3">
              <CardHeader>
                <CardTitle>{dict.dashboardPage.sensorStatistics}</CardTitle>
                <CardDescription>
                  {dict.dashboardPage.keyMetrics}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {sensorReadings.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      {dict.dashboardPage.noSensorStats}
                    </p>
                  ) : (
                    (() => {
                      const values = sensorReadings.map((r) => r.value);
                      const minValue = Math.min(...values);
                      const maxValue = Math.max(...values);
                      const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
                      
                      // Normalize for display (0-100 scale for progress bars)
                      const range = maxValue - minValue || 1;
                      const normalizeValue = (val: number) => 
                        Math.round(((val - minValue) / range) * 100);

                      return (
                        <>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">{dict.dashboardPage.maximumValue}</span>
                              <span className="text-muted-foreground">{maxValue.toFixed(2)}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary w-[100%]" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">{dict.dashboardPage.averageValue}</span>
                              <span className="text-muted-foreground">{avgValue.toFixed(2)}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary" 
                                style={{ width: `${normalizeValue(avgValue)}%` }}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">{dict.dashboardPage.minimumValue}</span>
                              <span className="text-muted-foreground">{minValue.toFixed(2)}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary w-[0%]" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">{dict.dashboardPage.totalReadings}</span>
                              <span className="text-muted-foreground">{sensorReadings.length}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {dict.dashboardPage.range}: {minValue.toFixed(2)} - {maxValue.toFixed(2)}
                            </div>
                          </div>
                        </>
                      );
                    })()
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sensor Data Distribution */}
            <Card className="col-span-full md:col-span-1 lg:col-span-4">
              <CardHeader>
                <CardTitle>{dict.dashboardPage.sensorDataDistribution}</CardTitle>
                <CardDescription>
                  {dict.dashboardPage.recentReadingsBySensor}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sensorReadings.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      {dict.dashboardPage.noSensorData}
                    </p>
                  ) : (
                    (() => {
                      // Group readings by sensor ID and calculate counts
                      const sensorCounts = sensorReadings.reduce((acc, reading) => {
                        acc[reading.sensorId] = (acc[reading.sensorId] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>);

                      // Sort by count and take top 5
                      const topSensors = Object.entries(sensorCounts)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 5)
                        .map(([sensorId, count]) => ({
                          sensorId,
                          count,
                          percentage: Math.round((count / sensorReadings.length) * 100),
                        }));

                      return topSensors.map((sensor, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium truncate">{sensor.sensorId}</span>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-muted-foreground">
                                {sensor.count}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ({sensor.percentage}%)
                              </span>
                            </div>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${sensor.percentage}%` }}
                            />
                          </div>
                        </div>
                      ));
                    })()
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}

