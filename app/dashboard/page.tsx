import { redirect } from "next/navigation";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getUserByEmail,
  getAllUsers,
  getSystemStats,
  getRecentSensorReadings,
  getAllIoTDataWithUsers,
  getUserAggregateData,
} from "@/lib/data-access";
import { getSession } from "@/lib/auth";
import { DashboardClient } from "./dashboard-client";

export default async function AdminDashboardPage() {
  // Get the current session
  const session = await getSession();

  // Redirect to sign-in if not authenticated
  if (!session || !session.user) {
    redirect("/api/auth/signin");
  }

  // Fetch user from database using email
  const user = await getUserByEmail(session.user.email!);

  // If user doesn't exist, show error
  if (!user) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <Card>
            <CardHeader>
              <CardTitle>Account Setup Error</CardTitle>
              <CardDescription>
                Your account was not properly set up. Please try signing out and signing in again.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  // Check if user is admin
  const isAdmin = user.isAdmin === 'true';

  // Fetch data - admin users get more comprehensive data
  const [systemStats, allUsers, sensorReadings, recentIoTData, userAggregateData] = await Promise.all([
    getSystemStats(),
    isAdmin ? getAllUsers() : Promise.resolve([]),
    getRecentSensorReadings(500),
    getAllIoTDataWithUsers(50),
    isAdmin ? getUserAggregateData() : Promise.resolve([]),
  ]);

  // Calculate additional metrics
  const uniqueSensors = new Set(sensorReadings.map((r) => r.sensorId));
  const activeSensors = uniqueSensors.size;

  const avgSensorValue =
    sensorReadings.length > 0
      ? (
          sensorReadings.reduce((sum, r) => sum + r.value, 0) /
          sensorReadings.length
        ).toFixed(2)
      : "0.00";

  // Calculate user growth (users created in last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const newUsersCount = allUsers.filter(
    (u) => new Date(u.createdAt) >= sevenDaysAgo
  ).length;

  return (
    <DashboardClient
      user={user}
      systemStats={systemStats}
      allUsers={allUsers}
      activeSensors={activeSensors}
      avgSensorValue={avgSensorValue}
      sensorReadings={sensorReadings}
      recentIoTData={recentIoTData}
      newUsersCount={newUsersCount}
      userAggregateData={userAggregateData}
    />
  );
}

