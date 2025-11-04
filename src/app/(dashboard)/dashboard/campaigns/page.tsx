import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone } from "lucide-react";

export default function CampaignsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Campagnes
        </h1>
        <p className="text-gray-600">
          Suivez et gérez vos campagnes marketing
        </p>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <Megaphone className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <CardTitle>Gestion des campagnes</CardTitle>
              <CardDescription>Fonctionnalité disponible prochainement</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="py-16 text-center">
            <Megaphone className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              Cette fonctionnalité sera disponible dans une prochaine version
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

