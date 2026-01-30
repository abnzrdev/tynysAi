'use client';

import Link from 'next/link';

export function DashboardFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 py-4 px-6 text-sm">
      <div className="container mx-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-muted-foreground">
        <span className="font-medium text-gray-900 dark:text-gray-100">TynysAI © {year}</span>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">
            Privacy
          </Link>
          <Link href="/docs" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">
            Docs
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default DashboardFooter;
