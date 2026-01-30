import { redirect } from "next/navigation";
import { SensorAnalytics } from "@/components/analytics/SensorAnalytics";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import { getUserByEmail, getRecentSensorReadings } from "@/lib/data-access";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { type Locale } from "@/lib/i18n/config";
import DashboardFooter from "@/components/Layout/DashboardFooter";

export default async function AnalyticsPage({ params }: { params: { lang: Locale } }) {
  const dict = await getDictionary(params.lang);
  const session = await getSession();

  if (!session || !session.user) {
    redirect(`/${params.lang}/sign-in`);
  }

  const user = await getUserByEmail(session.user.email!);

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <Card>
            <CardHeader>
              <CardTitle>{dict.dashboardPage.accountSetupError}</CardTitle>
              <CardDescription>{dict.dashboardPage.accountSetupErrorDesc}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  let sensorReadings: Awaited<ReturnType<typeof getRecentSensorReadings>> = [];
  try {
    sensorReadings = await getRecentSensorReadings(user.id, 1000);
  } catch (error) {
    console.error("Failed to fetch sensor readings for analytics:", error);
    sensorReadings = [];
  }

  return (
    <div className="dashboard-shell min-h-screen bg-background overflow-x-hidden flex flex-col">
      <div className="flex-1 mx-auto max-w-7xl space-y-10 p-4 text-[17px] md:p-6 md:text-[18px] lg:p-8">
        <SensorAnalytics data={sensorReadings} />
      </div>
      <DashboardFooter />
    </div>
  );
}
