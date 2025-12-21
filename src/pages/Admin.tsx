import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, LayoutDashboard, FileText, Settings, Image as ImageIcon, UserPlus, UserCheck, Database, Table2 } from 'lucide-react';

const Admin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const loginMutation = useMutation(api.admin.login);
  const token = typeof window !== 'undefined' ? (localStorage.getItem('admint') || '') : '';
  const sess = useQuery(api.admin.session as any, token ? ({ token } as any) : 'skip' as any) as any;
  const pendingClaimsCount = useQuery(
    api.teacherClaimsAdmin.getPendingCount,
    token ? { token } : 'skip'
  );

  // Check if already authenticated
  useEffect(() => {
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    if (sess) {
      const ok = Boolean(sess?.authenticated);
      setIsAuthenticated(ok);
      if (!ok) localStorage.removeItem('admint');
    }
  }, [token, sess]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const result = await loginMutation({ username, password });
      if (result.ok && result.token) {
        localStorage.setItem('admint', result.token);
        setIsAuthenticated(true);
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during login');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admint');
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Admin Access</CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              Enter your credentials to access the dashboard
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <div className="text-sm text-red-500 text-center font-medium">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full">
                <Lock className="w-4 h-4 mr-2" />
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/admin/blogs" className="block group">
            <Card className="h-full transition-all hover:shadow-md group-hover:border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  Blog Manager
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View, edit, and delete existing blog posts.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/blog-writer" className="block group">
            <Card className="h-full transition-all hover:shadow-md group-hover:border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Blog Writer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage blog posts, research topics, and generate content using AI.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/placeholders" className="block group">
            <Card className="h-full transition-all hover:shadow-md group-hover:border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-blue-600" />
                  Image Placeholders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Review and generate AI images for your blog posts.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/teacher-links" className="block group">
            <Card className="h-full transition-all hover:shadow-md group-hover:border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-indigo-600" />
                  Teacher Links
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Review and verify inferred connections between teachers and studios.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/teacher-seeds" className="block group">
            <Card className="h-full transition-all hover:shadow-md group-hover:border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-slate-600" />
                  Teacher Seeds
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Sync local seed instructors into Convex (enables claims, photos, and previews).
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/instructor-claims" className="block group">
            <Card className="h-full transition-all hover:shadow-md group-hover:border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                  Instructor Claims
                  {pendingClaimsCount !== undefined && pendingClaimsCount > 0 && (
                    <Badge variant="destructive" className="ml-auto">
                      {pendingClaimsCount}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Review instructor profile claims, approve photos, and verify identities.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/teacher-profiles" className="block group">
            <Card className="h-full transition-all hover:shadow-md group-hover:border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Table2 className="w-5 h-5 text-orange-600" />
                  Teacher Profiles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Edit all instructor profiles in a spreadsheet view. Manage photos and data.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/settings" className="block group">
            <Card className="h-full transition-all hover:shadow-md group-hover:border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-600" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Configure AI providers, manage users, and system settings.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Admin;
