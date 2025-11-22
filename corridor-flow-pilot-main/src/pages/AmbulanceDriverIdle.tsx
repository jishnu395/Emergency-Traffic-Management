import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ambulance, Bell, LogOut } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface DispatchMessage {
  pickupLocation: string;
  dropLocation: string;
  area: string;
  isCritical: boolean;
}

export default function AmbulanceDriverIdle() {
  const navigate = useNavigate();
  const [mission, setMission] = useState<DispatchMessage | null>(null);

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('auth-ambulance-driver');
    if (!isAuthenticated) {
      navigate("/");
    }

    const dispatchChannel = new BroadcastChannel('dispatch-channel');
    const handleDispatch = (event: MessageEvent<DispatchMessage>) => {
      setMission(event.data);
      toast({
        title: "🚨 New Mission Received!",
        description: `Dispatch for ${event.data.area}`,
        duration: 10000,
      });
    };

    dispatchChannel.addEventListener('message', handleDispatch);

    return () => {
      dispatchChannel.removeEventListener('message', handleDispatch);
      dispatchChannel.close();
    };
  }, [navigate]);

  const handleAcceptMission = () => {
    if (mission) {
      navigate(`/dashboard/ambulance-driver/${mission.area.replace(' ', '-')}`);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('auth-ambulance-driver');
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Ambulance className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Ambulance Driver - Idle</h1>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleLogout}
            className="text-white hover:bg-white/20"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto p-6 flex justify-center items-center min-h-[80vh]">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Bell className="h-6 w-6" />
              {mission ? "New Mission Received!" : "Waiting for Dispatch"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {mission ? (
              <div className="text-left space-y-4">
                <div>
                  <p className="font-semibold">Area:</p>
                  <p>{mission.area.toUpperCase()}</p>
                </div>
                <div>
                  <p className="font-semibold">Pickup Location:</p>
                  <p>{mission.pickupLocation}</p>
                </div>
                <div>
                  <p className="font-semibold">Drop Location:</p>
                  <p>{mission.dropLocation}</p>
                </div>
                {mission.isCritical && (
                  <div className="text-red-500 font-bold">
                    THIS IS A CRITICAL MISSION
                  </div>
                )}
                <Button 
                  onClick={handleAcceptMission}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  Accept Mission
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">
                You are currently idle. You will be notified when a new mission is dispatched to you.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
