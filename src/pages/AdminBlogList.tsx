import React from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';

const AdminBlogList = () => {
    const blogs = useQuery(api.blogs.list, { limit: 100 });
    const createBlog = useMutation(api.blogs.create);
    const deleteBlog = useMutation(api.blogs.deleteBlog);
    const navigate = useNavigate();
    const token = typeof window !== 'undefined' ? (localStorage.getItem('admint') || '') : '';

    const handleCreate = async () => {
        const slug = prompt('Enter a slug for the new blog (e.g., my-new-post):');
        if (!slug) return;

        try {
            const normalizedSlug = slug.toLowerCase().replace(/\s+/g, '-');
            await createBlog({
                token,
                slug: normalizedSlug,
                title: 'New Blog Post',
                content: '# New Blog Post\n\nStart writing...',
                excerpt: '',
                category: 'General',
                tags: [],
                author: 'CAMA Pilates',
                publishDate: new Date().toISOString(),
                featured: false,
                status: 'draft',
            });
            navigate(`/admin/blogs/${normalizedSlug}`);
        } catch (error) {
            alert('Failed to create blog: ' + error.message);
        }
    };

    const handleDelete = async (slug: string) => {
        if (!confirm('Are you sure you want to delete this blog post?')) return;
        try {
            await deleteBlog({ token, slug });
        } catch (error) {
            alert('Failed to delete blog: ' + error.message);
        }
    };

    if (!blogs) {
        return <div className="p-8">Loading...</div>;
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Blog Posts</h1>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" /> New Post
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {blogs.map((blog) => (
                            <TableRow key={blog._id}>
                                <TableCell className="font-medium">
                                    {blog.title}
                                    <div className="text-xs text-muted-foreground">{blog.slug}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={blog.status === 'published' ? 'default' : 'secondary'}>
                                        {blog.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{blog.category}</TableCell>
                                <TableCell>
                                    {blog.publishDate ? format(new Date(blog.publishDate), 'MMM d, yyyy') : '-'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link to={`/blog/${blog.slug}`} target="_blank">
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link to={`/admin/blogs/${blog.slug}`}>
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(blog.slug)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default AdminBlogList;
