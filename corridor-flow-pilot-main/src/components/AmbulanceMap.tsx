import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface AmbulanceMapProps {
  pickupLocation?: string;
  dropLocation?: string;
  isCritical?: boolean;
  isSimulating?: boolean;
  // Legacy props for backward compatibility
  ambulanceData?: {
    isActive: boolean;
    from: string;
    to: string;
    isCritical: boolean;
    currentLocation: [number, number];
  };
  selectedArea?: string;
}

export default function AmbulanceMap({ 
  pickupLocation, 
  dropLocation, 
  isCritical = false,
  isSimulating = false,
  ambulanceData, 
  selectedArea 
}: AmbulanceMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const ambulanceMarker = useRef<L.Marker | null>(null);
  const routePolyline = useRef<L.Polyline | null>(null);
  const trafficSignals = useRef<L.Marker[]>([]);
  const animationRef = useRef<number | null>(null);
  
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [ambulancePosition, setAmbulancePosition] = useState<[number, number]>([12.9716, 77.5946]);
  const [currentSpeed, setCurrentSpeed] = useState(60); // km/h
  const [trafficDensity, setTrafficDensity] = useState<'light' | 'moderate' | 'heavy'>('light');

  // Use new props if available, otherwise fall back to legacy ambulanceData
  const isActive = ambulanceData?.isActive || !!(pickupLocation && dropLocation);
  const fromLocation = ambulanceData?.from || pickupLocation || '';
  const toLocation = ambulanceData?.to || dropLocation || '';
  const isCriticalEmergency = ambulanceData?.isCritical || isCritical;

  // Area coordinates for Bangalore
  const areaCoordinates: { [key: string]: [number, number] } = {
    "vv puram": [12.9395, 77.5831],
    "mg road": [12.9716, 77.6197],
    "whitefield": [12.9698, 77.7500],
    "jayanagar": [12.9279, 77.5937],
    "koramangala": [12.9352, 77.6245],
    "hebbal": [13.0358, 77.5970],
    "yeshwanthpur": [13.0284, 77.5385],
    "rajajinagar": [12.9899, 77.5533],
    "chord road hospital": [12.9850, 77.5600],
    "st. martha's hospital": [12.9750, 77.6180],
    "columbia asia hospital": [12.9780, 77.7550],
    "jayadeva institute": [12.9150, 77.5980],
    "manipal hospital": [12.9600, 77.6480],
    "aster cmi hospital": [13.0450, 77.6050],
    "sapthagiri hospital": [13.0250, 77.5250],
    "bgs global hospital": [12.8900, 77.5000],
    "shankar netralaya": [12.9710, 77.6380],
    "narayana health city": [12.8600, 77.6800]
  };

  // Generate realistic route waypoints between two locations with more detail
  const generateRouteWaypoints = (start: [number, number], end: [number, number]): [number, number][] => {
    const waypoints: [number, number][] = [start];
    const steps = 50; // More waypoints for smoother animation
    
    // Calculate control points for a Bezier curve
    const midLat = (start[0] + end[0]) / 2;
    const midLng = (start[1] + end[1]) / 2;
    const angle = Math.atan2(end[0] - start[0], end[1] - start[1]);
    const curveIntensity = 0.1; // Adjust for more or less curve
    const control1Lat = midLat + curveIntensity * Math.cos(angle);
    const control1Lng = midLng - curveIntensity * Math.sin(angle);
    
    for (let i = 1; i <= steps; i++) {
      const t = i / (steps + 1);
      
      // Bezier curve formula
      const lat = Math.pow(1 - t, 2) * start[0] + 2 * (1 - t) * t * control1Lat + Math.pow(t, 2) * end[0];
      const lng = Math.pow(1 - t, 2) * start[1] + 2 * (1 - t) * t * control1Lng + Math.pow(t, 2) * end[1];
      
      waypoints.push([lat, lng]);
    }
    
    waypoints.push(end);
    return waypoints;
  };

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (point1: [number, number], point2: [number, number]): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (point2[0] - point1[0]) * Math.PI / 180;
    const dLon = (point2[1] - point1[1]) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1[0] * Math.PI / 180) * Math.cos(point2[0] * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Get coordinates for pickup/drop locations
  const getLocationCoords = (location: string): [number, number] => {
    const normalizedLocation = location.toLowerCase();
    for (const [key, coords] of Object.entries(areaCoordinates)) {
      if (normalizedLocation.includes(key.toLowerCase())) {
        return coords;
      }
    }
    // Default to Bangalore city center
    return [12.9716, 77.5946];
  };

  const currentLocation = ambulanceData?.currentLocation || getLocationCoords(fromLocation);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([12.9716, 77.5946], 12);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapInstance.current = map;

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;

    // Center map on selected area
    if (selectedArea && areaCoordinates[selectedArea]) {
      mapInstance.current.setView(areaCoordinates[selectedArea], 13);
    }
  }, [selectedArea]);

  useEffect(() => {
    if (mapInstance.current) {
      setTimeout(() => {
        mapInstance.current?.invalidateSize();
      }, 100);
    }
  }, [isSimulating]);

  // Realistic slow simulation effect with variable speeds
  useEffect(() => {
    if (!isSimulating || !isActive) {
      setSimulationProgress(0);
      setCurrentSpeed(0);
      return;
    }

    const pickupCoords = getLocationCoords(fromLocation);
    const dropCoords = getLocationCoords(toLocation);
    const routeWaypoints = generateRouteWaypoints(pickupCoords, dropCoords);
    const totalDistance = calculateDistance(pickupCoords, dropCoords);
    
    let currentStep = 0;
    const totalSteps = routeWaypoints.length;
    
    // Slower, more realistic speeds (1500ms per step = very slow movement)
    let baseStepDuration = 1500; // Base duration in ms
    
    const interval = setInterval(() => {
      if (currentStep < totalSteps) {
        const progress = currentStep / totalSteps;
        
        // Simulate traffic density changes along route
        if (progress < 0.3) {
          setTrafficDensity('light');
          setCurrentSpeed(65);
          baseStepDuration = 1200;
        } else if (progress < 0.6) {
          setTrafficDensity('moderate');
          setCurrentSpeed(45);
          baseStepDuration = 1800;
        } else {
          setTrafficDensity('heavy');
          setCurrentSpeed(30);
          baseStepDuration = 2400;
        }
        
        // Slow down near traffic signals
        const signalPositions = [0.2, 0.35, 0.5, 0.65, 0.8];
        const nearSignal = signalPositions.some(pos => 
          Math.abs(progress - pos) < 0.03
        );
        
        if (nearSignal && progress < 0.98) {
          setCurrentSpeed(Math.max(10, currentSpeed - 20));
          baseStepDuration = baseStepDuration * 1.5;
        }
        
        // Critical ambulances go slightly faster
        if (isCriticalEmergency) {
          baseStepDuration = baseStepDuration * 0.8;
          setCurrentSpeed(Math.min(80, currentSpeed + 15));
        }
        
        setAmbulancePosition(routeWaypoints[currentStep]);
        setSimulationProgress((currentStep / totalSteps) * 100);
        currentStep++;
      } else {
        clearInterval(interval);
        setSimulationProgress(100);
        setCurrentSpeed(0);
      }
    }, baseStepDuration);

    return () => clearInterval(interval);
  }, [isSimulating, isActive, fromLocation, toLocation, isCriticalEmergency]);

  useEffect(() => {
    if (!mapInstance.current || !isActive) return;

    // Remove existing markers and route
    if (ambulanceMarker.current) {
      mapInstance.current.removeLayer(ambulanceMarker.current);
    }
    if (routePolyline.current) {
      mapInstance.current.removeLayer(routePolyline.current);
    }
    trafficSignals.current.forEach(signal => mapInstance.current?.removeLayer(signal));
    trafficSignals.current = [];

    // Get coordinates
    const pickupCoords = getLocationCoords(fromLocation);
    const dropCoords = getLocationCoords(toLocation);
    const routeWaypoints = generateRouteWaypoints(pickupCoords, dropCoords);
    
    // Use simulated position if simulating, otherwise use current location
    const displayPosition = isSimulating ? ambulancePosition : currentLocation;

    // Create route polyline
    routePolyline.current = L.polyline(routeWaypoints, {
      color: isCriticalEmergency ? '#ef4444' : '#3b82f6',
      weight: 4,
      opacity: 0.8,
      dashArray: isCriticalEmergency ? '10, 5' : undefined
    }).addTo(mapInstance.current);

    // Add traffic signals along the route
    const signalPositions = [0.2, 0.35, 0.5, 0.65, 0.8]; // Positions along route
    signalPositions.forEach((position, index) => {
      const signalIndex = Math.floor(position * routeWaypoints.length);
      const signalCoords = routeWaypoints[signalIndex];
      
      // Calculate if ambulance has passed this signal
      const ambulanceProgress = isSimulating ? simulationProgress / 100 : 0;
      const isPassed = ambulanceProgress > position - 0.05; // Signal turns green slightly before ambulance reaches
      
      const signalIcon = L.divIcon({
        html: `
          <div style="
            background: ${isPassed ? '#22c55e' : '#ef4444'};
            border: 3px solid white;
            border-radius: 4px;
            width: 16px;
            height: 16px;
            box-shadow: 0 0 10px ${isPassed ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'};
            transition: all 0.3s ease;
          "></div>
        `,
        className: 'traffic-signal',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });
      
      const signalMarker = L.marker(signalCoords, { icon: signalIcon })
        .bindPopup(`<strong>Signal ${index + 1}</strong><br/>Status: ${isPassed ? '🟢 GREEN' : '🔴 RED'}`)
        .addTo(mapInstance.current!);
      
      trafficSignals.current.push(signalMarker);
    });

    // Create custom ambulance icon
    const ambulanceIcon = L.divIcon({
      html: `
        <div style="
          background: ${isCriticalEmergency ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'};
          border: 3px solid white;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          box-shadow: 0 0 20px ${isCriticalEmergency ? 'hsl(var(--destructive) / 0.8)' : 'hsl(var(--primary) / 0.8)'};
          animation: ${isCriticalEmergency ? 'pulse 1s infinite' : 'none'};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        ">🚑</div>
        <style>
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.3); opacity: 0.7; }
          }
        </style>
      `,
      className: 'custom-ambulance-marker',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    // Add ambulance marker
    ambulanceMarker.current = L.marker(displayPosition, {
      icon: ambulanceIcon,
      zIndexOffset: 1000
    }).addTo(mapInstance.current);

    const popupContent = `
      <div class="p-2 rounded-lg shadow-lg bg-background/80 backdrop-blur-sm border border-white/10">
        <strong class="text-base ${isCriticalEmergency ? 'text-destructive' : 'text-primary'}">
          ${isCriticalEmergency ? '🚨 CRITICAL' : '🚑'} Ambulance
        </strong>
        <div class="text-sm mt-2 space-y-1">
          <div><strong>From:</strong> ${fromLocation}</div>
          <div><strong>To:</strong> ${toLocation}</div>
          ${isSimulating ? `
            <div class="pt-2 border-t border-white/10">
              <div><strong>Progress:</strong> ${Math.round(simulationProgress)}%</div>
              <div><strong>Speed:</strong> ${currentSpeed} km/h</div>
              <div><strong>Traffic:</strong> ${trafficDensity.toUpperCase()}</div>
            </div>
          ` : '<div><strong>Status:</strong> Ready</div>'}
        </div>
      </div>
    `;
    
    ambulanceMarker.current.bindPopup(popupContent);

    // Add pickup marker
    const pickupIcon = L.divIcon({
      html: '<div class="text-2xl">📍</div>',
      className: 'pickup-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 24]
    });
    
    L.marker(pickupCoords, { icon: pickupIcon })
      .bindPopup(`<strong>Pickup:</strong> ${fromLocation}`)
      .addTo(mapInstance.current);

    // Add drop marker  
    const dropIcon = L.divIcon({
      html: '<div class="text-2xl">🏥</div>',
      className: 'drop-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    
    L.marker(dropCoords, { icon: dropIcon })
      .bindPopup(`<strong>Destination:</strong> ${toLocation}`)
      .addTo(mapInstance.current);

    // Fit map to show all markers
    const bounds = L.latLngBounds([pickupCoords, ...routeWaypoints, dropCoords]);
    mapInstance.current.fitBounds(bounds, { padding: [50, 50] });

  }, [isActive, fromLocation, toLocation, isCriticalEmergency, currentLocation, isSimulating, simulationProgress, ambulancePosition]);

  return (
    <div className="relative w-full h-full" style={{ height: "400px", position: "relative" }}>
      <div ref={mapRef} className="w-full h-full rounded-lg" style={{ overflow: 'hidden' }} />
      
      {isActive && (
        <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border space-y-2 min-w-[250px] glass-card">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${isCriticalEmergency ? 'bg-destructive animate-pulse' : 'bg-primary'}`}></div>
            <span className="font-medium">
              {isCriticalEmergency ? 'CRITICAL AMBULANCE' : 'Active Ambulance'}
            </span>
          </div>
          <div className="text-sm space-y-1">
            <div className="text-muted-foreground">
              <strong>From:</strong> {fromLocation}
            </div>
            <div className="text-muted-foreground">
              <strong>To:</strong> {toLocation}
            </div>
            {isSimulating && (
              <>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-muted-foreground">Progress:</span>
                    <span className="font-semibold text-primary">{Math.round(simulationProgress)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${simulationProgress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-muted-foreground">Speed:</span>
                  <span className="font-semibold text-green-600">{currentSpeed} km/h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Traffic:</span>
                  <span className={`font-semibold ${
                    trafficDensity === 'light' ? 'text-green-600' :
                    trafficDensity === 'moderate' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {trafficDensity === 'light' ? '🟢 Light' :
                     trafficDensity === 'moderate' ? '🟡 Moderate' :
                     '🔴 Heavy'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg">
          <div className="text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <div className="text-2xl">🚑</div>
            </div>
            <p className="text-muted-foreground">No active ambulance tracking</p>
            <p className="text-sm text-muted-foreground mt-1">Map will show live tracking when ambulance is dispatched</p>
          </div>
        </div>
      )}
    </div>
  );
}