import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/LoginForm";

export default function LoginHospitals() {
  const navigate = useNavigate();

  const handleLogin = () => {
    sessionStorage.setItem('auth-hospital', 'true');
    sessionStorage.setItem('hospital-name', 'Chord Road Hospital'); // Example hospital name
    navigate("/dashboard/hospital");
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 simple-grid-bg">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl float"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-1/3 w-64 h-64 bg-hospital/10 rounded-full blur-3xl float" style={{ animationDelay: '4s' }}></div>
      </div>
      <LoginForm 
        role="hospitals" 
        onLogin={handleLogin} 
        onBack={handleBack} 
      />
    </div>
  );
}