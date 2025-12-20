import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { normalizeTeacherSlugForUrl } from '@/lib/teacherSlug';
import { instagramHandle } from '@/lib/social';
import {
  ArrowLeft,
  User,
  MapPin,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react';

interface ClaimPhoto {
  storageId: Id<'_storage'>;
  url: string | null;
  type: string;
  caption?: string;
  uploadedAt: number;
}

interface ProposedProfile {
  bio?: string;
  specializations?: string[];
  experienceYears?: number;
  languages?: string[];
  teachingStyle?: {
    vibe?: string[];
    classPace?: string;
    musicStyle?: string;
    classSize?: string;
  };
  certifications?: Array<{
    name: string;
    organization?: string;
    year?: number;
  }>;
  trainingLineage?: string;
  teachingHours?: number;
  whatsapp?: string;
  bookingUrl?: string;
  instagram?: string;
  website?: string;
  neighborhoods?: string[];
  homeVisits?: boolean;
}

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : [];

const AdminTeacherClaims: React.FC = () => {
  const [selectedClaimId, setSelectedClaimId] = useState<Id<'teacherClaims'> | null>(null);
  const [approvedFields, setApprovedFields] = useState<string[]>([]);
  const [approvedPhotoIndices, setApprovedPhotoIndices] = useState<number[]>([]);
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const didAutoSelectFieldsForClaim = useRef<Id<'teacherClaims'> | null>(null);

  const token = typeof window !== 'undefined' ? (localStorage.getItem('admint') || '') : '';

  const pendingClaims = useQuery(
    api.teacherClaimsAdmin.listPending,
    token ? { token } : 'skip'
  );
  const claimDetails = useQuery(
    api.teacherClaimsAdmin.getClaimDetails,
    selectedClaimId && token ? { claimId: selectedClaimId, token } : 'skip'
  );
  const claimTeacherName = isNonEmptyString(claimDetails?.claim?.teacherName)
    ? claimDetails.claim.teacherName
    : 'Instructor';

  const approveMutation = useMutation(api.teacherClaimsAdmin.approve);
  const approveAllMutation = useMutation(api.teacherClaimsAdmin.approveAll);
  const rejectMutation = useMutation(api.teacherClaimsAdmin.reject);
  const deleteMutation = useMutation(api.teacherClaimsAdmin.deleteClaim);
  const sendWelcomeEmailAction = useAction(api.instructorEmail.sendWelcomeEmail);

  const handleOpenReview = (claimId: Id<'teacherClaims'>) => {
    setSelectedClaimId(claimId);
    setApprovedFields([]);
    setApprovedPhotoIndices([]);
    setAdminNotes('');
    didAutoSelectFieldsForClaim.current = null;
  };

  const handleCloseReview = () => {
    setSelectedClaimId(null);
    setApprovedFields([]);
    setApprovedPhotoIndices([]);
    setAdminNotes('');
    didAutoSelectFieldsForClaim.current = null;
  };

  const toggleField = (field: string) => {
    setApprovedFields(prev =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  };

  const togglePhoto = (index: number) => {
    setApprovedPhotoIndices(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  useEffect(() => {
    if (!selectedClaimId || !claimDetails) return;
    if (didAutoSelectFieldsForClaim.current === selectedClaimId) return;

    const profile = claimDetails.claim.proposedProfile as ProposedProfile | undefined;
    const teacher = claimDetails.teacher as any;
    if (!profile) {
      didAutoSelectFieldsForClaim.current = selectedClaimId;
      return;
    }

    const normalizeText = (value: unknown) =>
      typeof value === 'string' ? value.trim().toLowerCase() : '';
    const normalizeList = (value: unknown) =>
      Array.isArray(value)
        ? value
            .map((v) => (typeof v === 'string' ? v.trim().toLowerCase() : ''))
            .filter(Boolean)
            .sort()
        : [];

    const next: string[] = [];

    if (profile.bio && normalizeText(profile.bio) !== normalizeText(teacher?.bio?.value)) next.push('bio');
    if (
      profile.specializations?.length &&
      normalizeList(profile.specializations).join('|') !==
        normalizeList(teacher?.specializations?.value).join('|')
    ) {
      next.push('specializations');
    }
    if (
      typeof profile.experienceYears === 'number' &&
      profile.experienceYears !== teacher?.experienceYears?.value
    ) {
      next.push('experienceYears');
    }
    if (
      profile.languages?.length &&
      normalizeList(profile.languages).join('|') !== normalizeList(teacher?.languages?.value).join('|')
    ) {
      next.push('languages');
    }
    if (profile.whatsapp && normalizeText(profile.whatsapp) !== normalizeText(teacher?.contact?.whatsapp?.value)) {
      next.push('whatsapp');
    }
    if (profile.bookingUrl && normalizeText(profile.bookingUrl) !== normalizeText(teacher?.contact?.bookingUrl?.value)) {
      next.push('bookingUrl');
    }
    if (profile.instagram && normalizeText(profile.instagram) !== normalizeText(teacher?.social?.instagram?.value)) {
      next.push('instagram');
    }
    if (profile.website && normalizeText(profile.website) !== normalizeText(teacher?.social?.website?.value)) {
      next.push('website');
    }

    setApprovedFields(next);
    didAutoSelectFieldsForClaim.current = selectedClaimId;
  }, [claimDetails, selectedClaimId]);

  const selectAllFields = () => {
    if (!claimDetails?.claim.proposedProfile) return;
    const profile = claimDetails.claim.proposedProfile as ProposedProfile;
    const allFields: string[] = [];
    if (profile.bio) allFields.push('bio');
    if (profile.specializations) allFields.push('specializations');
    if (typeof profile.experienceYears === 'number') allFields.push('experienceYears');
    if (profile.languages) allFields.push('languages');
    if (profile.whatsapp) allFields.push('whatsapp');
    if (profile.bookingUrl) allFields.push('bookingUrl');
    if (profile.instagram) allFields.push('instagram');
    if (profile.website) allFields.push('website');
    setApprovedFields(allFields);
  };

  const selectAllPhotos = () => {
    if (!claimDetails?.photos) return;
    setApprovedPhotoIndices(claimDetails.photos.map((_, i) => i));
  };

  const handleApprove = async () => {
    if (!selectedClaimId) return;
    setIsProcessing(true);
    try {
      const result = await approveMutation({
        token,
        claimId: selectedClaimId,
        approvedFields,
        approvedPhotoIndices,
        adminNotes: adminNotes || undefined,
      });
      if (result.success) {
        // Send welcome email if account was created
        if (result.accountCreated && result.setupToken && result.email) {
          try {
            await sendWelcomeEmailAction({
              email: result.email,
              teacherName: result.teacherName || 'Instructor',
              setupToken: result.setupToken,
            });
            toast.success('Claim approved and welcome email sent');
          } catch (emailErr) {
            console.error('Failed to send welcome email:', emailErr);
            toast.success('Claim approved (email failed to send)');
          }
        } else {
          toast.success('Claim approved successfully');
        }
        handleCloseReview();
      } else {
        toast.error(result.error || 'Failed to approve claim');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickApprove = async (claimId: Id<'teacherClaims'>) => {
    setIsProcessing(true);
    try {
      const result = await approveAllMutation({ token, claimId });
      if (result.success) {
        // Send welcome email if account was created
        if (result.accountCreated && result.setupToken && result.email) {
          try {
            await sendWelcomeEmailAction({
              email: result.email,
              teacherName: result.teacherName || 'Instructor',
              setupToken: result.setupToken,
            });
            toast.success('Claim approved and welcome email sent');
          } catch (emailErr) {
            console.error('Failed to send welcome email:', emailErr);
            toast.success('Claim approved (email failed to send)');
          }
        } else {
          toast.success('Claim approved successfully');
        }
      } else {
        toast.error(result.error || 'Failed to approve claim');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedClaimId) return;
    setIsProcessing(true);
    try {
      const result = await rejectMutation({
        token,
        claimId: selectedClaimId,
        adminNotes: adminNotes || undefined,
      });
      if (result.success) {
        toast.success('Claim rejected');
        handleCloseReview();
      } else {
        toast.error(result.error || 'Failed to reject claim');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (claimId: Id<'teacherClaims'>) => {
    if (!confirm('Are you sure you want to delete this claim? This action cannot be undone.')) {
      return;
    }
    setIsProcessing(true);
    try {
      const result = await deleteMutation({ token, claimId });
      if (result.success) {
        toast.success('Claim deleted');
        if (selectedClaimId === claimId) {
          handleCloseReview();
        }
      } else {
        toast.error(result.error || 'Failed to delete claim');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Hace menos de 1 hora';
    if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    const days = Math.floor(hours / 24);
    return `Hace ${days} dia${days > 1 ? 's' : ''}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link to="/admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Instructor Claims</h1>
            <p className="text-gray-600">
              Review and approve instructor profile claims
            </p>
          </div>
          {pendingClaims && pendingClaims.length > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {pendingClaims.length} pending
            </Badge>
          )}
        </div>

        {pendingClaims === undefined ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-gray-500">Loading claims...</div>
          </div>
        ) : pendingClaims.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                All caught up!
              </h3>
              <p className="text-gray-500">
                No pending instructor claims to review.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingClaims.map((claim) => (
              <Card key={claim._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {claim.teacherName}
                          </h3>
                          <a
                            href={`/instructores-pilates/${claim.citySlug}/${normalizeTeacherSlugForUrl(
                              claim.teacherSlug,
                              claim.citySlug
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-gray-700"
                            title="Abrir perfil público"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                        <Badge variant="outline">{claim.relationship}</Badge>
                        {claim.photoCount > 0 && (
                          <Badge variant="secondary" className="gap-1">
                            <ImageIcon className="w-3 h-3" />
                            {claim.photoCount} photos
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {claim.citySlug}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {claim.claimantName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {claim.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {claim.phone}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {getRelativeTime(claim.createdAt)}
                        <span className="mx-1">|</span>
                        {formatDate(claim.createdAt)}
                      </div>

                      {claim.message && (
                        <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded">
                          "{claim.message}"
                        </p>
                      )}

                      {claim.photoUrls.length > 0 && (
                        <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                          {claim.photoUrls.slice(0, 4).map((url, i) => (
                            <img
                              key={i}
                              src={url}
                              alt={`Photo ${i + 1}`}
                              className="w-16 h-16 object-cover rounded border"
                            />
                          ))}
                          {claim.photoUrls.length > 4 && (
                            <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center text-sm text-gray-500">
                              +{claim.photoUrls.length - 4}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleOpenReview(claim._id)}
                        className="gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Review
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickApprove(claim._id)}
                        disabled={isProcessing}
                        className="gap-1 text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Quick Approve
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(claim._id)}
                        disabled={isProcessing}
                        className="gap-1 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Review Modal */}
        <Dialog open={!!selectedClaimId} onOpenChange={(open) => { if (!open) handleCloseReview(); }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span className="flex items-center gap-2">
                  Review Claim: {claimTeacherName}
                  {claimDetails?.claim?.teacherSlug && claimDetails?.claim?.citySlug && (
                    <a
                      href={`/instructores-pilates/${claimDetails.claim.citySlug}/${normalizeTeacherSlugForUrl(
                        claimDetails.claim.teacherSlug,
                        claimDetails.claim.citySlug
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-gray-900"
                      title="Abrir perfil público"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </span>
              </DialogTitle>
            </DialogHeader>

            {claimDetails ? (
              <div className="space-y-6">
                {/* Claimant Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Claimant Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Name:</span>{' '}
                      {claimDetails.claim.claimantName}
                    </div>
                    <div>
                      <span className="text-gray-500">Relationship:</span>{' '}
                      <Badge variant="outline">{claimDetails.claim.relationship}</Badge>
                    </div>
                    <div>
                      <span className="text-gray-500">Email:</span>{' '}
                      {claimDetails.claim.email}
                    </div>
                    <div>
                      <span className="text-gray-500">Phone:</span>{' '}
                      {claimDetails.claim.phone}
                    </div>
                  </div>
                </div>

                {/* Profile Changes */}
                {claimDetails.claim.proposedProfile && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Proposed Profile Changes</h4>
                      <Button variant="ghost" size="sm" onClick={selectAllFields}>
                        Select All
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {(() => {
                        const profile = claimDetails.claim.proposedProfile as ProposedProfile;
                        const teacher = claimDetails.teacher as any;
                        const fields: Array<{
                          key: string;
                          label: string;
                          current: React.ReactNode;
                          proposed: React.ReactNode;
                        }> = [];

                        if (isNonEmptyString(profile.bio)) {
                          fields.push({
                            key: 'bio',
                            label: 'Bio',
                            current: teacher?.bio?.value ? <p className="text-sm">{teacher.bio.value}</p> : <span className="text-sm text-gray-400">—</span>,
                            proposed: <p className="text-sm">{profile.bio}</p>,
                          });
                        }
                        const proposedSpecializations = asStringArray(profile.specializations);
                        const currentSpecializations = asStringArray(teacher?.specializations?.value);
                        if (proposedSpecializations.length) {
                          fields.push({
                            key: 'specializations',
                            label: 'Specializations',
                            current: currentSpecializations.length ? (
                              <div className="flex flex-wrap gap-1">
                                {currentSpecializations.map((s, i) => (
                                  <Badge key={i} variant="outline">{s}</Badge>
                                ))}
                              </div>
                            ) : <span className="text-sm text-gray-400">—</span>,
                            proposed: (
                              <div className="flex flex-wrap gap-1">
                                {proposedSpecializations.map((s, i) => (
                                  <Badge key={i} variant="secondary">{s}</Badge>
                                ))}
                              </div>
                            ),
                          });
                        }
                        if (typeof profile.experienceYears === 'number') {
                          fields.push({
                            key: 'experienceYears',
                            label: 'Experience',
                            current: teacher?.experienceYears?.value !== undefined
                              ? `${teacher.experienceYears.value} years`
                              : <span className="text-sm text-gray-400">—</span>,
                            proposed: `${profile.experienceYears} years`,
                          });
                        }
                        const proposedLanguages = asStringArray(profile.languages);
                        const currentLanguages = asStringArray(teacher?.languages?.value);
                        if (proposedLanguages.length) {
                          fields.push({
                            key: 'languages',
                            label: 'Languages',
                            current: currentLanguages.length
                              ? currentLanguages.join(', ')
                              : <span className="text-sm text-gray-400">—</span>,
                            proposed: proposedLanguages.join(', '),
                          });
                        }
                        if (isNonEmptyString(profile.whatsapp)) {
                          fields.push({
                            key: 'whatsapp',
                            label: 'WhatsApp',
                            current: teacher?.contact?.whatsapp?.value
                              ? teacher.contact.whatsapp.value
                              : <span className="text-sm text-gray-400">—</span>,
                            proposed: profile.whatsapp,
                          });
                        }
                        if (isNonEmptyString(profile.bookingUrl)) {
                          const currentBookingUrl = isNonEmptyString(teacher?.contact?.bookingUrl?.value)
                            ? teacher.contact.bookingUrl.value
                            : '';
                          fields.push({
                            key: 'bookingUrl',
                            label: 'Booking URL',
                            current: currentBookingUrl ? (
                              <a
                                href={currentBookingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1"
                              >
                                {currentBookingUrl.slice(0, 40)}...
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : <span className="text-sm text-gray-400">—</span>,
                            proposed: (
                              <a
                                href={profile.bookingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1"
                              >
                                {profile.bookingUrl.slice(0, 40)}...
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ),
                          });
                        }
                        if (isNonEmptyString(profile.instagram)) {
                          const currentInstagram = isNonEmptyString(teacher?.social?.instagram?.value)
                            ? teacher.social.instagram.value
                            : '';
                          const currentHandle = instagramHandle(currentInstagram);
                          const proposedHandle = instagramHandle(profile.instagram) ?? profile.instagram;
                          fields.push({
                            key: 'instagram',
                            label: 'Instagram',
                            current: currentHandle || <span className="text-sm text-gray-400">—</span>,
                            proposed: proposedHandle,
                          });
                        }
                        if (isNonEmptyString(profile.website)) {
                          const currentWebsite = isNonEmptyString(teacher?.social?.website?.value)
                            ? teacher.social.website.value
                            : '';
                          fields.push({
                            key: 'website',
                            label: 'Website',
                            current: currentWebsite ? (
                              <a
                                href={currentWebsite}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1"
                              >
                                {currentWebsite}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : <span className="text-sm text-gray-400">—</span>,
                            proposed: (
                              <a
                                href={profile.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1"
                              >
                                {profile.website}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ),
                          });
                        }

                        // Teaching hours
                        if (typeof profile.teachingHours === 'number') {
                          fields.push({
                            key: 'teachingHours',
                            label: 'Teaching Hours',
                            current: (teacher as any)?.teachingHours?.value !== undefined
                              ? `${(teacher as any).teachingHours.value.toLocaleString()} hours`
                              : <span className="text-sm text-gray-400">—</span>,
                            proposed: `${profile.teachingHours.toLocaleString()} hours`,
                          });
                        }

                        // Teaching style
                        if (profile.teachingStyle) {
                          const formatStyle = (style: any) => {
                            const parts: string[] = [];
                            if (style?.vibe?.length) parts.push(`Vibe: ${style.vibe.join(', ')}`);
                            if (style?.classPace) parts.push(`Pace: ${style.classPace}`);
                            if (style?.musicStyle) parts.push(`Music: ${style.musicStyle}`);
                            if (style?.classSize) parts.push(`Size: ${style.classSize}`);
                            return parts.length ? parts.join(' • ') : '—';
                          };
                          fields.push({
                            key: 'teachingStyle',
                            label: 'Teaching Style',
                            current: (teacher as any)?.teachingStyle?.value
                              ? <span className="text-sm">{formatStyle((teacher as any).teachingStyle.value)}</span>
                              : <span className="text-sm text-gray-400">—</span>,
                            proposed: <span className="text-sm">{formatStyle(profile.teachingStyle)}</span>,
                          });
                        }

                        // Full name (if claimant name differs from current)
                        if (selectedClaim?.claimantName && selectedClaim.claimantName !== teacher?.fullName?.value) {
                          fields.push({
                            key: 'fullName',
                            label: 'Name Correction',
                            current: teacher?.fullName?.value || <span className="text-sm text-gray-400">—</span>,
                            proposed: <span className="font-medium">{selectedClaim.claimantName}</span>,
                          });
                        }

                        return fields.map((field) => (
                          <div
                            key={field.key}
                            className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50"
                          >
                            <Checkbox
                              checked={approvedFields.includes(field.key)}
                              onCheckedChange={() => toggleField(field.key)}
                            />
                            <div className="flex-grow">
                              <div className="font-medium text-sm mb-1">{field.label}</div>
                              <div className="grid sm:grid-cols-2 gap-3">
                                <div className="rounded bg-gray-50 border p-2">
                                  <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Actual</div>
                                  <div className="text-gray-700">{field.current}</div>
                                </div>
                                <div className="rounded bg-emerald-50/40 border border-emerald-100 p-2">
                                  <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Propuesto</div>
                                  <div className="text-gray-700">{field.proposed}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}

                {/* Photos */}
                {claimDetails.photos.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">
                        Submitted Photos ({claimDetails.photos.length})
                      </h4>
                      <Button variant="ghost" size="sm" onClick={selectAllPhotos}>
                        Select All
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {claimDetails.photos.map((photo: ClaimPhoto, index: number) => (
                        <div
                          key={photo.storageId}
                          className={`relative border rounded-lg overflow-hidden cursor-pointer transition-all ${
                            approvedPhotoIndices.includes(index)
                              ? 'ring-2 ring-green-500'
                              : 'hover:ring-2 hover:ring-gray-300'
                          }`}
                          onClick={() => togglePhoto(index)}
                        >
                          {photo.url ? (
                            <img
                              src={photo.url}
                              alt={photo.caption || `Photo ${index + 1}`}
                              className="w-full h-40 object-cover"
                            />
                          ) : (
                            <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute top-2 left-2">
                            <Checkbox
                              checked={approvedPhotoIndices.includes(index)}
                              className="bg-white"
                              onCheckedChange={() => togglePhoto(index)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="text-xs">
                              {photo.type}
                            </Badge>
                          </div>
                          {photo.caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2">
                              {photo.caption}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Notes */}
                <div>
                  <h4 className="font-medium mb-2">Admin Notes (optional)</h4>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add any notes about this review..."
                    rows={3}
                  />
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">Loading details...</div>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="ghost"
                onClick={handleCloseReview}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={handleReject}
                disabled={isProcessing}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={handleApprove}
                disabled={isProcessing || (approvedFields.length === 0 && approvedPhotoIndices.length === 0)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve Selected ({approvedFields.length} fields, {approvedPhotoIndices.length} photos)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminTeacherClaims;
