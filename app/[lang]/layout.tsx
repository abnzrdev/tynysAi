import { i18n, type Locale } from '@/lib/i18n/config';
import { LangLayoutClient } from './layout-client';

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  return (
    <LangLayoutClient locale={params.lang}>
      {children}
    </LangLayoutClient>
  );
}

