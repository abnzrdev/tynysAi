import { SessionProvider } from "@/components/session-provider";
import { ThemeProvider } from "@/components/theme-provider";

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SessionProvider>{children}</SessionProvider>
    </ThemeProvider>
  );
}
