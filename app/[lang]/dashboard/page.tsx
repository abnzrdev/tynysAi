import { redirect } from "next/navigation";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUserByEmail, getRecentSensorReadings } from "@/lib/data-access";
import { getSession } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { type Locale } from "@/lib/i18n/config";
import { DashboardClient } from "./dashboard-client";
import DashboardFooter from "@/components/Layout/DashboardFooter";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const dict = await getDictionary(params.lang);

  // Get the current session — redirect on failure or missing auth
  let session;
  try {
    session = await getSession();
  } catch (error) {
    console.error("Failed to fetch session (DB may be unavailable):", error);
    redirect(`/${params.lang}/sign-in`);
  }

  // Redirect to sign-in if not authenticated
  if (!session || !session.user) {
    redirect(`/${params.lang}/sign-in`);
  }

  // Fetch user from database using email
  let user;
  try {
    user = await getUserByEmail(session.user.email!);
  } catch (error) {
    console.error("Failed to fetch user (DB may be unavailable):", error);
    user = null;
  }

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

  // Fetch sensor readings with error handling
  let sensorReadings: Awaited<ReturnType<typeof getRecentSensorReadings>> = [];
  try {
    sensorReadings = await getRecentSensorReadings(user.id, 500);
  } catch (error) {
    console.error("Failed to fetch sensor readings:", error);
    // Return empty array to prevent page crash, dashboard will show empty state
    sensorReadings = [];
  }

  return (
    <div className="dashboard-shell min-h-screen bg-background overflow-x-hidden flex flex-col">
      <div className="flex-1 mx-auto max-w-7xl space-y-10 p-4 text-[17px] md:p-6 md:text-[18px] lg:p-8 overflow-x-hidden">
        <DashboardClient readings={sensorReadings} dict={dict.dashboardPage} />
      </div>
      <DashboardFooter />
    </div>
  );
}
