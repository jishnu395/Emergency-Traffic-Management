import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Ambulance, 
  AlertTriangle, 
  MapPin, 
  Phone,
  User,
  Navigation,
  LogOut,
  Bell,
  Play,
  MessageSquare,
  Route,
  Send,
  Activity
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AmbulanceMap from "@/components/AmbulanceMap";
import TrafficSignalsList from "@/components/TrafficSignalsList";

interface CrewMember {
  name: string;
  role: string;
  phone: string;
  photo: string;
}

const crewData: Record<string, CrewMember[]> = {
  'mg-road': [
    { name: "Dr. Rajesh Kumar", role: "Medical Assistant", phone: "+91 98765 43210", photo: "👨‍⚕️" },
    { name: "Amit Singh", role: "Driver", phone: "+91 87654 32109", photo: "👨‍💼" }
  ],
  'rajajinagar': [
    { name: "Dr. Priya Sharma", role: "Medical Assistant", phone: "+91 98765 43211", photo: "👩‍⚕️" },
    { name: "Suresh Kumar", role: "Driver", phone: "+91 87654 32110", photo: "👨‍💼" }
  ],
  'whitefield': [
    { name: "Dr. Ankit Verma", role: "Medical Assistant", phone: "+91 98765 43212", photo: "👨‍⚕️" },
    { name: "Ravi Patel", role: "Driver", phone: "+91 87654 32111", photo: "👨‍💼" }
  ],
  'default': [
    { name: "Dr. Medical Assistant", role: "Medical Assistant", phone: "+91 98765 00000", photo: "👨‍⚕️" },
    { name: "Driver Name", role: "Driver", phone: "+91 87654 00000", photo: "👨‍💼" }
  ]
};

export default function AmbulanceDriverDashboard() {
  const navigate = useNavigate();
  const { area } = useParams();
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropLocation, setDropLocation] = useState("");
  const [isCritical, setIsCritical] = useState(false);
  const [showCriticalAlert, setShowCriticalAlert] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [patientMessage, setPatientMessage] = useState("");
  const [routeInfo, setRouteInfo] = useState({
    distance: "4.2 km",
    duration: "18-25 min",
    traffic: "Variable"
  });
  const [simulationStatus, setSimulationStatus] = useState<'idle' | 'loading' | 'active' | 'completed'>('idle');

  useEffect(() => {
    // Check authentication
    const isAuthenticated = sessionStorage.getItem('auth-ambulance-driver');
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    // Simulate receiving dispatch data from 108 server
    const mockPickup = area === 'mg-road' ? 'MG Road Metro Station' : 
                      area === 'rajajinagar' ? 'Rajajinagar Bus Stop' :
                      area === 'whitefield' ? 'Whitefield IT Park' : 'Current Area';
    
    const mockDrop = area === 'mg-road' ? "St. Martha's Hospital" :
                    area === 'rajajinagar' ? 'Chord Road Hospital' :
                    area === 'whitefield' ? 'Columbia Asia Hospital' : 'Nearest Hospital';

    setPickupLocation(mockPickup);
    setDropLocation(mockDrop);
  }, [navigate, area]);

  const getCurrentCrew = () => {
    return crewData[area || 'default'] || crewData['default'];
  };

  const handleStartJourney = async () => {
    setIsStarted(true);
    setSimulationStatus('loading');

    try {
      const response = await fetch('http://localhost:5000/api/start-simulation', {
        method: 'POST',
      });

      if (response.ok) {
        setSimulationStatus('active');
        setIsSimulating(true);
        toast({
          title: "🚀 Simulation Started",
          description: "The live simulation is now active.",
          duration: 5000,
        });
      } else {
        setSimulationStatus('idle');
        setIsSimulating(false);
        toast({
          title: "❌ Simulation Error",
          description: "Could not start the simulation.",
          variant: "destructive"
        });
      }
    } catch (error) {
      setSimulationStatus('idle');
      setIsSimulating(false);
      console.error("Simulation start error:", error);
      toast({
        title: "❌ Network Error",
        description: "Could not connect to the simulation server.",
        variant: "destructive"
      });
    }
    
    const journeyData = {
      pickupLocation,
      dropLocation,
      startTime: new Date().toISOString(),
      area,
      isCritical,
      isSimulating: true
    };

    // Store journey data for hospital notification
    sessionStorage.setItem('ambulance-journey', JSON.stringify(journeyData));

    // Broadcast journey data to other tabs
    const channel = new BroadcastChannel('ambulance-journey');
    channel.postMessage(journeyData);

    toast({
      title: "🚑 Journey Started - Realistic Traffic Simulation Active",
      description: `Slow-speed simulation with traffic density and signal control`,
      duration: 5000,
    });
  };

  const handleSendMessage = () => {
    if (!patientMessage.trim()) return;

    const channel = new BroadcastChannel('patient-messaging');
    channel.postMessage({
      message: patientMessage,
      timestamp: new Date().toISOString(),
      from: `${area} Ambulance`,
      pickupLocation,
      dropLocation
    });

    toast({
      title: "📨 Message Sent to Hospital",
      description: "Patient condition information shared",
      duration: 3000,
    });

    setPatientMessage("");
  };

  const handleMarkCritical = () => {
    setIsCritical(true);
    setShowCriticalAlert(true);
    
    // Auto-hide critical alert after 10 seconds
    setTimeout(() => setShowCriticalAlert(false), 10000);

    toast({
      title: "🚨 CRITICAL ALERT SENT",
      description: "Traffic Police notified for emergency corridor clearance",
      variant: "destructive",
      duration: 5000,
    });
  };

  const handleLogout = () => {
    sessionStorage.removeItem('auth-ambulance-driver');
    sessionStorage.removeItem('ambulance-active-area');
    navigate("/");
  };

  const crew = getCurrentCrew();
  const areaName = area?.replace('-', ' ').toUpperCase() || 'UNKNOWN AREA';

  return (
    <div className="min-h-screen bg-background simple-grid-bg">
      {/* Critical Alert Banner */}
      {showCriticalAlert && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-4 animate-pulse">
          <div className="container mx-auto text-center">
            <div className="flex items-center justify-center gap-3">
              <AlertTriangle className="h-6 w-6 animate-bounce" />
              <span className="text-lg font-bold">
                🚨 CRITICAL PATIENT - TRAFFIC POLICE ALERTED FOR CORRIDOR CLEARANCE 🚨
              </span>
              <AlertTriangle className="h-6 w-6 animate-bounce" />
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 shadow-lg glass-panel">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Ambulance className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Ambulance Driver Dashboard</h1>
              <p className="text-sm opacity-90">Active Area: {areaName}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Bell className="h-6 w-6 cursor-pointer hover:opacity-80" />
            <Badge variant="secondary" className="bg-white/20 text-white">
              {isCritical ? 'CRITICAL' : 'Active'}
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
      </header>

      <div className="container mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Traffic Signals */}
        <div className="space-y-6">
          <TrafficSignalsList 
            pickupLocation={pickupLocation}
            dropLocation={dropLocation}
          />
        </div>

        {/* Right Column - Map & Route Info */}
        <div className="space-y-6">
          {/* Route Information */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5" />
                Route Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{routeInfo.distance}</div>
                  <div className="text-sm text-muted-foreground">Distance</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{routeInfo.duration}</div>
                  <div className="text-sm text-muted-foreground">ETA</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{routeInfo.traffic}</div>
                  <div className="text-sm text-muted-foreground">Traffic</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <MapPin className="h-4 w-4" />
                <span>{pickupLocation} → {dropLocation}</span>
              </div>

              {simulationStatus !== 'idle' && (
                <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-muted">
                  {simulationStatus === 'loading' && <><Activity className="h-4 w-4 animate-spin" /><span>Starting simulation...</span></>}
                  {simulationStatus === 'active' && <><Badge>Simulation Active</Badge></>}
                  {simulationStatus === 'completed' && <><Badge variant="outline">Simulation Completed</Badge></>}
                </div>
              )}

              {!isStarted ? (
                <Button 
                  onClick={handleStartJourney}
                  className="w-full glowing"
                  size="lg"
                  disabled={simulationStatus === 'loading' || simulationStatus === 'active'}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Journey
                </Button>
              ) : (
                <Badge className="w-full justify-center py-2 bg-green-600">
                  <Play className="h-4 w-4 mr-2" />
                  Journey in Progress
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Live Map */}
          <Card className="h-[450px] glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Live Navigation
              </CardTitle>
            </CardHeader>
            <CardContent className="h-full p-2 overflow-hidden">
              <AmbulanceMap 
                pickupLocation={pickupLocation}
                dropLocation={dropLocation}
                isCritical={isCritical}
                isSimulating={isSimulating}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Section - Controls */}
      <div className="container mx-auto px-6 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Message */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Patient Condition Message
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Message to Hospital
                </label>
                <Textarea
                  placeholder="Enter patient condition, vitals, or special instructions..."
                  value={patientMessage}
                  onChange={(e) => setPatientMessage(e.target.value)}
                  className="min-h-[100px] glass-panel"
                />
              </div>
              <Button 
                onClick={handleSendMessage}
                className="w-full glowing"
                disabled={!patientMessage.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                Send to Hospital
              </Button>
            </CardContent>
          </Card>

          {/* Crew Information */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Crew Members
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {crew.map((member, index) => (
                <div key={index} className="flex items-center gap-4 p-3 glass-panel rounded-lg">
                  <div className="text-3xl">{member.photo}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{member.name}</h4>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-3 w-3" />
                      <span className="text-sm font-mono">{member.phone}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Mission Controls */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Emergency Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Status:</span>
                  <Badge variant={isCritical ? "destructive" : "default"}>
                    {isCritical ? "CRITICAL" : "ACTIVE"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Journey:</span>
                  <Badge variant={isStarted ? "default" : "secondary"}>
                    {isStarted ? "IN PROGRESS" : "NOT STARTED"}
                  </Badge>
                </div>
              </div>
              
              <Button 
                onClick={handleMarkCritical}
                variant="destructive"
                className="w-full glowing"
                disabled={isCritical}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                {isCritical ? 'CRITICAL ALERT SENT' : 'Mark as Critical'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}