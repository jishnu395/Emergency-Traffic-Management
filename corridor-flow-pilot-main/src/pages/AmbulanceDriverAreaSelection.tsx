import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Ambulance, MapPin, LogOut } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const availableAreas = [
  'rajajinagar',
  'mg road', 
  'whitefield',
  'jayanagar',
  'koramangala',
  'hebbal',
  'yeshwanthpur',
  'banashankari',
  'indiranagar',
  'electronic city'
];

export default function AmbulanceDriverAreaSelection() {
  const navigate = useNavigate();
  const [selectedArea, setSelectedArea] = useState("");

  const handleAreaSelection = () => {
    if (!selectedArea) {
      toast({
        title: "❌ Error",
        description: "Please select your active area",
        variant: "destructive"
      });
      return;
    }

    // Store selected area in sessionStorage
    sessionStorage.setItem('ambulance-active-area', selectedArea);
    
    // Navigate to ambulance dashboard
    navigate(`/dashboard/ambulance-driver/${selectedArea.replace(' ', '-')}`);
    
    toast({
      title: "✅ Area Selected",
      description: `You are now active in ${selectedArea.toUpperCase()}`,
      duration: 3000,
    });
  };

  const handleLogout = () => {
    sessionStorage.removeItem('auth-ambulance-driver');
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Ambulance className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Ambulance Driver - Area Selection</h1>
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
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-center">
              <MapPin className="h-6 w-6" />
              Select Your Active Area
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Active Area</label>
              <Select value={selectedArea} onValueChange={setSelectedArea}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your area..." />
                </SelectTrigger>
                <SelectContent>
                  {availableAreas.map((area) => (
                    <SelectItem key={area} value={area}>
                      {area.charAt(0).toUpperCase() + area.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleAreaSelection}
              className="w-full"
              disabled={!selectedArea}
            >
              <Ambulance className="h-4 w-4 mr-2" />
              Activate in {selectedArea || 'Selected Area'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}