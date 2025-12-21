import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Save,
  Upload,
  Image as ImageIcon,
  X,
  Check,
  Loader2,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

interface Teacher {
  _id: Id<'teachers'>;
  slug: string;
  fullName: { value: string };
  citySlug: string;
  cityName: { value: string };
  bio?: { value: string };
  specializations: { value: string[] };
  experienceYears?: { value: number };
  teachingHours?: { value: number };
  languages?: { value: string[] };
  social?: {
    instagram?: { value: string };
  };
  contact?: {
    whatsapp?: { value: string };
    bookingUrl?: { value: string };
  };
  status: string;
  isVerified: boolean;
  isActive: boolean;
  photoUrl?: string;
  galleryPhotoCount: number;
  updatedAt: number;
}

interface GalleryPhoto {
  _id: Id<'teacherPhotos'>;
  url: string | null;
  caption?: string;
}

const AdminTeacherProfiles = () => {
  const token = localStorage.getItem('admint') || '';
  const [cityFilter, setCityFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [editingCell, setEditingCell] = useState<{ teacherId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [galleryTeacher, setGalleryTeacher] = useState<Teacher | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState<{ teacherId: string; type: 'profile' | 'gallery' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const teachersData = useQuery(api.teachersAdmin.listAll, {
    token,
    cityFilter: cityFilter || undefined,
    statusFilter: statusFilter || undefined,
    limit: 100,
  });

  const cities = useQuery(api.teachersAdmin.getCities, { token });
  const galleryPhotos = useQuery(
    api.teachersAdmin.getGalleryPhotos,
    galleryTeacher ? { token, teacherId: galleryTeacher._id } : 'skip'
  ) as GalleryPhoto[] | undefined;

  const updateField = useMutation(api.teachersAdmin.updateField);
  const generateUploadUrl = useMutation(api.teachersAdmin.generateUploadUrl);
  const savePhoto = useMutation(api.teachersAdmin.savePhoto);
  const deleteGalleryPhoto = useMutation(api.teachersAdmin.deleteGalleryPhoto);

  const teachers = teachersData?.teachers || [];
  const total = teachersData?.total || 0;

  const startEdit = (teacherId: string, field: string, currentValue: string) => {
    setEditingCell({ teacherId, field });
    setEditValue(currentValue);
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const saveEdit = async () => {
    if (!editingCell) return;

    try {
      await updateField({
        token,
        teacherId: editingCell.teacherId as Id<'teachers'>,
        field: editingCell.field,
        value: editValue,
      });
      toast.success('Field updated');
      cancelEdit();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update');
    }
  };

  const handlePhotoUpload = async (teacherId: Id<'teachers'>, type: 'profile' | 'gallery') => {
    setUploadingPhoto({ teacherId, type });
    fileInputRef.current?.click();
  };

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingPhoto) {
      setUploadingPhoto(null);
      return;
    }

    try {
      const uploadUrl = await generateUploadUrl({ token });
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      const { storageId } = await response.json();

      await savePhoto({
        token,
        teacherId: uploadingPhoto.teacherId as Id<'teachers'>,
        storageId,
        type: uploadingPhoto.type,
      });

      toast.success(`${uploadingPhoto.type === 'profile' ? 'Profile photo' : 'Gallery photo'} uploaded`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteGalleryPhoto = async (photoId: Id<'teacherPhotos'>) => {
    if (!confirm('Delete this photo?')) return;

    try {
      await deleteGalleryPhoto({ token, photoId });
      toast.success('Photo deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete photo');
    }
  };

  const statusColors: Record<string, string> = {
    scraped: 'bg-gray-100 text-gray-700',
    claimed: 'bg-blue-100 text-blue-700',
    verified: 'bg-green-100 text-green-700',
    suspended: 'bg-red-100 text-red-700',
  };

  const EditableCell = ({
    teacherId,
    field,
    value,
    placeholder = '-',
  }: {
    teacherId: string;
    field: string;
    value: string;
    placeholder?: string;
  }) => {
    const isEditing = editingCell?.teacherId === teacherId && editingCell?.field === field;

    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-7 text-xs w-full"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit();
              if (e.key === 'Escape') cancelEdit();
            }}
          />
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={saveEdit}>
            <Check className="h-3 w-3 text-green-600" />
          </Button>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={cancelEdit}>
            <X className="h-3 w-3 text-red-600" />
          </Button>
        </div>
      );
    }

    return (
      <div
        className="cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded min-h-[24px] text-xs"
        onClick={() => startEdit(teacherId, field, value)}
        title="Click to edit"
      >
        {value || <span className="text-gray-400">{placeholder}</span>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileSelected}
      />

      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-[1800px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">Teacher Profiles</h1>
            <Badge variant="secondary">{total} total</Badge>
          </div>

          <div className="flex items-center gap-3">
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-[180px] h-8 text-xs">
                <SelectValue placeholder="All cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All cities</SelectItem>
                {cities?.map((city) => (
                  <SelectItem key={city.slug} value={city.slug}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="scraped">Scraped</SelectItem>
                <SelectItem value="claimed">Claimed</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="max-w-[1800px] mx-auto px-4 py-4">
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-12">Photo</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase min-w-[150px]">Name</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-24">City</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase min-w-[200px]">Bio</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-20">Exp (yrs)</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-20">Hours</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-28">Instagram</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-28">WhatsApp</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-20">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-20">Gallery</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-16">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {teachers.map((teacher: Teacher) => (
                  <tr key={teacher._id} className="hover:bg-gray-50/50">
                    {/* Profile Photo */}
                    <td className="px-3 py-2">
                      <div className="relative group">
                        {teacher.photoUrl ? (
                          <img
                            src={teacher.photoUrl}
                            alt={teacher.fullName.value}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                            {teacher.fullName.value.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <button
                          onClick={() => handlePhotoUpload(teacher._id, 'profile')}
                          className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          disabled={uploadingPhoto?.teacherId === teacher._id}
                        >
                          {uploadingPhoto?.teacherId === teacher._id && uploadingPhoto.type === 'profile' ? (
                            <Loader2 className="w-4 h-4 text-white animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 text-white" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Name */}
                    <td className="px-3 py-2">
                      <EditableCell
                        teacherId={teacher._id}
                        field="fullName"
                        value={teacher.fullName.value}
                      />
                    </td>

                    {/* City (read-only) */}
                    <td className="px-3 py-2 text-xs text-gray-600">
                      {teacher.cityName?.value || teacher.citySlug}
                    </td>

                    {/* Bio */}
                    <td className="px-3 py-2">
                      <EditableCell
                        teacherId={teacher._id}
                        field="bio"
                        value={teacher.bio?.value || ''}
                        placeholder="Add bio..."
                      />
                    </td>

                    {/* Experience Years */}
                    <td className="px-3 py-2">
                      <EditableCell
                        teacherId={teacher._id}
                        field="experienceYears"
                        value={teacher.experienceYears?.value?.toString() || ''}
                        placeholder="-"
                      />
                    </td>

                    {/* Teaching Hours */}
                    <td className="px-3 py-2">
                      <EditableCell
                        teacherId={teacher._id}
                        field="teachingHours"
                        value={teacher.teachingHours?.value?.toString() || ''}
                        placeholder="-"
                      />
                    </td>

                    {/* Instagram */}
                    <td className="px-3 py-2">
                      <EditableCell
                        teacherId={teacher._id}
                        field="instagram"
                        value={teacher.social?.instagram?.value || ''}
                        placeholder="@handle"
                      />
                    </td>

                    {/* WhatsApp */}
                    <td className="px-3 py-2">
                      <EditableCell
                        teacherId={teacher._id}
                        field="whatsapp"
                        value={teacher.contact?.whatsapp?.value || ''}
                        placeholder="+52..."
                      />
                    </td>

                    {/* Status */}
                    <td className="px-3 py-2">
                      <Select
                        value={teacher.status}
                        onValueChange={async (value) => {
                          try {
                            await updateField({
                              token,
                              teacherId: teacher._id,
                              field: 'status',
                              value,
                            });
                            toast.success('Status updated');
                          } catch (err: any) {
                            toast.error(err.message);
                          }
                        }}
                      >
                        <SelectTrigger className={`h-6 text-xs w-24 ${statusColors[teacher.status] || ''}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scraped">Scraped</SelectItem>
                          <SelectItem value="claimed">Claimed</SelectItem>
                          <SelectItem value="verified">Verified</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>

                    {/* Gallery */}
                    <td className="px-3 py-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-xs gap-1"
                        onClick={() => setGalleryTeacher(teacher)}
                      >
                        <ImageIcon className="w-3 h-3" />
                        {teacher.galleryPhotoCount}
                      </Button>
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-2">
                      <a
                        href={`/instructores-pilates/${teacher.citySlug}/${teacher.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {teachers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No teachers found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gallery Dialog */}
      <Dialog open={!!galleryTeacher} onOpenChange={(open) => !open && setGalleryTeacher(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gallery - {galleryTeacher?.fullName.value}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Upload Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => galleryTeacher && handlePhotoUpload(galleryTeacher._id, 'gallery')}
              disabled={uploadingPhoto?.type === 'gallery'}
            >
              {uploadingPhoto?.type === 'gallery' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Upload Photo
            </Button>

            {/* Photo Grid */}
            <div className="grid grid-cols-3 gap-3">
              {galleryPhotos?.map((photo) => (
                <div key={photo._id} className="relative group aspect-square">
                  {photo.url ? (
                    <img
                      src={photo.url}
                      alt={photo.caption || 'Gallery photo'}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <button
                    onClick={() => handleDeleteGalleryPhoto(photo._id)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {(!galleryPhotos || galleryPhotos.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                No gallery photos yet
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTeacherProfiles;
