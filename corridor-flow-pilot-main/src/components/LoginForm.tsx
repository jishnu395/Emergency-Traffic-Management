import { useState } from "react";
import { Eye, EyeOff, Shield, Activity, Car, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface LoginFormProps {
  role: string;
  onLogin: (role: string) => void;
  onBack: () => void;
}

const roleConfig = {
  "108-server": {
    title: "108 Emergency Server",
    icon: Shield,
    color: "emergency",
    description: "Central emergency coordination system"
  },
  "hospitals": {
    title: "Hospital System",
    icon: Activity,
    color: "hospital",
    description: "Hospital management and patient coordination"
  },
  "traffic-police": {
    title: "Traffic Police",
    icon: Car,
    color: "traffic",
    description: "Traffic management and control system"
  },
  "ambulance-driver": {
    title: "Ambulance Driver",
    icon: Truck,
    color: "ambulance",
    description: "Emergency vehicle dispatch system"
  }
};

export default function LoginForm({ role, onLogin, onBack }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const config = roleConfig[role as keyof typeof roleConfig];
  const Icon = config.icon;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (username === "admin" && password === "1234") {
        // Set authentication in session storage
        sessionStorage.setItem(`auth-${role}`, "true");
        toast({
          title: "Login Successful",
          description: `Welcome to ${config.title}`,
        });
        onLogin(role);
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid credentials. Use admin/1234",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="glass-card p-8 rounded-3xl hover-card border border-primary/15 max-w-md mx-auto simple-grid">
      <div className="text-center space-y-6">
        <div className="simple-border mx-auto w-fit">
          <Icon className="h-12 w-12 text-primary float" />
        </div>
        <div>
          <h2 className="text-3xl font-bold simple-text mb-2">{config.title}</h2>
          <p className="text-muted-foreground">{config.description}</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6 mt-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="glass-panel border-primary/20 focus:border-primary/40 h-12"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-panel border-primary/20 focus:border-primary/40 h-12 pr-12"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1 glass-panel border-muted-foreground/20 hover:border-muted-foreground/40 h-12"
          >
            Back
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 h-12 font-semibold glowing"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </div>
      </form>
      
      <div className="mt-6 glass-panel p-4 rounded-xl">
        <p className="text-sm text-center">
          <span className="text-muted-foreground">Demo credentials:</span>
          <span className="text-primary font-mono ml-2 simple-text">admin / 1234</span>
        </p>
      </div>
    </div>
  );
}
