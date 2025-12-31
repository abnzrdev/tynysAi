import { redirect } from 'next/navigation';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { type Locale } from '@/lib/i18n/config';
import { getSession } from '@/lib/auth';
import { HomePage } from './home-page-client';

export default async function Page({ params }: { params: { lang: Locale } }) {
  // Check if user is authenticated
  const session = await getSession();
  
  // If user is authenticated, redirect to dashboard
  if (session && session.user) {
    redirect(`/${params.lang}/dashboard`);
  }
  
  const dict = await getDictionary(params.lang);
  return <HomePage dict={dict} lang={params.lang} />;
}

