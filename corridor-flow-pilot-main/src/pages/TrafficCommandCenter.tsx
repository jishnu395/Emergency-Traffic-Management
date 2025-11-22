import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Shield, Bell, LogOut, Users, Activity } from "lucide-react";
import AmbulanceMap from "@/components/AmbulanceMap";
import TrafficSignalsList from "@/components/TrafficSignalsList";
import AlertSystem from "@/components/AlertSystem";
import { useNavigate } from "react-router-dom";

const areas = [
  "VV Puram",
  "MG Road", 
  "Whitefield",
  "Jayanagar",
  "Koramangala",
  "Hebbal",
  "Yeshwanthpur"
];

export default function TrafficCommandCenter() {
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [ambulanceData, setAmbulanceData] = useState({
    isActive: false,
    from: "",
    to: "",
    isCritical: false,
    currentLocation: [12.9716, 77.5946] as [number, number] // Bangalore coordinates
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const isAuthenticated = sessionStorage.getItem('auth-traffic-police');
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('auth-traffic-police');
    navigate("/");
  };

  // Simulate ambulance activity
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) { // 20% chance every 5 seconds
        setAmbulanceData({
          isActive: true,
          from: "Victoria Hospital",
          to: "Manipal Hospital",
          isCritical: Math.random() > 0.7, // 30% chance of critical
          currentLocation: [12.9716 + (Math.random() - 0.5) * 0.1, 77.5946 + (Math.random() - 0.5) * 0.1] as [number, number]
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AlertSystem ambulanceData={ambulanceData} />
      
      {/* Header */}
      <header className="bg-traffic text-white p-4 glass-panel border-b border-white/10">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">Bengaluru Traffic Police Command and Control Center</h1>
                {selectedArea && (
                  <p className="text-traffic-glow text-lg mt-1">
                    Area: {selectedArea}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-white/20 text-white">
                <Activity className="h-4 w-4 mr-1" />
                System Online
              </Badge>
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
          </div>
          
          {/* Area Selection */}
          <div className="flex items-center gap-4">
            <MapPin className="h-5 w-5" />
            <span className="text-lg">Select Posted Area:</span>
            <Select value={selectedArea} onValueChange={setSelectedArea}>
              <SelectTrigger className="w-64 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Choose your area..." />
              </SelectTrigger>
              <SelectContent>
                {areas.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {selectedArea ? (
        <main className="container mx-auto p-6">
          <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-250px)]">
            
            {/* Left Half - Map */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Live Ambulance Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full pb-6">
                <div className="h-full rounded-lg overflow-hidden">
                  <AmbulanceMap ambulanceData={ambulanceData} selectedArea={selectedArea} />
                </div>
              </CardContent>
            </Card>

            {/* Right Half - Traffic Signals */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-traffic" />
                  Traffic Signals on Route
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full pb-6">
          <TrafficSignalsList 
            pickupLocation={ambulanceData.from}
            dropLocation={ambulanceData.to}
          />
              </CardContent>
            </Card>
          </div>

          {/* Stats Footer */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            {[
              { label: "Active Signals", value: "32", color: "text-traffic" },
              { label: "Corridors Cleared", value: "5", color: "text-hospital" },
              { label: "Response Time", value: "2.3m", color: "text-primary" },
              { label: "Officers Online", value: "18", color: "text-accent" }
            ].map((stat, index) => (
              <Card key={index} className="glass-panel">
                <CardContent className="p-4 text-center">
                  <div className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      ) : (
        <div className="container mx-auto p-6">
          <Card className="glass-card max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <Users className="h-16 w-16 text-traffic mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Select Your Area</h3>
              <p className="text-muted-foreground">
                Please select your posted area from the dropdown above to access the command center.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}