import { useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePWA } from '@/hooks/usePWA';

export function InstallPrompt() {
  const { isInstallable, installApp } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if not installable or if dismissed
  if (!isInstallable || dismissed) return null;

  const handleInstall = async () => {
    const success = await installApp();
    if (success || !success) {
      setDismissed(true);
    }
  };

  return (
    <Card className="fixed bottom-20 left-4 right-4 z-50 md:bottom-4 md:left-auto md:right-4 md:w-80 border-primary bg-card shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Download className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Instalar BizLink</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Instale o BizLink no seu dispositivo para acesso rápido e experiência completa de app.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleInstall} size="sm" className="flex-1">
                Instalar App
              </Button>
              <Button 
                onClick={() => setDismissed(true)} 
                variant="outline" 
                size="sm"
              >
                Agora não
              </Button>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setDismissed(true)}
            className="ml-2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}