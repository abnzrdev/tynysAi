import { redirect } from "next/navigation";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserByEmail, getRecentSensorReadings } from "@/lib/data-access";
import { getSession } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { type Locale } from "@/lib/i18n/config";
import { DashboardClient } from "./dashboard-client";

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

  const sensorReadings = await getRecentSensorReadings(user.id, 500);

  return (
    <div className="dashboard-shell min-h-screen bg-background overflow-x-hidden">
      <div className="mx-auto max-w-7xl space-y-10 p-4 text-[17px] md:p-6 md:text-[18px] lg:p-8 overflow-x-hidden">
        <DashboardClient readings={sensorReadings} dict={dict.dashboardPage} />
      </div>
    </div>
  );
}

