import { ArrowRight, Shield, Zap, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfileDropdown from "@/components/ProfileDropdown";

const Index = () => {

  const features = [
    {
      icon: Shield,
      title: "Emergency Response",
      description: "Rapid coordination between emergency services and healthcare facilities"
    },
    {
      icon: Zap,
      title: "AI-Powered Routing",
      description: "Intelligent traffic management for optimal emergency vehicle corridors"
    },
    {
      icon: Clock,
      title: "Real-time Tracking",
      description: "Live monitoring of ambulances and emergency response times"
    },
    {
      icon: Users,
      title: "Multi-Role Access",
      description: "Dedicated interfaces for hospitals, traffic police, and emergency services"
    }
  ];

  return (
    <div className="min-h-screen bg-background simple-grid-bg">
      {/* Subtle animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl float"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-1/3 w-64 h-64 bg-emergency/10 rounded-full blur-3xl float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header */}
      <header className="relative border-b border-white/10 glass-panel backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="simple-border p-2">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold simple-text">Emergency Corridor AI</h1>
          </div>
          <div className="flex items-center gap-4">
            <ProfileDropdown />
          </div>
        </div>
      </header>

      <main className="relative container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - App Details */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-5xl font-bold leading-tight animate-gradient-text">
                <span className="simple-text">Smart Emergency Corridor</span>
                <span className="block text-primary simple-text mt-2">Management System</span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Revolutionizing emergency response through <span className="text-accent">intelligent traffic management</span> 
                and seamless coordination between hospitals, emergency services, and traffic control.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="simple-border hover-card glass-card" style={{ animationDelay: `${index * 0.2}s` }}>
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-primary/15 rounded-xl border border-primary/20 neon-glow">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold">{feature.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="glass-panel p-6 rounded-2xl">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-hospital rounded-full pulse-slow"></div>
                    <span className="text-hospital-glow">System Online</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded-full pulse-slow" style={{ animationDelay: '1s' }}></div>
                    <span className="text-primary-glow">24/7 Monitoring</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-accent rounded-full pulse-slow" style={{ animationDelay: '2s' }}></div>
                  <span className="text-accent-glow">AI Processing Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Access Panel */}
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <div className="glass-card p-8 rounded-3xl hover-card border border-primary/15">
                <div className="text-center space-y-6">
                  <h3 className="text-3xl font-bold simple-text">Welcome</h3>
                  <p className="text-muted-foreground text-lg">
                    Select your role from the dropdown above to access the system
                  </p>
                  
                  <div className="space-y-6">
                    <div className="simple-border">
                      <div className="p-8 text-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="mx-auto h-auto animate-fade-in"
                          style={{ maxWidth: '180px' }}
                        >
                          <defs>
                            <filter id="glow">
                              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                              <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                              </feMerge>
                            </filter>
                          </defs>
                          <g filter="url(#glow)" fill="hsl(var(--primary))">
                            <path d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12.99H5V6.3l7-3.11v9.8z" />
                            <path d="M11 14h2v-3h3v-2h-3V6h-2v3H8v2h3z" />
                          </g>
                        </svg>
                        <p className="text-muted-foreground leading-relaxed mt-6">
                          Secure access for emergency services, hospitals, 
                          traffic control, and ambulance drivers
                        </p>
                      </div>
                    </div>
                    
                    <Button 
                      variant="glowing" 
                      className="w-full py-6 text-lg"
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                      Select Role Above
                      <ArrowRight className="ml-3 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;

// Add this to your index.css or a new CSS file
const styles = `
.animate-gradient-text {
  background: linear-gradient(to right, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)));
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient-animation 4s linear infinite;
}

@keyframes gradient-animation {
  to {
    background-position: 200% center;
  }
}
`;
