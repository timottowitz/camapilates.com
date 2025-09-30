import React, { useState, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Search, MapPin, X, History } from 'lucide-react';

interface StudioSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
  placeholder?: string;
  suggestions?: string[];
  recentSearches?: string[];
  onClearRecent?: () => void;
  location?: {
    enabled: boolean;
    value?: string;
    onChange?: (location: string) => void;
  };
}

const StudioSearch: React.FC<StudioSearchProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Buscar estudios de Pilates...',
  suggestions = [],
  recentSearches = [],
  onClearRecent,
  location,
}) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange(inputValue);
    setOpen(false);
    onSearch?.();
  };

  const handleSuggestionSelect = (suggestion: string) => {
    onChange(suggestion);
    setInputValue(suggestion);
    setOpen(false);
    onSearch?.();
  };

  const handleClear = () => {
    onChange('');
    setInputValue('');
  };

  const filteredSuggestions = suggestions.filter(s =>
    s.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="flex gap-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setOpen(true);
                  }}
                  onFocus={() => setOpen(true)}
                  placeholder={placeholder}
                  className="pl-10 pr-10"
                />
                {inputValue && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </PopoverTrigger>

            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command>
                <CommandList>
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && !inputValue && (
                    <CommandGroup heading="Búsquedas recientes">
                      {recentSearches.map((search, index) => (
                        <CommandItem
                          key={`recent-${index}`}
                          onSelect={() => handleSuggestionSelect(search)}
                        >
                          <History className="mr-2 h-4 w-4 text-gray-400" />
                          {search}
                        </CommandItem>
                      ))}
                      {onClearRecent && (
                        <CommandItem
                          onSelect={onClearRecent}
                          className="text-sm text-gray-500 justify-center"
                        >
                          Limpiar historial
                        </CommandItem>
                      )}
                    </CommandGroup>
                  )}

                  {/* Suggestions */}
                  {filteredSuggestions.length > 0 && (
                    <CommandGroup heading="Sugerencias">
                      {filteredSuggestions.map((suggestion, index) => (
                        <CommandItem
                          key={`suggestion-${index}`}
                          onSelect={() => handleSuggestionSelect(suggestion)}
                        >
                          <Search className="mr-2 h-4 w-4 text-gray-400" />
                          {suggestion}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {inputValue && filteredSuggestions.length === 0 && (
                    <CommandEmpty>No se encontraron sugerencias</CommandEmpty>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Button type="submit" className="px-6">
            Buscar
          </Button>
        </div>
      </form>

      {/* Location Filter */}
      {location?.enabled && (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">Ubicación:</span>
          {location.value ? (
            <Badge variant="secondary" className="gap-1">
              {location.value}
              <button
                onClick={() => location.onChange?.('')}
                className="ml-1 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Get user location
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      location.onChange?.('Mi ubicación actual');
                    },
                    (error) => {
                      console.error('Error getting location:', error);
                    }
                  );
                }
              }}
            >
              Usar mi ubicación
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default StudioSearch;