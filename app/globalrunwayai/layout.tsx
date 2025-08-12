// app/globalrunwayai/layout.tsx
import type { Metadata } from 'next';
import './globals.css'; // ← this is the key: route-scoped CSS

export const metadata: Metadata = {
  title: 'GLOBALRUNWAYAI',
  description: 'Clean, minimal social UI for the Global Runway route.',
};

export default function GlobalRunwayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No <html>/<body> here—only the root layout should render those.
  return <>{children}</>;
}
