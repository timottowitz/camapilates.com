import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export interface UploadedPhoto {
  storageId: Id<'_storage'>;
  type: string;
  caption?: string;
  previewUrl: string;
}

interface ClaimPhotoUploadProps {
  teacherId?: Id<'teachers'>;
  email?: string;
  photos: UploadedPhoto[];
  onPhotosChange: (photos: UploadedPhoto[]) => void;
  maxPhotos?: number;
}

const PHOTO_TYPES = [
  { value: 'profile', label: 'Foto de perfil' },
  { value: 'action', label: 'En acción / Enseñando' },
  { value: 'studio', label: 'En el estudio' },
  { value: 'certificate', label: 'Certificación' },
];

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

export const ClaimPhotoUpload: React.FC<ClaimPhotoUploadProps> = ({
  teacherId,
  email,
  photos,
  onPhotosChange,
  maxPhotos = 5,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const latestPhotosRef = useRef<UploadedPhoto[]>(photos);

  useEffect(() => {
    latestPhotosRef.current = photos;
  }, [photos]);

  useEffect(() => {
    return () => {
      // Avoid leaking object URLs if the user leaves mid-flow
      latestPhotosRef.current.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
  }, []);

  const generateUploadUrl = useMutation(api.teacherClaims.generatePhotoUploadUrl);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!teacherId || !email) {
      toast.error('Completa tu email antes de subir fotos.');
      return;
    }

    const remainingSlots = maxPhotos - photos.length;
    if (remainingSlots <= 0) return;

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setIsUploading(true);

    try {
      const newPhotos: UploadedPhoto[] = [];

      for (const file of filesToUpload) {
        if (!file.type.startsWith('image/')) {
          toast.error('Solo se permiten imágenes.');
          continue;
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
          toast.error(`La imagen "${file.name}" es muy grande (máx. 8MB).`);
          continue;
        }

        const uploadUrl = await generateUploadUrl({ teacherId, email });

        const response = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': file.type },
          body: file,
        });

        if (!response.ok) {
          console.error('Upload failed:', response.statusText);
          toast.error(`No se pudo subir "${file.name}".`);
          continue;
        }

        const { storageId } = await response.json();
        const previewUrl = URL.createObjectURL(file);

        newPhotos.push({
          storageId,
          type: photos.length === 0 && newPhotos.length === 0 ? 'profile' : 'action',
          previewUrl,
        });
      }

      onPhotosChange([...photos, ...newPhotos]);
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast.error('Error al subir fotos. Intenta de nuevo.');
    } finally {
      setIsUploading(false);
    }
  }, [teacherId, email, photos, onPhotosChange, maxPhotos, generateUploadUrl]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  }, [handleFiles]);

  const removePhoto = useCallback((index: number) => {
    const newPhotos = [...photos];
    URL.revokeObjectURL(newPhotos[index].previewUrl);
    newPhotos.splice(index, 1);
    onPhotosChange(newPhotos);
  }, [photos, onPhotosChange]);

  const updatePhotoType = useCallback((index: number, type: string) => {
    const newPhotos = [...photos];
    newPhotos[index] = { ...newPhotos[index], type };
    onPhotosChange(newPhotos);
  }, [photos, onPhotosChange]);

  const updatePhotoCaption = useCallback((index: number, caption: string) => {
    const newPhotos = [...photos];
    newPhotos[index] = { ...newPhotos[index], caption };
    onPhotosChange(newPhotos);
  }, [photos, onPhotosChange]);

  const canAddMore = photos.length < maxPhotos;

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      {canAddMore && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-[#3E2723] bg-[#3E2723]/5'
              : 'border-[#2A2624]/20 hover:border-[#2A2624]/40'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-[#3E2723] animate-spin" />
              <p className="text-sm text-[#5D5550]">Subiendo fotos...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-[#5D5550]" />
              <p className="text-sm text-[#5D5550]">
                Arrastra fotos aquí o <span className="text-[#3E2723] font-medium">haz clic para seleccionar</span>
              </p>
              <p className="text-xs text-[#5D5550]/70">
                Hasta {maxPhotos} fotos (JPG, PNG, WebP)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {photos.map((photo, index) => (
            <div
              key={photo.storageId}
              className="relative border border-[#2A2624]/10 rounded-lg overflow-hidden bg-white"
            >
              <div className="aspect-[4/3] relative">
                <img
                  src={photo.previewUrl}
                  alt={`Foto ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full hover:bg-red-50 transition-colors"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
                {index === 0 && photo.type === 'profile' && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-[#3E2723] text-white text-xs rounded-full">
                    Foto Principal
                  </div>
                )}
              </div>
              
              <div className="p-3 space-y-2">
                <Select
                  value={photo.type}
                  onValueChange={(value) => updatePhotoType(index, value)}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PHOTO_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Input
                  type="text"
                  placeholder="Descripcion (opcional)"
                  value={photo.caption || ''}
                  onChange={(e) => updatePhotoCaption(index, e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status */}
      <div className="flex items-center justify-between text-xs text-[#5D5550]">
        <span className="flex items-center gap-1">
          <ImageIcon className="w-3 h-3" />
          {photos.length} de {maxPhotos} fotos
        </span>
        {photos.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
              onPhotosChange([]);
            }}
            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Eliminar todas
          </Button>
        )}
      </div>
    </div>
  );
};

export default ClaimPhotoUpload;
