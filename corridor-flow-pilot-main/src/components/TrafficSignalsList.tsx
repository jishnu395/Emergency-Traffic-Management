import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

interface TrafficSignalsListProps {
  pickupLocation?: string;
  dropLocation?: string;
}

// Traffic signals database for different routes in Bangalore
const trafficSignalsData: Record<string, string[]> = {
  "mg road": [
    "Trinity Metro Station Signal",
    "Forum Mall Junction",
    "Residency Road Cross",
    "Richmond Circle",
    "Brigade Road Junction"
  ],
  "rajajinagar": [
    "Rajajinagar 2nd Block Signal",
    "Mantri Mall Signal",
    "Chord Road Junction",
    "Rajajinagar Metro Signal",
    "Chord Road Hospital"
  ],
  "whitefield": [
    "ITPL Main Gate Signal",
    "Whitefield Main Road Signal",
    "Varthur Kodi Junction",
    "Marathahalli Bridge",
    "Kundalahalli Signal"
  ],
  "jayanagar": [
    "Jayanagar 4th Block Signal",
    "South End Circle",
    "Lalbagh West Gate Signal",
    "Wilson Garden Signal"
  ],
  "koramangala": [
    "Koramangala 5th Block Signal",
    "Sony World Signal",
    "Koramangala Water Tank Signal",
    "Sarjapur Main Road Junction"
  ],
  "hebbal": [
    "Hebbal Flyover Signal",
    "Manyata Tech Park Signal",
    "Outer Ring Road Junction",
    "Nagawara Signal"
  ],
  "vv puram": [
    "VV Puram Food Street Signal",
    "Sajjan Rao Circle",
    "National College Metro Signal",
    "Basavanagudi Police Station"
  ],
  "yeshwanthpur": [
    "Yeshwanthpur Railway Station",
    "Govardhan Theatre Signal",
    "Orion Mall Junction",
    "RMC Yard"
  ]
};

export default function TrafficSignalsList({ pickupLocation, dropLocation }: TrafficSignalsListProps) {

  const getSignalsForRoute = () => {
    if (!pickupLocation) return [];

    const location = pickupLocation.toLowerCase();

    // Find matching signals based on pickup location
    for (const [key, signals] of Object.entries(trafficSignalsData)) {
      if (location.includes(key)) {
        return signals;
      }
    }

    // Default signals if no match found
    return [
      "Major Junction Signal 1",
      "City Center Signal",
      "Hospital Route Signal",
      "Emergency Corridor Signal"
    ];
  };

  const signals = getSignalsForRoute();
  const routeName = pickupLocation && dropLocation ?
    `${pickupLocation} → ${dropLocation}` :
    "Route not selected";

  return (
    <Card className="h-full glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5" />
          Traffic Signals En Route
        </CardTitle>
        <p className="text-sm text-muted-foreground">{routeName}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {signals.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No route selected</p>
              <p className="text-sm text-muted-foreground">Select pickup location to view signals</p>
            </div>
          ) : (
            signals.map((signal, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border hover:bg-muted/70 transition-colors">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{signal}</h4>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {Math.floor(Math.random() * 3) + 1} min
                      </span>
                    </div>
                    <Badge
                      variant={Math.random() > 0.3 ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {Math.random() > 0.3 ? (
                        <><CheckCircle2 className="h-3 w-3 mr-1" />Clear</>
                      ) : (
                        <><AlertTriangle className="h-3 w-3 mr-1" />Busy</>
                      )}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {signals.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Signals:</span>
                <span className="ml-2 font-semibold">{signals.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Est. Time:</span>
                <span className="ml-2 font-semibold">{signals.length * 2}-{signals.length * 4} min</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}