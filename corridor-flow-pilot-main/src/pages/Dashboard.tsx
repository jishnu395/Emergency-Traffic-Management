import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Activity, 
  Car, 
  Truck, 
  LogOut, 
  Bell, 
  Users, 
  MapPin,
  Clock,
  TrendingUp
} from "lucide-react";

interface DashboardProps {
  role: string;
}

const dashboardConfig = {
  "108-server": {
    title: "108 Emergency Command Center",
    icon: Shield,
    color: "bg-red-50 border-red-200",
    headerColor: "bg-red-500",
    stats: [
      { label: "Active Calls", value: "23", trend: "+5%" },
      { label: "Ambulances", value: "45", trend: "+2%" },
      { label: "Response Time", value: "8.5m", trend: "-12%" },
      { label: "Success Rate", value: "98.2%", trend: "+1%" }
    ],
    activities: [
      "Emergency call received from MG Road",
      "Ambulance dispatched to Sector 12",
      "Patient transferred to Apollo Hospital",
      "Traffic corridor activated on NH-48"
    ]
  },
  "hospitals": {
    title: "Hospital Management System",
    icon: Activity,
    color: "bg-green-50 border-green-200",
    headerColor: "bg-green-500",
    stats: [
      { label: "Patients", value: "156", trend: "+8%" },
      { label: "Beds Available", value: "24", trend: "-5%" },
      { label: "Staff Online", value: "89", trend: "+3%" },
      { label: "Emergency Cases", value: "12", trend: "+15%" }
    ],
    activities: [
      "New patient admitted to ICU",
      "Surgery scheduled for 2:30 PM",
      "Ambulance arriving in 5 minutes",
      "Blood bank restocked - O+ available"
    ]
  },
  "traffic-police": {
    title: "Traffic Control Center",
    icon: Car,
    color: "bg-yellow-50 border-yellow-200",
    headerColor: "bg-yellow-500",
    stats: [
      { label: "Active Signals", value: "128", trend: "+0%" },
      { label: "Traffic Flow", value: "Good", trend: "+5%" },
      { label: "Violations", value: "67", trend: "-8%" },
      { label: "Corridors Active", value: "5", trend: "+2%" }
    ],
    activities: [
      "Emergency corridor activated on Ring Road",
      "Traffic light sequence updated",
      "Speed limit enforced on highway",
      "Congestion cleared at Junction 12"
    ]
  },
  "ambulance-driver": {
    title: "Ambulance Dispatch System",
    icon: Truck,
    color: "bg-blue-50 border-blue-200",
    headerColor: "bg-blue-500",
    stats: [
      { label: "Active Routes", value: "8", trend: "+12%" },
      { label: "ETA", value: "6.2m", trend: "-8%" },
      { label: "Fuel Level", value: "85%", trend: "-5%" },
      { label: "Patients Today", value: "15", trend: "+20%" }
    ],
    activities: [
      "Route optimized for fastest arrival",
      "Patient vitals transmitted to hospital",
      "Emergency corridor requested",
      "Backup ambulance on standby"
    ]
  }
};

export default function Dashboard({ role }: DashboardProps) {
  const navigate = useNavigate();
  const config = dashboardConfig[role as keyof typeof dashboardConfig];
  const Icon = config.icon;

  useEffect(() => {
    // Check if user is authenticated (in real app, this would check actual auth state)
    const isAuthenticated = sessionStorage.getItem(`auth-${role}`);
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [role, navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem(`auth-${role}`);
    navigate("/");
  };

  if (!config) {
    return <div>Invalid role</div>;
  }

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className={`${config.headerColor} text-white p-4`}>
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Icon className="h-8 w-8" />
            <h1 className="text-2xl font-bold">{config.title}</h1>
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

      <div className="container mx-auto p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {config.stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    {stat.trend}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {config.activities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm">{activity}</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.floor(Math.random() * 30) + 1} minutes ago
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Map/Status Panel */}
          <Card className={config.color}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">System Health</span>
                  <Badge variant="default" className="bg-green-500">Optimal</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Network Status</span>
                  <Badge variant="default" className="bg-green-500">Connected</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Last Updated</span>
                  <span className="text-sm text-muted-foreground">Just now</span>
                </div>
                <div className="mt-6 p-4 bg-background rounded-lg">
                  <h4 className="font-semibold mb-2">Active Personnel</h4>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">
                      {Math.floor(Math.random() * 50) + 20} staff members online
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}