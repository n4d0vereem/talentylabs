import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

// Force dynamic rendering (nécessaire pour éviter les erreurs de pre-rendering)
export const dynamic = 'force-dynamic';

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Analytics
        </h1>
        <p className="text-gray-600">
          Analysez vos métriques et performances
        </p>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <CardTitle>Statistiques et analyses</CardTitle>
              <CardDescription>Fonctionnalité disponible prochainement</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="py-16 text-center">
            <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              Cette fonctionnalité sera disponible dans une prochaine version
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

