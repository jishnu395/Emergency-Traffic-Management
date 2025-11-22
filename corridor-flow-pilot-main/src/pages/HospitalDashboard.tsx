import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2,
  MapPin,
  Clock,
  AlertTriangle,
  Ambulance,
  LogOut,
  Bell,
  MessageSquare,
  Navigation,
  Phone,
  User
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AmbulanceMap from "@/components/AmbulanceMap";

interface PatientMessage {
  message: string;
  timestamp: string;
  from: string;
  pickupLocation: string;
  dropLocation: string;
}

interface AmbulanceJourney {
  pickupLocation: string;
  dropLocation: string;
  startTime: string;
  area: string;
  isCritical: boolean;
  isSimulating?: boolean;
}

export default function HospitalDashboard() {
  const navigate = useNavigate();
  const [hospitalName] = useState("Chord Road Hospital");
  const [hospitalAddress] = useState("Chord Road, Rajajinagar, Bengaluru - 560010");
  const [incomingAmbulance, setIncomingAmbulance] = useState<AmbulanceJourney | null>(null);
  const [patientMessages, setPatientMessages] = useState<PatientMessage[]>([]);
  const [estimatedArrival, setEstimatedArrival] = useState("");
  const [showIncomingAlert, setShowIncomingAlert] = useState(false);

  useEffect(() => {
    // Check authentication
    const isAuthenticated = sessionStorage.getItem('auth-hospital');
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    // Listen for patient messages via BroadcastChannel
    const patientChannel = new BroadcastChannel('patient-messaging');
    const handlePatientMessage = (event: MessageEvent<PatientMessage>) => {
      const message = event.data;

      if ((message.dropLocation?.toLowerCase().includes('chord road') || 
           message.dropLocation?.toLowerCase().includes('rajajinagar')) &&
          !patientMessages.some(m => m.timestamp === message.timestamp)) {
        
        setPatientMessages(prev => [message, ...prev.slice(0, 4)]);
        
        toast({
          title: "📨 New Patient Message",
          description: `From ${message.from}`,
          duration: 5000,
        });
      }
    };
    patientChannel.addEventListener('message', handlePatientMessage);

    // Listen for journey data via BroadcastChannel
    const journeyChannel = new BroadcastChannel('ambulance-journey');
    const handleJourneyMessage = (event: MessageEvent<AmbulanceJourney>) => {
      const journey = event.data;

      if (journey.dropLocation.toLowerCase().includes('chord road') || 
          journey.dropLocation.toLowerCase().includes('rajajinagar')) {
        
        setIncomingAmbulance(journey);
        
        const startTime = new Date(journey.startTime);
        const eta = new Date(startTime.getTime() + 15 * 60000);
        setEstimatedArrival(eta.toLocaleTimeString());

        if (!showIncomingAlert) {
          setShowIncomingAlert(true);
          toast({
            title: "🚑 Incoming Ambulance",
            description: `Patient coming from ${journey.pickupLocation}`,
            duration: 8000,
          });
          
          setTimeout(() => setShowIncomingAlert(false), 10000);
        }
      }
    };
    journeyChannel.addEventListener('message', handleJourneyMessage);

    return () => {
      patientChannel.removeEventListener('message', handlePatientMessage);
      patientChannel.close();
      journeyChannel.removeEventListener('message', handleJourneyMessage);
      journeyChannel.close();
    };
  }, [navigate, showIncomingAlert, patientMessages]);

  const handleLogout = () => {
    sessionStorage.removeItem('auth-hospital');
    sessionStorage.removeItem('hospital-name');
    navigate("/");
  };

  const getTimeUntilArrival = () => {
    if (!incomingAmbulance) return "";
    
    const startTime = new Date(incomingAmbulance.startTime);
    const now = new Date();
    const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 60000); // minutes
    const remaining = Math.max(0, 15 - elapsed); // assuming 15 min journey
    
    return remaining > 0 ? `${remaining} minutes` : "Arriving Now";
  };

  return (
    <div className="min-h-screen bg-background simple-grid-bg">
      {/* Incoming Ambulance Alert */}
      {showIncomingAlert && incomingAmbulance && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white p-4 animate-pulse">
          <div className="container mx-auto text-center">
            <div className="flex items-center justify-center gap-3">
              <Ambulance className="h-6 w-6 animate-bounce" />
              <span className="text-lg font-bold">
                🚑 INCOMING AMBULANCE - Patient from {incomingAmbulance.pickupLocation.toUpperCase()} - ETA: {estimatedArrival}
              </span>
              <AlertTriangle className="h-6 w-6 animate-bounce" />
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-hospital text-white p-6 shadow-lg glass-panel">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Building2 className="h-10 w-10" />
            <div>
              <h1 className="text-3xl font-bold">{hospitalName}</h1>
              <p className="text-sm opacity-90 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {hospitalAddress}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Bell className="h-6 w-6 cursor-pointer hover:opacity-80" />
            <Badge variant="outline" className="bg-hospital-glow border-hospital-glow text-white glowing">
              Emergency Ready
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
        {/* Left Column - Patient Info & Messages */}
        <div className="space-y-6">
          {/* Incoming Ambulance Status */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ambulance className="h-5 w-5" />
                Incoming Ambulance Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {incomingAmbulance ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-900/50 border border-green-300/20 rounded-lg shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-bold text-green-300 text-base">Patient En Route</span>
                      {incomingAmbulance.isCritical && (
                        <Badge variant="destructive" className="ml-auto">CRITICAL</Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">From:</span>
                        <p className="font-semibold text-foreground">{incomingAmbulance.pickupLocation}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Area:</span>
                        <p className="font-semibold text-foreground">{incomingAmbulance.area?.replace('-', ' ').toUpperCase()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">ETA:</span>
                        <p className="font-semibold text-green-400">{getTimeUntilArrival()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Started:</span>
                        <p className="font-semibold text-foreground">{new Date(incomingAmbulance.startTime).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Ambulance className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No incoming ambulances</p>
                  <p className="text-sm text-muted-foreground">You will be notified when a patient is en route</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Patient Messages */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Patient Condition Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {patientMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No messages yet</p>
                    <p className="text-sm text-muted-foreground">Messages from ambulance crew will appear here</p>
                  </div>
                ) : (
                  patientMessages.map((msg, index) => (
                    <div key={index} className="relative p-4 bg-blue-900/50 border border-blue-300/20 rounded-lg shadow-sm">
                      <div className="flex items-center mb-2">
                        <MessageSquare className="h-5 w-5 text-blue-400 mr-2" />
                        <span className="font-bold text-blue-300 text-base">{msg.from}</span>
                        <span className="ml-auto text-sm text-muted-foreground">
                          {new Date(msg.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-foreground text-base mb-3 leading-relaxed">{msg.message}</p>
                      <div className="flex items-center text-sm text-muted-foreground font-medium">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{msg.pickupLocation} → {msg.dropLocation}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Hospital Staff Status */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Emergency Team Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Emergency Doctors</span>
                  <Badge variant="outline" className="bg-green-900/50 text-green-300">4 Available</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Nurses</span>
                  <Badge variant="outline" className="bg-green-900/50 text-green-300">8 On Duty</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">ICU Beds</span>
                  <Badge variant="outline" className="bg-yellow-900/50 text-yellow-300">3 Available</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Operation Theater</span>
                  <Badge variant="outline" className="bg-green-900/50 text-green-300">Ready</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Real-time Tracking */}
        <div className="space-y-6">
          {/* Live SUMO Simulation */}
          <Card className="h-[800px] glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Real-time Ambulance Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="h-full p-2">
              {incomingAmbulance ? (
                <AmbulanceMap 
                  pickupLocation={incomingAmbulance.pickupLocation}
                  dropLocation={incomingAmbulance.dropLocation}
                  isCritical={incomingAmbulance.isCritical}
                  isSimulating={incomingAmbulance.isSimulating || false}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <Navigation className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4 animate-pulse" />
                    <p className="text-muted-foreground text-lg">No Active Tracking</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Real-time ambulance location will appear when patient is en route
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}