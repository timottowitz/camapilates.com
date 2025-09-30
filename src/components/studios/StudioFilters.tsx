import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';

export interface FilterOptions {
  neighborhoods: string[];
  priceRange: [number, number];
  rating: number;
  classTypes: string[];
  equipment: string[];
  amenities: string[];
  distance?: number;
}

interface StudioFiltersProps {
  filters: FilterOptions;
  onChange: (filters: FilterOptions) => void;
  availableOptions: {
    neighborhoods: string[];
    classTypes: string[];
    equipment: string[];
    amenities: string[];
    maxPrice: number;
  };
  activeCount?: number;
  onReset?: () => void;
}

const StudioFilters: React.FC<StudioFiltersProps> = ({
  filters,
  onChange,
  availableOptions,
  activeCount = 0,
  onReset,
}) => {
  const handleNeighborhoodToggle = (neighborhood: string) => {
    const newNeighborhoods = filters.neighborhoods.includes(neighborhood)
      ? filters.neighborhoods.filter(n => n !== neighborhood)
      : [...filters.neighborhoods, neighborhood];
    onChange({ ...filters, neighborhoods: newNeighborhoods });
  };

  const handleClassTypeToggle = (classType: string) => {
    const newTypes = filters.classTypes.includes(classType)
      ? filters.classTypes.filter(t => t !== classType)
      : [...filters.classTypes, classType];
    onChange({ ...filters, classTypes: newTypes });
  };

  const handleEquipmentToggle = (equipment: string) => {
    const newEquipment = filters.equipment.includes(equipment)
      ? filters.equipment.filter(e => e !== equipment)
      : [...filters.equipment, equipment];
    onChange({ ...filters, equipment: newEquipment });
  };

  const handleAmenityToggle = (amenity: string) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity];
    onChange({ ...filters, amenities: newAmenities });
  };

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            <CardTitle>Filtros</CardTitle>
            {activeCount > 0 && (
              <Badge variant="secondary">{activeCount}</Badge>
            )}
          </div>
          {activeCount > 0 && onReset && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-xs"
            >
              Limpiar todo
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Accordion type="multiple" defaultValue={['neighborhoods', 'price', 'rating']}>
          {/* Neighborhoods */}
          <AccordionItem value="neighborhoods">
            <AccordionTrigger>
              Colonias
              {filters.neighborhoods.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {filters.neighborhoods.length}
                </Badge>
              )}
            </AccordionTrigger>
            <AccordionContent className="space-y-2 max-h-64 overflow-y-auto">
              {availableOptions.neighborhoods.map(neighborhood => (
                <div key={neighborhood} className="flex items-center space-x-2">
                  <Checkbox
                    id={`neighborhood-${neighborhood}`}
                    checked={filters.neighborhoods.includes(neighborhood)}
                    onCheckedChange={() => handleNeighborhoodToggle(neighborhood)}
                  />
                  <Label
                    htmlFor={`neighborhood-${neighborhood}`}
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    {neighborhood}
                  </Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

          {/* Price Range */}
          <AccordionItem value="price">
            <AccordionTrigger>
              Precio por clase
              {filters.priceRange[0] > 0 || filters.priceRange[1] < availableOptions.maxPrice ? (
                <Badge variant="outline" className="ml-2">
                  ${filters.priceRange[0]} - ${filters.priceRange[1]}
                </Badge>
              ) : null}
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="px-3">
                <Slider
                  min={0}
                  max={availableOptions.maxPrice}
                  step={50}
                  value={filters.priceRange}
                  onValueChange={(value) =>
                    onChange({ ...filters, priceRange: value as [number, number] })
                  }
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>${filters.priceRange[0]}</span>
                  <span>${filters.priceRange[1]}</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Rating */}
          <AccordionItem value="rating">
            <AccordionTrigger>
              Calificación mínima
              {filters.rating > 0 && (
                <Badge variant="outline" className="ml-2">
                  {filters.rating}+ ⭐
                </Badge>
              )}
            </AccordionTrigger>
            <AccordionContent>
              <Select
                value={filters.rating.toString()}
                onValueChange={(value) =>
                  onChange({ ...filters, rating: parseFloat(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Cualquier calificación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Cualquier calificación</SelectItem>
                  <SelectItem value="3">3+ estrellas</SelectItem>
                  <SelectItem value="3.5">3.5+ estrellas</SelectItem>
                  <SelectItem value="4">4+ estrellas</SelectItem>
                  <SelectItem value="4.5">4.5+ estrellas</SelectItem>
                </SelectContent>
              </Select>
            </AccordionContent>
          </AccordionItem>

          {/* Distance */}
          {filters.distance !== undefined && (
            <AccordionItem value="distance">
              <AccordionTrigger>
                Distancia máxima
                {filters.distance > 0 && (
                  <Badge variant="outline" className="ml-2">
                    {filters.distance}km
                  </Badge>
                )}
              </AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="px-3">
                  <Slider
                    min={0.5}
                    max={20}
                    step={0.5}
                    value={[filters.distance]}
                    onValueChange={(value) =>
                      onChange({ ...filters, distance: value[0] })
                    }
                    className="mt-2"
                  />
                  <div className="text-center text-xs text-gray-500 mt-1">
                    {filters.distance}km
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Class Types */}
          <AccordionItem value="classTypes">
            <AccordionTrigger>
              Tipos de clase
              {filters.classTypes.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {filters.classTypes.length}
                </Badge>
              )}
            </AccordionTrigger>
            <AccordionContent className="space-y-2 max-h-64 overflow-y-auto">
              {availableOptions.classTypes.map(type => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={filters.classTypes.includes(type)}
                    onCheckedChange={() => handleClassTypeToggle(type)}
                  />
                  <Label
                    htmlFor={`type-${type}`}
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    {type}
                  </Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

          {/* Equipment */}
          <AccordionItem value="equipment">
            <AccordionTrigger>
              Equipamiento
              {filters.equipment.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {filters.equipment.length}
                </Badge>
              )}
            </AccordionTrigger>
            <AccordionContent className="space-y-2 max-h-64 overflow-y-auto">
              {availableOptions.equipment.map(item => (
                <div key={item} className="flex items-center space-x-2">
                  <Checkbox
                    id={`equipment-${item}`}
                    checked={filters.equipment.includes(item)}
                    onCheckedChange={() => handleEquipmentToggle(item)}
                  />
                  <Label
                    htmlFor={`equipment-${item}`}
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    {item}
                  </Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

          {/* Amenities */}
          <AccordionItem value="amenities">
            <AccordionTrigger>
              Servicios
              {filters.amenities.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {filters.amenities.length}
                </Badge>
              )}
            </AccordionTrigger>
            <AccordionContent className="space-y-2 max-h-64 overflow-y-auto">
              {availableOptions.amenities.map(amenity => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={`amenity-${amenity}`}
                    checked={filters.amenities.includes(amenity)}
                    onCheckedChange={() => handleAmenityToggle(amenity)}
                  />
                  <Label
                    htmlFor={`amenity-${amenity}`}
                    className="text-sm font-normal cursor-pointer flex-1"
                  >
                    {amenity}
                  </Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default StudioFilters;