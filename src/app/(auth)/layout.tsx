import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentification - CRM Influenceurs",
  description: "Connexion à votre CRM pour agences d'influenceurs",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      {children}
    </div>
  );
}

