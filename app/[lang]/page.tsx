import { getDictionary } from '@/lib/i18n/dictionaries';
import { type Locale } from '@/lib/i18n/config';
import { getSession } from '@/lib/auth';
import { HomePage } from './home-page-client';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: { lang: Locale } }) {
  // Check if user is authenticated — gracefully degrade if DB is unreachable
  let session = null;
  try {
    session = await getSession();
  } catch (error) {
    console.error('Failed to fetch session (DB may be unavailable):', error);
  }

  const dict = await getDictionary(params.lang);
  return <HomePage dict={dict} lang={params.lang} session={session} />;
}

