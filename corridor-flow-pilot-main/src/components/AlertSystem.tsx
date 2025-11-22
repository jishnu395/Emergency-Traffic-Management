import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, AlertTriangle, Siren } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AlertSystemProps {
  ambulanceData: {
    isActive: boolean;
    from: string;
    to: string;
    isCritical: boolean;
    currentLocation: [number, number];
  };
}

export default function AlertSystem({ ambulanceData }: AlertSystemProps) {
  const [showCriticalAlert, setShowCriticalAlert] = useState(false);
  const [alertHistory, setAlertHistory] = useState<Array<{
    id: string;
    message: string;
    isCritical: boolean;
    timestamp: Date;
  }>>([]);

  useEffect(() => {
    if (ambulanceData.isActive) {
      const alertId = `alert-${Date.now()}`;
      const message = `Ambulance has started from ${ambulanceData.from} – Clear the corridor immediately.`;
      
      // Add to alert history
      setAlertHistory(prev => [{
        id: alertId,
        message,
        isCritical: ambulanceData.isCritical,
        timestamp: new Date()
      }, ...prev.slice(0, 4)]); // Keep only last 5 alerts

      if (ambulanceData.isCritical) {
        // Show critical alert banner
        setShowCriticalAlert(true);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
          setShowCriticalAlert(false);
        }, 10000);
      } else {
        // Show normal toast notification
        toast({
          title: "🚨 Ambulance Dispatched",
          description: message,
          duration: 5000,
        });
      }
    }
  }, [ambulanceData.isActive, ambulanceData.from, ambulanceData.isCritical]);

  return (
    <>
      {/* Critical Alert Banner */}
      {showCriticalAlert && ambulanceData.isCritical && (
        <div className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top">
          <Alert className="rounded-none border-0 bg-destructive text-destructive-foreground shadow-2xl animate-pulse">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <Siren className="h-6 w-6 animate-bounce" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="border-white text-white bg-white/10 font-bold animate-pulse">
                      CRITICAL EMERGENCY
                    </Badge>
                  </div>
                  <AlertDescription className="text-white font-medium text-lg">
                    🚨 CRITICAL: Ambulance has started from {ambulanceData.from} – CLEAR THE CORRIDOR IMMEDIATELY!
                  </AlertDescription>
                  <div className="text-white/90 text-sm mt-1">
                    Destination: {ambulanceData.to} | Priority: MAXIMUM
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {Math.floor(Math.random() * 8) + 3}m
                  </div>
                  <div className="text-xs text-white/80">ETA</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCriticalAlert(false)}
                  className="text-white hover:bg-white/20 shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Alert>
          
          {/* Flashing border effect */}
          <div className="absolute inset-0 border-4 border-white animate-pulse pointer-events-none"></div>
        </div>
      )}

      {/* Alert History Panel */}
      {alertHistory.length > 0 && (
        <div className="fixed top-20 right-4 w-80 z-40 space-y-2 max-h-96 overflow-y-auto">
          {alertHistory.map((alert) => (
            <Alert 
              key={alert.id}
              className={`glass-panel animate-in slide-in-from-right ${
                alert.isCritical 
                  ? 'border-destructive/50 bg-destructive/10' 
                  : 'border-primary/50 bg-primary/10'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {alert.isCritical ? (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    ) : (
                      <Siren className="h-4 w-4 text-primary" />
                    )}
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        alert.isCritical 
                          ? 'border-destructive text-destructive' 
                          : 'border-primary text-primary'
                      }`}
                    >
                      {alert.isCritical ? 'CRITICAL' : 'NORMAL'}
                    </Badge>
                  </div>
                  <AlertDescription className="text-sm">
                    {alert.message}
                  </AlertDescription>
                  <div className="text-xs text-muted-foreground mt-1">
                    {alert.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAlertHistory(prev => prev.filter(a => a.id !== alert.id))}
                  className="shrink-0 h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </Alert>
          ))}
        </div>
      )}
    </>
  );
}