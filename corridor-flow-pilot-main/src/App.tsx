import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Server108Dashboard from "./pages/Server108Dashboard";
import AmbulanceDriverIdle from "./pages/AmbulanceDriverIdle";
import AmbulanceDriverDashboard from "./pages/AmbulanceDriverDashboard";
import HospitalDashboard from "./pages/HospitalDashboard";
import NotFound from "./pages/NotFound";
import Login108Server from "./pages/Login108Server";
import LoginHospitals from "./pages/LoginHospitals";
import LoginAmbulanceDriver from "./pages/LoginAmbulanceDriver";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login/108-server" element={<Login108Server />} />
          <Route path="/login/hospitals" element={<LoginHospitals />} />
          <Route path="/login/ambulance-driver" element={<LoginAmbulanceDriver />} />
          <Route path="/dashboard/:role" element={<DashboardWrapper />} />
          <Route path="/dashboard/108-server" element={<Server108Dashboard />} />
          <Route path="/dashboard/hospital" element={<HospitalDashboard />} />
          <Route path="/dashboard/ambulance-driver" element={<AmbulanceDriverIdle />} />
          <Route path="/dashboard/ambulance-driver/:area" element={<AmbulanceDriverDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// Wrapper to extract role from URL params
const DashboardWrapper = () => {
  const { role } = useParams<{ role: string }>();
  
  if (!role) return <NotFound />;
  
  // Use specific dashboard for 108-server
  if (role === '108-server') {
    return <Server108Dashboard />;
  }
  
  return <Dashboard role={role} />;
};

export default App;
