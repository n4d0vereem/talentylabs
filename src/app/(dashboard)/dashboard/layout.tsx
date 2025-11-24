// Force toutes les pages du dashboard en mode dynamique
export const dynamic = 'force-dynamic';

export default function DashboardPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}






