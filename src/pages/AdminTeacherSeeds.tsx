import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { TEACHERS_SEED } from '@/data/teachers';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, RefreshCw, CheckCircle2, AlertCircle, Link as LinkIcon } from 'lucide-react';

type SeedTeacher = {
  slug: string;
  citySlug: string;
  cityName: string;
  fullName: string;
  bio?: string;
  specializations?: string[];
  experienceYears?: number;
  languages?: string[];
  certifications?: Array<{
    name: string;
    organization?: string;
    year?: number;
    isVerified?: boolean;
  }>;
  social?: {
    instagram?: string;
    linkedin?: string;
    facebook?: string;
    website?: string;
  };
  isVerified?: boolean;
};

const AdminTeacherSeeds = () => {
  const { toast } = useToast();
  const token = typeof window !== 'undefined' ? localStorage.getItem('admint') || '' : '';

  const [normalizeSlugs, setNormalizeSlugs] = useState(true);
  const [syncingKey, setSyncingKey] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{
    inserted: number;
    updated: number;
    renamed: number;
    conflicts: Array<{ citySlug: string; slug: string; reason: string }>;
  } | null>(null);

  const seeds = useMemo<SeedTeacher[]>(
    () =>
      TEACHERS_SEED.map((t) => ({
        slug: t.slug,
        citySlug: t.citySlug,
        cityName: t.cityName.value,
        fullName: t.fullName.value,
        bio: t.bio?.value,
        specializations: t.specializations?.value,
        experienceYears: t.experienceYears?.value,
        languages: t.languages?.value,
        certifications: (t.certifications || []).map((c) => ({
          name: c.name,
          organization: c.organization,
          year: c.year?.value,
          isVerified: c.isVerified,
        })),
        social: {
          instagram: t.social?.instagram?.value,
          linkedin: t.social?.linkedin?.value,
          facebook: t.social?.facebook?.value,
          website: t.social?.website?.value,
        },
        isVerified: t.isVerified,
      })),
    []
  );

  const seedKeys = useMemo(
    () => seeds.map((s) => ({ slug: s.slug, citySlug: s.citySlug })),
    [seeds]
  );

  const status = useQuery(
    api.teachers.getSeedSyncStatus,
    token ? { token, seeds: seedKeys } : 'skip'
  );

  const sync = useMutation(api.teachers.syncSeedTeachers);

  const counts = useMemo(() => {
    const total = seeds.length;
    const found = status?.filter((s) => s.found).length ?? 0;
    const missing = status?.filter((s) => !s.found).length ?? 0;
    const legacy = status?.filter((s) => s.found && s.storedSlug && s.storedSlug !== s.slug).length ?? 0;
    return { total, found, missing, legacy };
  }, [seeds.length, status]);

  const handleSyncOne = async (seed: SeedTeacher) => {
    if (!token) return;
    const key = `${seed.citySlug}:${seed.slug}`;
    setSyncingKey(key);
    try {
      const res = await sync({ token, normalizeSlugs, seeds: [seed] });
      setLastResult(res);
      toast({
        title: 'Sync completo',
        description: `Insertados: ${res.inserted} • Actualizados: ${res.updated} • Renombrados: ${res.renamed}`,
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: String(err?.message || err),
        variant: 'destructive',
      });
    } finally {
      setSyncingKey(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-10 space-y-8">
        <div className="flex items-center gap-4">
          <Link to="/admin">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Teacher Seed Sync</h1>
            <p className="text-muted-foreground mt-1">
              Sincroniza instructores individuales a Convex para habilitar reclamos, fotos y vistas previas.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Estado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{counts.total} seeds</Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {counts.found} encontrados
              </Badge>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                {counts.missing} faltantes
              </Badge>
              {counts.legacy > 0 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {counts.legacy} slug legacy
                </Badge>
              )}
            </div>

            <label className="flex items-center gap-3 text-sm">
              <Checkbox checked={normalizeSlugs} onCheckedChange={(v) => setNormalizeSlugs(Boolean(v))} />
              Normalizar slugs antiguos (recomendado)
            </label>

            {lastResult && lastResult.conflicts.length > 0 && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <div className="font-medium mb-2">Conflictos:</div>
                <ul className="list-disc pl-5 space-y-1">
                  {lastResult.conflicts.map((c, idx) => (
                    <li key={idx}>
                      {c.citySlug}/{c.slug}: {c.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Seeds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Ciudad</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Sync</TableHead>
                    <TableHead className="text-right">Perfil</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seeds.map((seed) => {
                    const row = status?.find((s) => s.citySlug === seed.citySlug && s.slug === seed.slug);
                    const found = row?.found;
                    const legacy = Boolean(found && row?.storedSlug && row.storedSlug !== seed.slug);
                    const key = `${seed.citySlug}:${seed.slug}`;
                    const rowSyncing = syncingKey === key;

                    return (
                      <TableRow key={`${seed.citySlug}:${seed.slug}`}>
                        <TableCell className="font-medium">{seed.fullName}</TableCell>
                        <TableCell className="capitalize">{seed.cityName}</TableCell>
                        <TableCell className="font-mono text-xs">{seed.slug}</TableCell>
                        <TableCell>
                          {found ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <span className="text-sm">En Convex</span>
                              {legacy && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                  legacy
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-amber-600" />
                              <span className="text-sm">Faltante</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            disabled={!token || rowSyncing}
                            onClick={() => handleSyncOne(seed)}
                            title={!token ? 'Inicia sesión en /admin' : undefined}
                          >
                            <RefreshCw className={`w-4 h-4 ${rowSyncing ? 'animate-spin' : ''}`} />
                            {found ? 'Resync' : 'Sync'}
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <a
                            href={`/instructores-pilates/${seed.citySlug}/${seed.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex"
                            title="Abrir perfil"
                          >
                            <Button variant="outline" size="sm" className="gap-2">
                              <LinkIcon className="w-4 h-4" />
                              Abrir
                            </Button>
                          </a>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminTeacherSeeds;
