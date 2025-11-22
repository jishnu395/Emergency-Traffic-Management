import { User, ChevronDown, Shield, Activity, Car, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ProfileDropdownProps {}

const roles = [
  { id: "108-server", label: "108 Server", icon: Shield },
  { id: "hospitals", label: "Hospitals", icon: Activity },
  { id: "ambulance-driver", label: "Ambulance Driver", icon: Truck },
];

export default function ProfileDropdown({}: ProfileDropdownProps) {
  const navigate = useNavigate();

  const handleRoleSelect = (roleId: string) => {
    navigate(`/login/${roleId}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="lg" className="gap-2 glass-panel border-primary/20 hover:border-primary/40 pulse-slow">
          <User className="h-4 w-4" />
          Select Role
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 glass-card border-primary/20 p-2">
        {roles.map((role) => (
          <DropdownMenuItem
            key={role.id}
            onClick={() => handleRoleSelect(role.id)}
            className="cursor-pointer glass-panel my-1 hover:border-primary/30 transition-all duration-300 rounded-lg p-3 flex items-center gap-3"
          >
            <role.icon className="h-5 w-5 text-primary" />
            <span className="font-medium">{role.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}