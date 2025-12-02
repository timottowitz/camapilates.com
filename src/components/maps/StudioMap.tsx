import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Navigation, Search, Filter, Layers, X, Star, CheckCircle, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Studio {
  _id: string;
  name: string;
  slug?: string;
  address: {
    street: string;
    neighborhood?: string;
    city: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  metrics?: {
    googleRating?: number;
    googleReviewCount?: number;
  };
  amenities?: string[];
  photos?: string[];
  isVerified?: boolean;
  classTypes?: string[];
  priceRange?: {
    min?: number;
    max?: number;
  };
}

interface StudioMapProps {
  studios: Studio[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  onStudioClick?: (studio: Studio) => void;
  showControls?: boolean;
  enableGeolocation?: boolean;
  enableClustering?: boolean;
  enableHeatmap?: boolean;
  enableStreetView?: boolean;
}

declare global {
  interface Window {
    google: any;
    initMap?: () => void;
  }
}

export function StudioMap({
  studios,
  center = { lat: 19.4326, lng: -99.1332 }, // Default to CDMX
  zoom = 12,
  height = '600px',
  onStudioClick,
  showControls = true,
  enableGeolocation = true,
  enableClustering = true,
  enableHeatmap = false,
  enableStreetView = true,
}: StudioMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedStudio, setSelectedStudio] = useState<Studio | null>(null);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'terrain' | 'hybrid'>('roadmap');
  const [heatmapLayer, setHeatmapLayer] = useState<any>(null);
  const [markerClusterer, setMarkerClusterer] = useState<any>(null);
  const [directionsService, setDirectionsService] = useState<any>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<any>(null);
  const [mapUnavailable, setMapUnavailable] = useState<boolean>(false);

  // Load Google Maps script
  useEffect(() => {
    const key = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';
    if (!key) {
      setMapUnavailable(true);
      return;
    }
    const SCRIPT_ID = 'google-maps-api';
    const loadMap = () => initializeMap();

    // Already loaded
    if (window.google?.maps) {
      loadMap();
      return;
    }

    // Reuse existing script if present
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places,visualization,geometry,drawing`;
      script.async = true;
      script.defer = true;
      script.onerror = () => setMapUnavailable(true);
      // Append to head instead of body to avoid React hydration conflicts
      document.head.appendChild(script);
    }

    // Only add listener if script is not yet loaded
    if (!window.google?.maps) {
      script.addEventListener('load', loadMap, { once: true });
    }

    return () => {
      // Do not remove the script; keep it cached for the SPA lifetime.
      // Only remove listener if it was added
      if (!window.google?.maps) {
        script?.removeEventListener('load', loadMap);
      }
    };
  }, []);

  // Initialize map
  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.google) return;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center,
      zoom,
      mapTypeId: 'roadmap',
      styles: [
        {
          featureType: 'poi.business',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
      mapTypeControl: showControls,
      fullscreenControl: showControls,
      streetViewControl: enableStreetView,
      zoomControl: true,
      gestureHandling: 'greedy',
    });

    setMap(mapInstance);

    // Initialize services
    if (window.google.maps.DirectionsService) {
      setDirectionsService(new window.google.maps.DirectionsService());
      setDirectionsRenderer(new window.google.maps.DirectionsRenderer({
        map: mapInstance,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#8B5CF6',
          strokeWeight: 4,
          strokeOpacity: 0.8,
        },
      }));
    }

    // Add map click listener
    mapInstance.addListener('click', () => {
      setSelectedStudio(null);
    });
  }, [center, zoom, showControls, enableStreetView]);

  // Add markers for studios
  useEffect(() => {
    if (!map || !window.google) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    const newMarkers: any[] = [];
    const bounds = new window.google.maps.LatLngBounds();

    studios.forEach((studio) => {
      const position = {
        lat: studio.address.coordinates.lat,
        lng: studio.address.coordinates.lng,
      };

      const marker = new window.google.maps.Marker({
        position,
        map,
        title: studio.name,
        icon: {
          url: studio.isVerified
            ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
            : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
          scaledSize: new window.google.maps.Size(32, 32),
        },
        animation: window.google.maps.Animation.DROP,
      });

      // Create info window
      const infoContent = `
        <div style="padding: 12px; max-width: 300px;">
          <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">${studio.name}</h3>
          <p style="font-size: 14px; color: #666; margin-bottom: 8px;">${studio.address.street}</p>
          ${studio.address.neighborhood ? `<p style="font-size: 12px; color: #888;">${studio.address.neighborhood}</p>` : ''}
          ${studio.metrics?.googleRating ? `
            <div style="margin-top: 8px; display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 14px; font-weight: 500;">⭐ ${studio.metrics.googleRating}</span>
              <span style="font-size: 12px; color: #888;">(${studio.metrics.googleReviewCount} reviews)</span>
            </div>
          ` : ''}
          ${studio.amenities && studio.amenities.length > 0 ? `
            <div style="margin-top: 8px;">
              ${studio.amenities.slice(0, 3).map(a => `
                <span style="display: inline-block; padding: 2px 8px; margin: 2px; background: #f3f4f6; border-radius: 4px; font-size: 11px;">${a}</span>
              `).join('')}
            </div>
          ` : ''}
          ${enableGeolocation && userLocation ? `
            <button
              onclick="window.getDirectionsToStudio('${studio._id}')"
              style="margin-top: 12px; padding: 6px 12px; background: #8B5CF6; color: white; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; width: 100%;"
            >
              Get Directions
            </button>
          ` : ''}
        </div>
      `;

      const infoWindow = new window.google.maps.InfoWindow({
        content: infoContent,
      });

      marker.addListener('click', (event: any) => {
        // Prevent any default scroll behavior
        if (event?.domEvent) {
          event.domEvent.preventDefault();
          event.domEvent.stopPropagation();
        }

        // Save current scroll position to restore after state change
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;

        // Close all other info windows
        newMarkers.forEach(m => m.infoWindow?.close());

        // Pan map to center the marker with offset for the card
        const latLng = marker.getPosition();
        if (latLng) {
          // Offset the center slightly up so the card doesn't cover the marker
          const offsetLat = latLng.lat() - 0.008; // Shift down so marker appears above card
          map.panTo({ lat: offsetLat, lng: latLng.lng() });
        }

        // Set selected studio to show the preview card (don't navigate yet)
        // Use requestAnimationFrame to ensure scroll position is preserved
        setSelectedStudio(studio);

        // Restore scroll position after React re-render
        requestAnimationFrame(() => {
          window.scrollTo(scrollX, scrollY);
        });
      });

      marker.infoWindow = infoWindow;
      newMarkers.push(marker);
      bounds.extend(position);
    });

    // Add marker clustering if enabled
    if (enableClustering && window.google.maps.MarkerClusterer) {
      if (markerClusterer) {
        markerClusterer.clearMarkers();
      }

      const clusterer = new window.google.maps.MarkerClusterer(map, newMarkers, {
        imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
        maxZoom: 15,
        gridSize: 60,
      });

      setMarkerClusterer(clusterer);
    }

    setMarkers(newMarkers);

    // Fit map to bounds if multiple studios
    if (studios.length > 1) {
      map.fitBounds(bounds);
    }
  }, [map, studios, onStudioClick, enableClustering, userLocation, enableGeolocation]);

  // Get user location
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation || !map) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setUserLocation(location);

        // Add user marker
        new window.google.maps.Marker({
          position: location,
          map,
          title: 'Your Location',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2,
          },
        });

        // Center map on user
        map.setCenter(location);
        map.setZoom(14);
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );
  }, [map]);

  // Get directions to studio
  const getDirectionsToStudio = useCallback((studioId: string) => {
    if (!directionsService || !directionsRenderer || !userLocation) return;

    const studio = studios.find(s => s._id === studioId);
    if (!studio) return;

    const request = {
      origin: userLocation,
      destination: studio.address.coordinates,
      travelMode: window.google.maps.TravelMode.DRIVING,
    };

    directionsService.route(request, (result: any, status: any) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(result);

        // Show route info
        const route = result.routes[0];
        const leg = route.legs[0];

        const routeInfo = `
          <div style="padding: 12px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">Route to ${studio.name}</h4>
            <p style="font-size: 12px; color: #666;">Distance: ${leg.distance.text}</p>
            <p style="font-size: 12px; color: #666;">Duration: ${leg.duration.text}</p>
          </div>
        `;

        // You could show this in a toast or modal
        console.log('Route info:', routeInfo);
      }
    });
  }, [directionsService, directionsRenderer, userLocation, studios]);

  // Make getDirectionsToStudio available globally
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).getDirectionsToStudio = getDirectionsToStudio;
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).getDirectionsToStudio;
      }
    };
  }, [getDirectionsToStudio]);

  // Toggle heatmap
  const toggleHeatmap = useCallback(() => {
    if (!map || !window.google) return;

    if (heatmapLayer) {
      heatmapLayer.setMap(null);
      setHeatmapLayer(null);
    } else {
      const heatmapData = studios.map(studio => ({
        location: new window.google.maps.LatLng(
          studio.address.coordinates.lat,
          studio.address.coordinates.lng
        ),
        weight: studio.metrics?.googleRating || 1,
      }));

      const heatmap = new window.google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        map,
        radius: 50,
        opacity: 0.7,
      });

      setHeatmapLayer(heatmap);
    }
  }, [map, studios, heatmapLayer]);

  // Change map type
  const handleMapTypeChange = (type: string) => {
    if (!map) return;
    map.setMapTypeId(type);
    setMapType(type as any);
  };

  // Find nearest studio
  const findNearestStudio = useCallback(() => {
    if (!userLocation || studios.length === 0) return;

    let nearest = studios[0];
    let minDistance = Infinity;

    studios.forEach(studio => {
      const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
        new window.google.maps.LatLng(userLocation.lat, userLocation.lng),
        new window.google.maps.LatLng(
          studio.address.coordinates.lat,
          studio.address.coordinates.lng
        )
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearest = studio;
      }
    });

    // Center on nearest studio
    map.setCenter(nearest.address.coordinates);
    map.setZoom(16);

    // Open its info window
    const marker = markers.find(m => m.getTitle() === nearest.name);
    if (marker && marker.infoWindow) {
      marker.infoWindow.open(map, marker);
    }

    setSelectedStudio(nearest);
  }, [userLocation, studios, map, markers]);

  if (mapUnavailable) {
    return (
      <Card className="w-full h-[400px] grid place-content-center text-center text-sm text-muted-foreground">
        <div>
          <p>Mapa no disponible.</p>
          <p>Configura VITE_GOOGLE_MAPS_API_KEY y autoriza tu dominio para habilitarlo.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="relative" style={{ overscrollBehavior: 'contain' }}>
      {/* Map Controls */}
      {showControls && (
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {/* Geolocation button */}
          {enableGeolocation && (
            <Button
              onClick={getUserLocation}
              size="sm"
              variant="secondary"
              className="shadow-lg"
            >
              <Navigation className="h-4 w-4 mr-2" />
              My Location
            </Button>
          )}

          {/* Find nearest studio */}
          {enableGeolocation && userLocation && (
            <Button
              onClick={findNearestStudio}
              size="sm"
              variant="secondary"
              className="shadow-lg"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Nearest Studio
            </Button>
          )}

          {/* Toggle heatmap */}
          {enableHeatmap && (
            <Button
              onClick={toggleHeatmap}
              size="sm"
              variant={heatmapLayer ? 'default' : 'secondary'}
              className="shadow-lg"
            >
              <Layers className="h-4 w-4 mr-2" />
              {heatmapLayer ? 'Hide' : 'Show'} Heatmap
            </Button>
          )}

          {/* Map type selector */}
          <Select value={mapType} onValueChange={handleMapTypeChange}>
            <SelectTrigger className="w-36 shadow-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="roadmap">Roadmap</SelectItem>
              <SelectItem value="satellite">Satellite</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
              <SelectItem value="terrain">Terrain</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Studio count badge */}
      <div className="absolute top-4 right-4 z-10">
        <Badge variant="secondary" className="shadow-lg">
          {studios.length} Studios
        </Badge>
      </div>

      {/* Selected studio preview card */}
      {selectedStudio && (
        <Card
          className="absolute bottom-4 left-4 right-4 z-10 max-w-lg mx-auto shadow-2xl border-0 overflow-hidden"
          tabIndex={-1}
          style={{ scrollMargin: 0 }}
        >
          {/* Close button */}
          <button
            onClick={() => setSelectedStudio(null)}
            className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-white/90 hover:bg-white shadow-md transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>

          <div className="flex">
            {/* Photo */}
            <div className="w-28 h-full min-h-[140px] bg-gradient-to-br from-stone-100 to-stone-200 flex-shrink-0">
              {selectedStudio.photos?.[0] ? (
                <img
                  src={selectedStudio.photos[0]}
                  alt={selectedStudio.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-stone-400" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 p-4">
              {/* Header with name and verification */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-base leading-tight line-clamp-2 pr-6">
                  {selectedStudio.name}
                </h3>
              </div>

              {/* Verification badge */}
              {selectedStudio.isVerified && (
                <div className="flex items-center gap-1 text-emerald-600 text-xs mb-2">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Verificado</span>
                </div>
              )}

              {/* Location */}
              <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                {selectedStudio.address.neighborhood || selectedStudio.address.street}
                {selectedStudio.address.neighborhood && `, ${selectedStudio.address.city}`}
              </p>

              {/* Rating */}
              {selectedStudio.metrics?.googleRating && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium text-amber-700">
                      {selectedStudio.metrics.googleRating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({selectedStudio.metrics.googleReviewCount?.toLocaleString()} reseñas)
                  </span>
                </div>
              )}

              {/* Class types / Amenities */}
              {(selectedStudio.classTypes?.length || selectedStudio.amenities?.length) && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {(selectedStudio.classTypes || selectedStudio.amenities || []).slice(0, 3).map((item, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 bg-stone-100 text-stone-600 rounded-full"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => onStudioClick?.(selectedStudio)}
                  size="sm"
                  className="flex-1 bg-stone-900 hover:bg-stone-800"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  Ver Estudio
                </Button>
                {enableGeolocation && userLocation && directionsService && (
                  <Button
                    onClick={() => getDirectionsToStudio(selectedStudio._id)}
                    size="sm"
                    variant="outline"
                    className="px-3"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Map container */}
      <div
        ref={mapRef}
        style={{ height, width: '100%' }}
        className="rounded-lg shadow-lg"
      />
    </div>
  );
}
