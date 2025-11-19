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
import { X, Filter, Sparkles } from 'lucide-react';

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
    <Card className="sticky top-4 border-[#2A2624]/10 shadow-lg shadow-[#3E2723]/5 overflow-hidden">
      {/* Decorative Top Border */}
      <div className="h-1 bg-gradient-to-r from-[#3E2723] via-[#5D5550] to-[#3E2723]" />

      <CardHeader className="pb-4 bg-gradient-to-br from-white to-[#EAE8E4]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#2A2624] rounded-lg">
              <Filter className="w-4 h-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-serif text-[#2A2624]">Filtros</CardTitle>
              {activeCount > 0 && (
                <p className="text-xs text-[#5D5550] mt-0.5">
                  {activeCount} {activeCount === 1 ? 'filtro activo' : 'filtros activos'}
                </p>
              )}
            </div>
          </div>
          {activeCount > 0 && onReset && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-xs text-[#5D5550] hover:text-[#2A2624] hover:bg-[#2A2624]/5"
            >
              <X className="w-3 h-3 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-0 p-0">
        <Accordion type="multiple" defaultValue={['neighborhoods', 'price', 'rating']} className="w-full">
          {/* Neighborhoods */}
          <AccordionItem value="neighborhoods" className="border-b border-[#2A2624]/10 px-6">
            <AccordionTrigger className="py-4 hover:no-underline group">
              <div className="flex items-center justify-between w-full pr-4">
                <span className="font-sans text-sm font-medium text-[#2A2624] group-hover:text-[#3E2723]">
                  Colonias
                </span>
                {filters.neighborhoods.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-[#3E2723] text-white text-xs px-2 py-0.5"
                  >
                    {filters.neighborhoods.length}
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pb-4 max-h-64 overflow-y-auto">
              {availableOptions.neighborhoods.map(neighborhood => (
                <div key={neighborhood} className="flex items-center space-x-3 group">
                  <Checkbox
                    id={`neighborhood-${neighborhood}`}
                    checked={filters.neighborhoods.includes(neighborhood)}
                    onCheckedChange={() => handleNeighborhoodToggle(neighborhood)}
                    className="border-[#2A2624]/30 data-[state=checked]:bg-[#2A2624] data-[state=checked]:border-[#2A2624]"
                  />
                  <Label
                    htmlFor={`neighborhood-${neighborhood}`}
                    className="text-sm font-normal cursor-pointer flex-1 text-[#5D5550] group-hover:text-[#2A2624] transition-colors"
                  >
                    {neighborhood}
                  </Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

          {/* Price Range */}
          <AccordionItem value="price" className="border-b border-[#2A2624]/10 px-6">
            <AccordionTrigger className="py-4 hover:no-underline group">
              <div className="flex items-center justify-between w-full pr-4">
                <span className="font-sans text-sm font-medium text-[#2A2624] group-hover:text-[#3E2723]">
                  Precio por clase
                </span>
                {(filters.priceRange[0] > 0 || filters.priceRange[1] < availableOptions.maxPrice) && (
                  <Badge
                    variant="secondary"
                    className="bg-[#3E2723] text-white text-xs px-2 py-0.5 font-mono"
                  >
                    ${filters.priceRange[0]} - ${filters.priceRange[1]}
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pb-4">
              <div className="px-2">
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
                <div className="flex justify-between mt-3">
                  <div className="text-center">
                    <p className="text-xs text-[#5D5550] mb-1">Mínimo</p>
                    <p className="font-serif text-lg text-[#2A2624] font-medium">
                      ${filters.priceRange[0]}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-[#5D5550] mb-1">Máximo</p>
                    <p className="font-serif text-lg text-[#2A2624] font-medium">
                      ${filters.priceRange[1]}
                    </p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Rating */}
          <AccordionItem value="rating" className="border-b border-[#2A2624]/10 px-6">
            <AccordionTrigger className="py-4 hover:no-underline group">
              <div className="flex items-center justify-between w-full pr-4">
                <span className="font-sans text-sm font-medium text-[#2A2624] group-hover:text-[#3E2723]">
                  Calificación mínima
                </span>
                {filters.rating > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-[#D9865B] text-white text-xs px-2 py-0.5"
                  >
                    {filters.rating}+ ⭐
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <Select
                value={filters.rating.toString()}
                onValueChange={(value) =>
                  onChange({ ...filters, rating: parseFloat(value) })
                }
              >
                <SelectTrigger className="border-[#2A2624]/20 focus:ring-[#2A2624]">
                  <SelectValue placeholder="Cualquier calificación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Cualquier calificación</SelectItem>
                  <SelectItem value="3">⭐⭐⭐ 3+ estrellas</SelectItem>
                  <SelectItem value="3.5">⭐⭐⭐ 3.5+ estrellas</SelectItem>
                  <SelectItem value="4">⭐⭐⭐⭐ 4+ estrellas</SelectItem>
                  <SelectItem value="4.5">⭐⭐⭐⭐ 4.5+ estrellas</SelectItem>
                </SelectContent>
              </Select>
            </AccordionContent>
          </AccordionItem>

          {/* Distance */}
          {filters.distance !== undefined && (
            <AccordionItem value="distance" className="border-b border-[#2A2624]/10 px-6">
              <AccordionTrigger className="py-4 hover:no-underline group">
                <div className="flex items-center justify-between w-full pr-4">
                  <span className="font-sans text-sm font-medium text-[#2A2624] group-hover:text-[#3E2723]">
                    Distancia máxima
                  </span>
                  {filters.distance > 0 && (
                    <Badge
                      variant="secondary"
                      className="bg-[#3E2723] text-white text-xs px-2 py-0.5"
                    >
                      {filters.distance}km
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pb-4">
                <div className="px-2">
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
                  <div className="text-center mt-3">
                    <p className="font-serif text-xl text-[#2A2624] font-medium">
                      {filters.distance}km
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Class Types */}
          <AccordionItem value="classTypes" className="border-b border-[#2A2624]/10 px-6">
            <AccordionTrigger className="py-4 hover:no-underline group">
              <div className="flex items-center justify-between w-full pr-4">
                <span className="font-sans text-sm font-medium text-[#2A2624] group-hover:text-[#3E2723]">
                  Tipos de clase
                </span>
                {filters.classTypes.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-[#3E2723] text-white text-xs px-2 py-0.5"
                  >
                    {filters.classTypes.length}
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pb-4 max-h-64 overflow-y-auto">
              {availableOptions.classTypes.map(type => (
                <div key={type} className="flex items-center space-x-3 group">
                  <Checkbox
                    id={`type-${type}`}
                    checked={filters.classTypes.includes(type)}
                    onCheckedChange={() => handleClassTypeToggle(type)}
                    className="border-[#2A2624]/30 data-[state=checked]:bg-[#2A2624] data-[state=checked]:border-[#2A2624]"
                  />
                  <Label
                    htmlFor={`type-${type}`}
                    className="text-sm font-normal cursor-pointer flex-1 text-[#5D5550] group-hover:text-[#2A2624] transition-colors"
                  >
                    {type}
                  </Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

          {/* Equipment */}
          <AccordionItem value="equipment" className="border-b border-[#2A2624]/10 px-6">
            <AccordionTrigger className="py-4 hover:no-underline group">
              <div className="flex items-center justify-between w-full pr-4">
                <span className="font-sans text-sm font-medium text-[#2A2624] group-hover:text-[#3E2723]">
                  Equipamiento
                </span>
                {filters.equipment.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-[#3E2723] text-white text-xs px-2 py-0.5"
                  >
                    {filters.equipment.length}
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pb-4 max-h-64 overflow-y-auto">
              {availableOptions.equipment.map(item => (
                <div key={item} className="flex items-center space-x-3 group">
                  <Checkbox
                    id={`equipment-${item}`}
                    checked={filters.equipment.includes(item)}
                    onCheckedChange={() => handleEquipmentToggle(item)}
                    className="border-[#2A2624]/30 data-[state=checked]:bg-[#2A2624] data-[state=checked]:border-[#2A2624]"
                  />
                  <Label
                    htmlFor={`equipment-${item}`}
                    className="text-sm font-normal cursor-pointer flex-1 text-[#5D5550] group-hover:text-[#2A2624] transition-colors"
                  >
                    {item}
                  </Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

          {/* Amenities */}
          <AccordionItem value="amenities" className="px-6 border-none">
            <AccordionTrigger className="py-4 hover:no-underline group">
              <div className="flex items-center justify-between w-full pr-4">
                <span className="font-sans text-sm font-medium text-[#2A2624] group-hover:text-[#3E2723]">
                  Servicios
                </span>
                {filters.amenities.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-[#3E2723] text-white text-xs px-2 py-0.5"
                  >
                    {filters.amenities.length}
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pb-4 max-h-64 overflow-y-auto">
              {availableOptions.amenities.map(amenity => (
                <div key={amenity} className="flex items-center space-x-3 group">
                  <Checkbox
                    id={`amenity-${amenity}`}
                    checked={filters.amenities.includes(amenity)}
                    onCheckedChange={() => handleAmenityToggle(amenity)}
                    className="border-[#2A2624]/30 data-[state=checked]:bg-[#2A2624] data-[state=checked]:border-[#2A2624]"
                  />
                  <Label
                    htmlFor={`amenity-${amenity}`}
                    className="text-sm font-normal cursor-pointer flex-1 text-[#5D5550] group-hover:text-[#2A2624] transition-colors"
                  >
                    {amenity}
                  </Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>

      {/* Decorative Bottom */}
      <div className="h-2 bg-gradient-to-r from-transparent via-[#EAE8E4] to-transparent" />
    </Card>
  );
};

export default StudioFilters;
