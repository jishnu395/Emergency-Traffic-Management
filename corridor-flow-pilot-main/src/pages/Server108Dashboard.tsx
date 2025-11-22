import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Ambulance, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Users,
  Activity,
  LogOut,
  Bell
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { io } from "socket.io-client";

interface EmergencyCall {
  id: string;
  location: string;
  timestamp: Date;
  status: 'received' | 'dispatched' | 'critical';
}

const hospitalMapping: Record<string, string> = {
  'rajajinagar': 'Chord Road Hospital',
  'mg road': "St. Martha's Hospital",
  'whitefield': 'Columbia Asia Hospital',
  'jayanagar': 'Jayadeva Institute',
  'koramangala': 'Manipal Hospital',
  'hebbal': 'Aster CMI Hospital',
  'yeshwanthpur': 'Sapthagiri Hospital',
  'banashankari': 'BGS Global Hospital',
  'indiranagar': 'Shankar Netralaya',
  'electronic city': 'Narayana Health City'
};

export default function Server108Dashboard() {
  const navigate = useNavigate();
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropLocation, setDropLocation] = useState("");
  const [nearestHospital, setNearestHospital] = useState("");
  const [recentActivities, setRecentActivities] = useState<EmergencyCall[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showCriticalAlert, setShowCriticalAlert] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [simulationStatus, setSimulationStatus] = useState<'idle' | 'loading' | 'active' | 'completed'>('idle');

  // --- State Persistence ---
  const updateRecentActivities = (activities: EmergencyCall[]) => {
    setRecentActivities(activities);
    sessionStorage.setItem('server108-activities', JSON.stringify(activities));
  };

  const updateNotifications = (notifications: string[]) => {
    setNotifications(notifications);
    sessionStorage.setItem('server108-notifications', JSON.stringify(notifications));
  };

  const updateSimulationStatus = (status: 'idle' | 'loading' | 'active' | 'completed') => {
    setSimulationStatus(status);
    sessionStorage.setItem('server108-simulationStatus', JSON.stringify(status));
  };
  // -------------------------

  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on('simulation_status', (data) => {
      if (data.status === 'completed') {
        updateSimulationStatus('completed');
        toast({
          title: "✅ Simulation Completed",
          description: "The simulation has finished.",
          duration: 5000,
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    // Check authentication
    const isAuthenticated = sessionStorage.getItem('auth-108-server');
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    // Load persisted state
    const savedActivities = sessionStorage.getItem('server108-activities');
    if (savedActivities) {
      const parsedActivities = JSON.parse(savedActivities).map((activity: any) => ({
        ...activity,
        timestamp: new Date(activity.timestamp),
      }));
      setRecentActivities(parsedActivities);
    }

    const savedNotifications = sessionStorage.getItem('server108-notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
    
    const savedSimStatus = sessionStorage.getItem('server108-simulationStatus');
    if (savedSimStatus) {
        setSimulationStatus(JSON.parse(savedSimStatus));
    }
  }, [navigate]);

  // Handle pickup location input with auto hospital detection
  useEffect(() => {
    if (pickupLocation.trim()) {
      const locationKey = pickupLocation.toLowerCase().trim();
      const matchedHospital = Object.entries(hospitalMapping).find(([key]) => 
        locationKey.includes(key)
      );
      
      if (matchedHospital) {
        setNearestHospital(matchedHospital[1]);
      } else {
        setNearestHospital("General Hospital (Default)");
      }

      if (typingTimeout) clearTimeout(typingTimeout);

      const timeout = setTimeout(() => {
        if (pickupLocation.trim()) {
          const newCall: EmergencyCall = {
            id: `call-${Date.now()}`,
            location: pickupLocation,
            timestamp: new Date(),
            status: 'received'
          };
          
          updateRecentActivities([newCall, ...recentActivities.slice(0, 9)]);
          
          toast({
            title: "📞 Emergency Call Received",
            description: `Call from ${pickupLocation}`,
            duration: 4000,
          });
        }
      }, 8000);

      setTypingTimeout(timeout);
    } else {
      setNearestHospital("");
      if (typingTimeout) clearTimeout(typingTimeout);
    }

    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickupLocation]);

  const handleDispatchAmbulance = () => {
    if (!pickupLocation.trim()) {
      toast({
        title: "❌ Error", 
        description: "Please enter pickup location",
        variant: "destructive"
      });
      return;
    }

    const finalDropLocation = dropLocation.trim() || nearestHospital || "General Hospital";
    const locationKey = pickupLocation.toLowerCase().trim();
    const matchedArea = Object.keys(hospitalMapping).find(key => locationKey.includes(key)) || 'default';

    const dispatchData = {
      pickupLocation,
      dropLocation: finalDropLocation,
      timestamp: new Date().toISOString(),
      isCritical: false,
      area: matchedArea
    };

    sessionStorage.setItem('active-dispatch', JSON.stringify(dispatchData));

    const channel = new BroadcastChannel('dispatch-channel');
    channel.postMessage(dispatchData);
    
    const newCall: EmergencyCall = {
      id: `dispatch-${Date.now()}`,
      location: pickupLocation,
      timestamp: new Date(),
      status: 'dispatched'
    };
    updateRecentActivities([newCall, ...recentActivities.slice(0, 9)]);

    const newNotifications = [
      `🚑 Ambulance dispatched: ${pickupLocation} → ${finalDropLocation}`,
      `🚓 Traffic Police notified for corridor clearance`,
      `🏥 ${finalDropLocation} alerted for incoming patient`
    ];
    const updatedNotifications = [...newNotifications, ...notifications.slice(0, 2)];
    updateNotifications(updatedNotifications);

    setTimeout(() => {
      updateNotifications(notifications.filter(n => !newNotifications.includes(n)));
    }, 8000);

    setPickupLocation("");
    setDropLocation("");
    setNearestHospital("");

    toast({
      title: "🚑 Ambulance Dispatched Successfully",
      description: `En route: ${pickupLocation} → ${finalDropLocation}`,
      duration: 5000,
    });
  };

  const handleMarkCritical = () => {
    if (!pickupLocation.trim()) {
      toast({
        title: "❌ Error", 
        description: "Please enter pickup location first",
        variant: "destructive"
      });
      return;
    }

    const criticalCall: EmergencyCall = {
      id: `critical-${Date.now()}`,
      location: pickupLocation,
      timestamp: new Date(),
      status: 'critical'
    };
    
    updateRecentActivities([criticalCall, ...recentActivities.slice(0, 9)]);

    setShowCriticalAlert(true);
    setTimeout(() => setShowCriticalAlert(false), 10000);

    toast({
      title: "⚠️ CRITICAL EMERGENCY FLAGGED",
      description: `Maximum priority dispatch for ${pickupLocation}`,
      variant: "destructive",
      duration: 6000,
    });
  };

  const handleLogout = () => {
    sessionStorage.removeItem('auth-108-server');
    sessionStorage.removeItem('server108-activities');
    sessionStorage.removeItem('server108-notifications');
    sessionStorage.removeItem('server108-simulationStatus');
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background simple-grid-bg">
      {showCriticalAlert && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-4 animate-pulse">
          <div className="container mx-auto text-center">
            <div className="flex items-center justify-center gap-3">
              <AlertTriangle className="h-6 w-6 animate-bounce" />
              <span className="text-lg font-bold">
                🚨 CRITICAL EMERGENCY - {pickupLocation.toUpperCase()} - MAXIMUM PRIORITY DISPATCH 🚨
              </span>
              <AlertTriangle className="h-6 w-6 animate-bounce" />
            </div>
          </div>
        </div>
      )}

      <header className="bg-primary text-primary-foreground p-4 shadow-lg glass-panel">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8" />
            <h1 className="text-2xl font-bold">108 Server Dashboard – Emergency Control Center</h1>
          </div>
          <div className="flex items-center gap-4">
            <Bell className="h-6 w-6 cursor-pointer hover:opacity-80" />
            <Badge variant="secondary" className="bg-white/20 text-white">
              Online
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
        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentActivities.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No recent activities</p>
                ) : (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 glass-panel rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.status === 'critical' ? 'bg-red-500 animate-pulse' :
                        activity.status === 'dispatched' ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm">
                          {activity.status === 'received' && `📞 Emergency call received - ${activity.location}`}
                          {activity.status === 'dispatched' && `🚑 Ambulance dispatched to ${activity.location}`}
                          {activity.status === 'critical' && `🚨 CRITICAL EMERGENCY - ${activity.location}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ambulance className="h-5 w-5" />
                Dispatch Ambulance Interface
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Pickup Location</label>
                <Input
                  placeholder="Enter pickup location..."
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="mb-4"
                />
                
                <label className="text-sm font-medium mb-2 block">Drop Location</label>
                <Input
                  placeholder="Enter drop location..."
                  value={dropLocation}
                  onChange={(e) => setDropLocation(e.target.value)}
                  className="mb-2"
                />
                
                {nearestHospital && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>Nearest Hospital: <strong>{nearestHospital}</strong></span>
                  </div>
                )}
              </div>

              {simulationStatus !== 'idle' && (
                <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-muted">
                  {simulationStatus === 'loading' && <><Activity className="h-4 w-4 animate-spin" /><span>Starting simulation...</span></>}
                  {simulationStatus === 'active' && <><Badge>Simulation Active</Badge></>}
                  {simulationStatus === 'completed' && <><Badge variant="outline">Simulation Completed</Badge></>}
                </div>
              )}

              <div className="flex gap-3">
                <Button 
                  onClick={handleDispatchAmbulance}
                  className="flex-1 glowing"
                  disabled={simulationStatus === 'loading' || simulationStatus === 'active'}
                >
                  <Ambulance className="h-4 w-4 mr-2" />
                  Dispatch Ambulance
                </Button>
                <Button 
                  onClick={handleMarkCritical}
                  variant="destructive"
                  className="glowing"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Mark Critical
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Live Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No active notifications</p>
                ) : (
                  notifications.map((notification, index) => (
                    <div key={index} className="p-3 glass-panel rounded-lg animate-in slide-in-from-right">
                      <p className="text-sm">{notification}</p>
                      <p className="text-xs text-muted-foreground">Just now</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Active Personnel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Emergency Operators</span>
                  <Badge variant="outline">12 Online</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Ambulance Crews</span>
                  <Badge variant="outline">28 Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Medical Staff</span>
                  <Badge variant="outline">156 Available</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}