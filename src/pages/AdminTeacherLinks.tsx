import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Check, X, ExternalLink, Search, Filter, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Id } from '../../convex/_generated/dataModel';
import { normalizeTeacherSlugForUrl } from '@/lib/teacherSlug';

const AdminTeacherLinks = () => {
    const { toast } = useToast();
    const [statusFilter, setStatusFilter] = useState<string>('inferred');
    const [searchTerm, setSearchTerm] = useState('');

    const token = typeof window !== 'undefined' ? (localStorage.getItem('admint') || '') : '';
    
    const links = useQuery(
        api.teacherDiscovery.getAllTeacherLinks,
        token ? { 
            token,
            status: statusFilter === 'all' ? undefined : statusFilter,
            limit: 200 
        } : 'skip'
    );
    
    const updateStatus = useMutation(api.teacherDiscovery.updateTeacherLinkStatus);

    const handleStatusUpdate = async (linkId: Id<'teacherStudioLinks'>, newStatus: 'verified' | 'rejected') => {
        try {
            await updateStatus({ token, linkId, status: newStatus });
            toast({
                title: `Link ${newStatus}`,
                description: `Successfully marked link as ${newStatus}`,
            });
        } catch {
            toast({
                title: "Error",
                description: "Failed to update link status",
                variant: "destructive",
            });
        }
    };

    const handleBulkVerify = async () => {
        if (!confirm('Verify all pending links with > 80% confidence?')) return;
        const highConfLinks = links?.filter(l => l.status === 'inferred' && l.confidence >= 80) || [];
        let count = 0;
        for (const link of highConfLinks) {
            try {
                await updateStatus({ token, linkId: link._id, status: 'verified' });
                count++;
            } catch (e) {
                console.error(e);
            }
        }
        toast({ title: "Bulk Action Complete", description: `Verified ${count} links` });
    };

    const handleBulkReject = async () => {
        if (!confirm('Reject all pending links with < 40% confidence?')) return;
        const lowConfLinks = links?.filter(l => l.status === 'inferred' && l.confidence < 40) || [];
        let count = 0;
        for (const link of lowConfLinks) {
            try {
                await updateStatus({ token, linkId: link._id, status: 'rejected' });
                count++;
            } catch (e) {
                console.error(e);
            }
        }
        toast({ title: "Bulk Action Complete", description: `Rejected ${count} links` });
    };

    const filteredLinks = links?.filter(link => {
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (
                link.teacherName.toLowerCase().includes(searchLower) ||
                link.studioName.toLowerCase().includes(searchLower) ||
                link.studioCity.toLowerCase().includes(searchLower)
            );
        }
        return true;
    });

    const getConfidenceColor = (score: number) => {
        if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
        if (score >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return 'bg-red-100 text-red-800 border-red-200';
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
                        <h1 className="text-3xl font-bold tracking-tight">Teacher-Studio Links</h1>
                        <p className="text-muted-foreground mt-1">
                            Review and verify inferred connections between teachers and studios.
                        </p>
                    </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleBulkVerify} className="hidden md:flex text-green-700 border-green-200 hover:bg-green-50">
                        Verify High Conf. ({links?.filter(l => l.status === 'inferred' && l.confidence >= 80).length || 0})
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleBulkReject} className="hidden md:flex text-red-700 border-red-200 hover:bg-red-50">
                        Reject Low Conf. ({links?.filter(l => l.status === 'inferred' && l.confidence < 40).length || 0})
                    </Button>
                    <Badge variant="outline" className="px-3 py-1">
                        {links ? `${links.length} links found` : 'Loading...'}
                    </Badge>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-4">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Search className="w-4 h-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search teacher, studio, or city..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full md:w-80"
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Filter className="w-4 h-4 text-muted-foreground" />
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-40">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="inferred">Inferred (Pending)</SelectItem>
                                    <SelectItem value="verified">Verified</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Teacher</TableHead>
                                    <TableHead>Studio</TableHead>
                                    <TableHead>City</TableHead>
                                    <TableHead>Confidence</TableHead>
                                    <TableHead>Evidence</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {!filteredLinks ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            Loading links...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredLinks.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                            No links found matching your criteria.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredLinks.map((link) => (
                                        <TableRow key={link._id}>
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span>{link.teacherName}</span>
                                                    <a 
                                                        href={`/instructores-pilates/${link.studioCity}/${normalizeTeacherSlugForUrl(
                                                          link.teacherSlug,
                                                          link.studioCity
                                                        )}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-muted-foreground hover:underline flex items-center gap-1 mt-1"
                                                    >
                                                        View Profile <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span>{link.studioName}</span>
                                                    <a 
                                                        href={`/estudios-de-pilates/${link.studioCity}/${link.studioSlug}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-muted-foreground hover:underline flex items-center gap-1 mt-1"
                                                    >
                                                        View Studio <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                </div>
                                            </TableCell>
                                            <TableCell className="capitalize">
                                                {link.studioCity.replace(/-/g, ' ')}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getConfidenceColor(link.confidence)} variant="secondary">
                                                    {link.confidence}%
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-xs">
                                                <div className="text-xs text-muted-foreground line-clamp-2" title={link.signals[0]?.evidence}>
                                                    {link.signals[0]?.evidence || 'No snippet available'}
                                                </div>
                                                {link.signals[0]?.url && (
                                                    <a 
                                                        href={link.signals[0].url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-blue-500 hover:underline block mt-1 truncate"
                                                    >
                                                        Source Link
                                                    </a>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {format(new Date(link.createdAt), 'MMM d, yyyy')}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {link.status === 'inferred' ? (
                                                    <div className="flex justify-end gap-2">
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline" 
                                                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                            onClick={() => handleStatusUpdate(link._id, 'verified')}
                                                            title="Verify"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline" 
                                                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => handleStatusUpdate(link._id, 'rejected')}
                                                            title="Reject"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Badge variant={link.status === 'verified' ? 'default' : 'destructive'}>
                                                        {link.status}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
            </div>
        </div>
    );
};

export default AdminTeacherLinks;
