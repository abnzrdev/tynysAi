import { getDictionary } from '@/lib/i18n/dictionaries';
import { type Locale } from '@/lib/i18n/config';
import { getSession } from '@/lib/auth';
import { HomePage } from './home-page-client';

export default async function Page({ params }: { params: { lang: Locale } }) {
  // Check if user is authenticated
  const session = await getSession();
  
  const dict = await getDictionary(params.lang);
  return <HomePage dict={dict} lang={params.lang} session={session} />;
}

