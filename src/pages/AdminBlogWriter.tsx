import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  ColumnDef,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2, Edit3, PlayCircle, Settings, Tag, FileText, Search, Filter, Target, TrendingUp, Brain, RefreshCw, Upload, Download, BarChart3, Eye, Info, Zap } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import TopicFinder from '@/components/blog/TopicFinder';
import {
  KeywordManager,
  createPilatesKeywordManager,
  type Keyword,
  type BlogKeywordStrategy,
  ContentOptimizer
} from '@/utils/keywordManager';
import { BlogContentScanner, getBlogScanner, type KeywordUsageDetail } from '@/utils/blogContentScanner';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';

// Load TODO at build-time as initial seed; avoid static research files snapshot to enable live updates
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import todoRaw from '/blog-planning/BLOG_TODO.md?raw';

// Types
type BlogStatus = '🔬' | '📝' | '✅' | '🚫';

interface BlogTopic {
  id: string;
  title: string;
  slug: string;
  category: string;
  keywords: string[];
  status: BlogStatus;
  estimatedReadTime?: number;
  researchComplete: boolean;
  hasResearchFile?: boolean;
  researchIsTemplate?: boolean;
  createdAt: string;
  targetAudience?: string;
  isProcessing?: boolean; // Track if this topic is currently being processed by pipeline
  isSuggestion?: boolean; // Newly discovered topic pending acceptance
}

// Keyword comes from utils/keywordManager; the local copy that used to live here was a
// strict subset of it and collided with the import.

// Parse TODO file into structured data
function parsePendingFromTodo(todo: string): BlogTopic[] {
  const lines = todo.split('\n');
  const topics: BlogTopic[] = [];
  let currentCategory = 'General';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Category parsing
    const cat = line.match(/^##\s+CATEGOR[ÍI]A:\s*(.+)$/);
    if (cat) {
      currentCategory = cat[1].trim();
      continue;
    }

    // Topic parsing
    const statusMatch = line.match(/^###\s+(🔬|📝|✅|🚫)\s+(.+)$/);
    if (statusMatch) {
      const status = statusMatch[1] as BlogStatus;
      const title = statusMatch[2].trim();
      let slug = '';
      let keywords: string[] = [];
      let targetAudience = '';

      // Parse metadata from following lines
      for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
        const metaLine = lines[j];
        const researchMatch = metaLine.match(/\*\*Research File:\*\*\s*\[[^\]]+\]\(\.\/research\/(.+?)\.md\)/i);
        if (researchMatch) slug = researchMatch[1].trim();

        const keywordMatch = metaLine.match(/^\*\*Keywords:\*\*\s*(.+)$/i);
        if (keywordMatch) keywords = keywordMatch[1].split(',').map(s => s.trim()).filter(Boolean);

        const audienceMatch = metaLine.match(/^\*\*Target:\*\*\s*(.+)$/i);
        if (audienceMatch) targetAudience = audienceMatch[1].trim();
      }

      if (slug) {
        // Do not rely on build-time glob here; we'll resolve researchComplete dynamically below
        topics.push({
          id: slug,
          title,
          slug,
          category: currentCategory,
          keywords,
          status,
          researchComplete: false,
          createdAt: new Date().toISOString(),
          targetAudience,
        });
      }
    }
  }

  return topics;
}

// Dynamically check if research file exists for each topic
async function resolveResearchCompletion(topics: BlogTopic[]): Promise<BlogTopic[]> {
  const checks = await Promise.all(
    topics.map(async (t) => {
      try {
        const resp = await fetch(`/blog-planning/research/${t.slug}.md`);
        if (!resp.ok) return { slug: t.slug, has: false, templ: false, complete: false };
        const txt = await resp.text();
        const lc = txt.toLowerCase();
        const wordCount = (txt.replace(/`{3}[\s\S]*?`{3}/g, '').match(/\b\w+\b/g) || []).length;
        // Heuristics: not a template, has substantial content OR explicit complete status
        const hasCompleteStatus = /\*\*status\*\*\s*:\s*📝/i.test(txt) || lc.includes('research completed') || lc.includes('## research completed');
        const looksTemplate = lc.includes('🔬 research needed') || lc.includes('[pendiente:') || lc.includes('creado automáticamente') || lc.includes('## objetivo');
        const complete = hasCompleteStatus || (!looksTemplate && wordCount >= 800);
        return { slug: t.slug, has: true, templ: looksTemplate, complete };
      } catch {
        return { slug: t.slug, has: false, templ: false, complete: false };
      }
    })
  );
  const state = new Map<string, { has: boolean; templ: boolean; complete: boolean }>();
  checks.forEach(c => state.set(c.slug, { has: c.has, templ: c.templ, complete: c.complete }));
  return topics.map(t => {
    const s = state.get(t.slug);
    return { ...t, researchComplete: Boolean(s?.complete), hasResearchFile: Boolean(s?.has), researchIsTemplate: Boolean(s?.templ) };
  });
}

// Extract all keywords from topics
function extractKeywordsFromTopics(topics: BlogTopic[]): Keyword[] {
  const keywordMap = new Map<string, Keyword>();

  topics.forEach(topic => {
    topic.keywords.forEach(keyword => {
      const normalizedKeyword = keyword.toLowerCase().trim();
      if (keywordMap.has(normalizedKeyword)) {
        const existing = keywordMap.get(normalizedKeyword)!;
        existing.usageCount++;
      } else {
        keywordMap.set(normalizedKeyword, {
          id: normalizedKeyword,
          term: keyword,
          category: topic.category,
          usageCount: 1,
          difficulty: keyword.length > 20 ? 'hard' : keyword.length > 10 ? 'medium' : 'easy',
        });
      }
    });
  });

  return Array.from(keywordMap.values()).sort((a, b) => b.usageCount - a.usageCount);
}

const AdminBlogWriter: React.FC = () => {
  const [activeTab, setActiveTab] = useState('topics');
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [newKeywordCategory, setNewKeywordCategory] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<BlogTopic | null>(null);
  const [keywordStrategy, setKeywordStrategy] = useState<BlogKeywordStrategy | null>(null);

  // Add Topic modal state
  const [isAddTopicModalOpen, setIsAddTopicModalOpen] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicCategory, setNewTopicCategory] = useState('');
  const [newTopicKeywords, setNewTopicKeywords] = useState('');
  const [newTopicDescription, setNewTopicDescription] = useState('');
  // Edit Topic modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTopic, setEditTopic] = useState<BlogTopic | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editKeywords, setEditKeywords] = useState('');
  const [editTarget, setEditTarget] = useState('');
  const categoriesList = ['Guías de compra', 'Comparativas', 'Ejercicios y salud', 'Equipo y mantenimiento', 'Estudio'];
  const [isSubmittingTopic, setIsSubmittingTopic] = useState(false);

  // CSV Import state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [isProcessingImport, setIsProcessingImport] = useState(false);

  // Blog scanning state
  const [isScanningBlogs, setIsScanningBlogs] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<string | null>(null);
  const [selectedKeywordUsage, setSelectedKeywordUsage] = useState<KeywordUsageDetail | null>(null);
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
  const [blogScanner] = useState(() => getBlogScanner());

  // Pipeline state
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [pipelineStatus, setPipelineStatus] = useState<string | null>(null);
  const [pipelineType, setPipelineType] = useState<string | null>(null);
  const [processingTopics, setProcessingTopics] = useState<Set<string>>(new Set());

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Array<{ slug: string; title: string; category: string; keywords: string[]; source?: string; status: string; created_at?: number }>>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const token = typeof window !== 'undefined' ? (localStorage.getItem('admint') || '') : '';

  // Convex hooks
  const suggestionsData = useQuery(api.blog.listSuggestions, token ? ({ token } as any) : 'skip') as any[] | undefined;
  const mutateAccept = useMutation(api.blog.acceptSuggestion);
  const mutateDecline = useMutation(api.blog.declineSuggestion);
  const mutateUpdateTopic = useMutation(api.blog.updateTopic);
  const mutateQueueTopic = useMutation(api.pipeline.queueTopic);
  const actionRunPipeline = useAction(api.pipeline.pipelineRun);
  const actionRunBatch = useAction(api.pipeline.pipelineRunBatch);
  const mutateSaveKeywords = useMutation(api.blog.saveKeywords);
  const actionEnsureTodo = useAction(api.pipeline.ensureTodoEntry);

  const toSlug = useCallback((t: string) => {
    return t.toLowerCase()
      .replace(/[áàäâã]/g, 'a').replace(/[éèëê]/g, 'e').replace(/[íìïî]/g, 'i').replace(/[óòöôõ]/g, 'o').replace(/[úùüû]/g, 'u').replace(/[ñ]/g, 'n')
      .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/--+/g, '-').replace(/^-+|-+$/g, '');
  }, []);

  // Initialize keyword manager
  const [keywordManager] = useState(() => createPilatesKeywordManager());

  // Parse topics and keywords - now using state for dynamic updates
  const [topics, setTopics] = useState<BlogTopic[]>(() => parsePendingFromTodo(todoRaw as unknown as string));
  const [keywords, setKeywords] = useState<Keyword[]>(() => {
    const parsedTopics = parsePendingFromTodo(todoRaw as unknown as string);

    // Automatically add keywords from topics to the persistent manager
    keywordManager.addKeywordsFromTopics(parsedTopics);

    // Get all keywords from the manager (now includes both static and extracted)
    return keywordManager.getKeywords();
  });

  // Refresh topics from server dynamically
  const refreshTopics = useCallback(async () => {
    try {
      // Fetch updated BLOG_TODO.md from server
      const response = await fetch('/blog-planning/BLOG_TODO.md');
      if (response.ok) {
        const updatedTodoContent = await response.text();
        let updatedTopics = parsePendingFromTodo(updatedTodoContent);

        // Resolve research completion dynamically
        updatedTopics = await resolveResearchCompletion(updatedTopics);

        // Merge Convex suggestions (in_review and queued)
        try {
          const sj = suggestionsData || [];
          setSuggestions(sj as any);
          const existing = new Set(updatedTopics.map(t => t.slug));
          const suggestionTopics: BlogTopic[] = (sj as any[])
            .filter((it: any) => it.status === 'in_review' || it.status === 'queued')
            .filter((it: any) => !existing.has(it.slug))
            .map((it: any) => ({
              id: it.slug,
              title: it.title,
              slug: it.slug,
              category: it.category || 'General',
              keywords: Array.isArray(it.keywords) ? it.keywords : [],
              status: '🔬',
              researchComplete: false,
              createdAt: new Date().toISOString(),
              targetAudience: 'Público general',
              isSuggestion: it.status === 'in_review',
            }));
          updatedTopics = [...suggestionTopics, ...updatedTopics];
        } catch {}

        // Update topics state
        setTopics(updatedTopics);

        // Update keywords from new topics
        keywordManager.addKeywordsFromTopics(updatedTopics);
        setKeywords(keywordManager.getKeywords());

        return true;
      }
    } catch (error) {
      console.warn('Failed to refresh topics:', error);
    }
    return false;
  }, [keywordManager]);

  // Auto-refresh topics every 30 seconds to show pipeline progress
  useEffect(() => {
    const interval = setInterval(() => {
      refreshTopics();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [refreshTopics]);

  // Resolve research completion on initial load
  useEffect(() => {
    (async () => {
      try {
        const withResolved = await resolveResearchCompletion(topics);
        setTopics(withResolved);
      } catch {}
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Core scanning logic - used by both manual and automatic scans
  const performScan = useCallback(async (isManual: boolean = false) => {
    setIsScanningBlogs(true);
    try {
      console.log('Starting blog content scan...');

      // Load all blog posts
      await blogScanner.loadBlogPosts();

      // Scan for keyword usage
      const currentKeywords = keywordManager.getKeywords();
      const usageMap = blogScanner.scanKeywordUsage(currentKeywords);

      console.log('Scan complete. Found usage for', usageMap.size, 'keywords');

      // Update keyword manager with real usage counts
      const simplifiedMap = new Map();
      usageMap.forEach((detail, keywordId) => {
        simplifiedMap.set(keywordId, {
          count: detail.count,
          posts: detail.posts
        });
      });

      keywordManager.updateUsageFromScanner(simplifiedMap);

      // Update UI
      setKeywords(keywordManager.getKeywords());
      setLastScanTime(new Date().toISOString());

      // Show summary
      const totalKeywords = currentKeywords.length;
      const usedKeywords = Array.from(usageMap.values()).filter(d => d.count > 0).length;
      const totalOccurrences = Array.from(usageMap.values()).reduce((sum, d) => sum + d.count, 0);

      if (isManual) {
        // Show alert for manual scans
        alert(`Blog Content Scan Complete!\n\nScanned: ${usageMap.size} keywords\nUsed: ${usedKeywords}/${totalKeywords} keywords\nTotal occurrences: ${totalOccurrences}`);
      } else {
        // Silent background operation
        console.log('✅ Auto-scan complete: Usage counts updated silently');
      }

    } catch (error) {
      console.error('Error scanning blog content:', error);
      if (isManual) {
        alert(`Error scanning blogs: ${error.message || error}`);
      }
      // Silent for automatic scans
    } finally {
      setIsScanningBlogs(false);
    }
  }, [keywordManager, blogScanner]);

  // Manual scan function (shows alerts)
  const scanBlogContent = useCallback(async () => {
    await performScan(true);
  }, [performScan]);

  // Background scan function (silent)
  const backgroundScan = useCallback(async () => {
    await performScan(false);
  }, [performScan]);

  // Helper function to determine proper research status
  const getResearchStatus = useCallback((topic: BlogTopic) => {
    if (topic.isSuggestion) {
      return { text: 'In Review', variant: 'secondary' as const };
    }
    if (processingTopics.has(topic.slug)) {
      return { text: 'Processing', variant: 'secondary' as const };
    }
    // Complete only when content is substantial/marked complete
    if (topic.researchComplete || topic.status === '📝' || topic.status === '✅') {
      return { text: 'Complete', variant: 'default' as const };
    }
    // Queued: has a research file scaffolded but it's still a template/incomplete
    if (topic.hasResearchFile && (topic.researchIsTemplate || !topic.researchComplete)) {
      return { text: 'Queued', variant: 'outline' as const };
    }
    return { text: 'Not Started', variant: 'outline' as const };
  }, [processingTopics]);

  // Filter topics based on selected status filter
  const filteredTopics = useMemo(() => {
    if (!statusFilter) return topics;

    return topics.filter(topic => {
      const status = getResearchStatus(topic);
      return status.text === statusFilter;
    });
  }, [topics, statusFilter, getResearchStatus]);

  // Calculate status counts for filter buttons
  const statusCounts = useMemo(() => {
    const counts = {
      'Not Started': 0,
      'Processing': 0,
      'Queued': 0,
      'Complete': 0,
      'In Review': 0
    };

    topics.forEach(topic => {
      const status = getResearchStatus(topic);
      if (status.text in counts) counts[status.text as keyof typeof counts]++;
    });

    return counts;
  }, [topics, getResearchStatus]);

  // Auto-scan blog content on mount and every 5 minutes
  useEffect(() => {
    // Initial scan when component mounts
    const performInitialScan = async () => {
      console.log('Performing initial blog content scan...');
      await backgroundScan();
    };

    // Delay initial scan slightly to ensure everything is loaded
    const initialScanTimeout = setTimeout(() => {
      performInitialScan();
    }, 1000); // 1 second delay for initial load

    // Set up interval for scanning every 5 minutes
    const scanInterval = setInterval(() => {
      console.log('Auto-scanning blog content (5-minute interval)...');
      backgroundScan();
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      clearTimeout(initialScanTimeout);
      clearInterval(scanInterval);
    };
  }, [backgroundScan]); // Dependency on backgroundScan

  // Load suggestions when Suggestions tab is active (Convex)
  useEffect(() => {
    if (activeTab === 'suggestions') {
      setLoadingSuggestions(!suggestionsData);
      if (suggestionsData) setSuggestions(suggestionsData as any);
    }
  }, [activeTab, suggestionsData]);

  // Listen for TopicFinder batch accept to switch to Queued view and refresh
  useEffect(() => {
    const onAccepted = () => {
      setStatusFilter('Queued');
      refreshTopics();
    };
    window.addEventListener('topics:accepted', onAccepted as any);
    return () => window.removeEventListener('topics:accepted', onAccepted as any);
  }, [refreshTopics]);

  const acceptSuggestion = useCallback(async (slug: string) => {
    try {
      await mutateAccept({ token, slug } as any);
      const s = (suggestions || []).find(x => x.slug === slug);
      try {
        await actionEnsureTodo({ token, slug, title: s?.title || slug.replace(/-/g,' '), category: s?.category || 'Estudio', keywords: s?.keywords || [] } as any);
      } catch {}
      await mutateQueueTopic({ token, slug, title: s?.title, category: s?.category, keywords: s?.keywords } as any);
      try { await actionRunPipeline({ token, slug } as any); } catch {}
      setSuggestions(prev => prev.map(s => s.slug === slug ? { ...s, status: 'queued' } : s));
      await refreshTopics();
      setStatusFilter('Queued');
    } catch (e) {
      alert('Failed to accept: ' + ((e as any)?.message || e));
    }
  }, [mutateAccept, mutateQueueTopic, actionRunPipeline, suggestions, refreshTopics, token, actionEnsureTodo]);

  const declineSuggestion = useCallback(async (slug: string) => {
    try {
      await mutateDecline({ token, slug } as any);
      setSuggestions(prev => prev.map(s => s.slug === slug ? { ...s, status: 'declined' } : s));
    } catch (e) {
      alert('Failed to decline: ' + ((e as any)?.message || e));
    }
  }, [mutateDecline, token]);

  function openEditModal(t: BlogTopic) {
    setEditTopic(t);
    setEditTitle(t.title);
    setEditCategory(t.category);
    setEditKeywords(t.keywords.join(', '));
    setEditTarget(t.targetAudience || '');
    setIsEditOpen(true);
  }

  async function saveEdit() {
    if (!editTopic) return;
    try {
      await mutateUpdateTopic({ token, slug: editTopic.slug, title: editTitle.trim(), category: editCategory.trim(), keywords: editKeywords.split(',').map(s => s.trim()).filter(Boolean) } as any);
      setIsEditOpen(false);
      await refreshTopics();
    } catch (e) {
      alert('Failed to update: ' + (e as any)?.message || e);
    }
  }

  // Generate keyword strategy for selected topic
  const generateKeywordStrategy = useCallback((topic: BlogTopic) => {
    const strategy = keywordManager.generateStrategy(
      topic.title,
      topic.category,
      topic.keywords
    );
    setKeywordStrategy(strategy);
    setSelectedTopic(topic);
  }, [keywordManager]);

  // Get keyword suggestions for a topic
  const getKeywordSuggestions = useCallback((topic: BlogTopic): Keyword[] => {
    return keywordManager.suggestKeywords(topic.title, topic.category);
  }, [keywordManager]);

  // Inline status for queued topics
  function QueuedStatus({ slug }: { slug: string }) {
    const [state, setState] = useState<{ researchExists: boolean; blogExists: boolean }>({ researchExists: false, blogExists: false });
    const s = useQuery(api.blog.status, token ? ({ token, slug } as any) : 'skip') as any;
    const statusAction = (useAction as any)(api.pipeline.contentStatus);
    useEffect(() => {
      let cancelled = false;
      async function tick() {
        try {
          const j = await statusAction({ token, slug });
          if (!cancelled) setState({ researchExists: Boolean(j?.researchExists), blogExists: Boolean(j?.blogExists) });
        } catch {}
      }
      tick();
      const id = setInterval(tick, 10000);
      return () => { cancelled = true; clearInterval(id); };
    }, [slug, statusAction]);
    const tip = `Status: ${s?.status || '—'}\nResearch file: ${state.researchExists ? 'yes' : 'no'}\nBlog file: ${state.blogExists ? 'yes' : 'no'}`;
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="ml-2 inline-flex items-center text-muted-foreground cursor-help" aria-label="Queued status details">
            <Info className="h-3.5 w-3.5" />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs whitespace-pre">{tip}</div>
        </TooltipContent>
      </Tooltip>
    );
  }

  // Generate SEO-optimized content structure
  const generateContentStructure = useCallback((topic: BlogTopic) => {
    if (!keywordStrategy) return '';

    const metaDescription = ContentOptimizer.generateMetaDescription(
      topic.title,
      keywordStrategy.meta.primary,
      topic.category
    );

    const placements = ContentOptimizer.suggestPlacements('', [
      keywordStrategy.content.primary,
      ...keywordStrategy.content.secondary
    ]);

    return `
# SEO Content Structure for: ${topic.title}

## Meta Description
${metaDescription}

## Primary Keyword
${keywordStrategy.title.primary}

## Secondary Keywords
${keywordStrategy.title.secondary.join(', ')}

## Recommended Structure

### Title Suggestions
${keywordStrategy.title.longtail.map(lt => `- ${lt}`).join('\n')}

### Header Keywords
${keywordStrategy.headers.secondary.map(h => `- ${h}`).join('\n')}

### Content Keywords Distribution
- Primary (${keywordStrategy.content.primary}): Use 3-5 times
- Secondary: ${keywordStrategy.content.secondary.join(', ')}
- Semantic: ${keywordStrategy.content.semantic.join(', ')}

### FAQ Keywords
${keywordStrategy.content.longtail.map(faq => `- ¿${faq}?`).join('\n')}
`.trim();
  }, [keywordStrategy]);

  // Table setup for topics
  const columnHelper = createColumnHelper<BlogTopic>();

  // Trigger research for specific topic (defined before columns to avoid hoisting errors)
  const triggerResearchForTopic = useCallback(async (topic: BlogTopic) => {
    // Check if this topic is already being processed
    if (processingTopics.has(topic.slug)) {
      alert(`"${topic.title}" is already being processed. Please wait for it to complete.`);
      return;
    }

    // Check if research is already complete
    if (topic.researchComplete) {
      alert(`"${topic.title}" already has completed research. Use the batch pipeline to continue to the next stage.`);
      return;
    }

    // Mark this topic as processing
    setProcessingTopics(prev => new Set([...prev, topic.slug]));

    try {
      await actionRunPipeline({ token, slug: topic.slug } as any);

      // Show success feedback - no intrusive alert, just console log
      console.log(`✅ Pipeline triggered for "${topic.title}"`);

        // Start polling to check if pipeline completed successfully
        const checkPipelineCompletion = async () => {
          let attempts = 0;
          const maxAttempts = 40; // Check for up to 40 times (20 minutes max)

          const pollForCompletion = async () => {
            attempts++;

            try {
              // Refresh topics to get latest research status
              await refreshTopics();

              // Check if research file exists by trying to fetch it
              const researchResponse = await fetch(`/blog-planning/research/${topic.slug}.md`);
              const researchExists = researchResponse.ok;

              if (researchExists) {
                // Pipeline completed successfully
                console.log(`✅ Pipeline completed successfully for "${topic.title}"`);
                setProcessingTopics(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(topic.slug);
                  return newSet;
                });
                return; // Stop polling
              }

              if (attempts >= maxAttempts) {
                // Timeout - assume pipeline failed or is taking too long
                console.warn(`⚠️ Pipeline timeout for "${topic.title}" after ${maxAttempts/2} minutes`);
                setProcessingTopics(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(topic.slug);
                  return newSet;
                });
                alert(`Pipeline for "${topic.title}" is taking longer than expected. Please check the topic status manually.`);
                return;
              }

              // Continue polling after 30 seconds
              setTimeout(pollForCompletion, 30000);

            } catch (error) {
              console.error('Error checking pipeline completion:', error);
              // Continue polling despite error
              if (attempts < maxAttempts) {
                setTimeout(pollForCompletion, 30000);
              } else {
                setProcessingTopics(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(topic.slug);
                  return newSet;
                });
              }
            }
          };

          // Start polling after 30 seconds (give pipeline time to start)
          setTimeout(pollForCompletion, 30000);
        };

        checkPipelineCompletion();
    } catch (error) {
      // remove from processing
      setProcessingTopics(prev => {
        const newSet = new Set(prev);
        newSet.delete(topic.slug);
        return newSet;
      });

      console.error('Pipeline trigger error:', (error as any)?.message || error);
      alert(`Error triggering pipeline for "${topic.title}": ${(error as any)?.message || error}`);
    }
  }, [processingTopics, refreshTopics, actionRunPipeline]);

  const topicColumns = useMemo<ColumnDef<BlogTopic>[]>(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          className="rounded border-border"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="rounded border-border"
        />
      ),
      enableSorting: false,
    },
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => <span className="text-lg">{info.getValue()}</span>,
      size: 60,
    }),
    columnHelper.accessor('title', {
      header: 'Title',
      cell: info => (
        <div className="space-y-1">
          <div className="font-medium">{info.getValue()}</div>
          <div className="text-xs text-muted-foreground">{info.row.original.slug}</div>
        </div>
      ),
      size: 300,
    }),
    columnHelper.accessor('category', {
      header: 'Category',
      cell: info => <Badge variant="secondary">{info.getValue()}</Badge>,
      size: 150,
    }),
    columnHelper.accessor('keywords', {
      header: 'Keywords',
      cell: info => (
        <div className="flex flex-wrap gap-1">
          {info.getValue().slice(0, 3).map(keyword => (
            <Badge key={keyword} variant="outline" className="text-xs">
              {keyword}
            </Badge>
          ))}
          {info.getValue().length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{info.getValue().length - 3}
            </Badge>
          )}
        </div>
      ),
      enableSorting: false,
      size: 200,
    }),
    columnHelper.accessor('researchComplete', {
      header: 'Research',
      cell: info => {
        const topic = info.row.original;
        const status = getResearchStatus(topic);
        const colorClass = (() => {
          switch (status.text) {
            case 'In Review':
              return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'Not Started':
              return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'Queued':
              return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Processing':
              return 'bg-blue-600 text-white';
            case 'Complete':
              return 'bg-green-600 text-white';
            default:
              return '';
          }
        })();
        return (
          <span className="inline-flex items-center">
            <Badge variant={status.variant} className={colorClass}>
              {status.text}
              {status.text === 'Processing' && (
                <RefreshCw className="ml-1 h-3 w-3 animate-spin" />
              )}
            </Badge>
            {status.text === 'Queued' && (
              <>
                <QueuedStatus slug={topic.slug} />
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 ml-2 px-2"
                  disabled={processingTopics.has(topic.slug)}
                  title={processingTopics.has(topic.slug) ? 'Processing…' : 'Run now'}
                  onClick={async () => {
                    setProcessingTopics(prev => new Set([...prev, topic.slug]));
                    try {
                      await actionRunPipeline({ token, slug: topic.slug } as any);
                    } catch {}
                  }}
                >
                  <Zap className={`h-3.5 w-3.5 ${processingTopics.has(topic.slug) ? 'animate-pulse' : ''}`} />
                </Button>
              </>
            )}
          </span>
        );
      },
      size: 100,
    }),
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const t = row.original;
        if (t.isSuggestion) {
          return (
            <div className="flex gap-1">
              <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => acceptSuggestion(t.slug)}>Accept</Button>
              <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => declineSuggestion(t.slug)}>Decline</Button>
            </div>
          );
        }
        return (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => generateKeywordStrategy(row.original)}
              title="Generate SEO Strategy"
            >
              <Target className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Edit Topic" onClick={() => openEditModal(row.original)}>
            <Edit3 className="h-4 w-4" />
          </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              title={processingTopics.has(row.original.slug) ? "Processing..." : "Run Pipeline"}
              onClick={() => triggerResearchForTopic(row.original)}
              disabled={processingTopics.has(row.original.slug)}
            >
              <PlayCircle className={`h-4 w-4 ${processingTopics.has(row.original.slug) ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        );
      },
      enableSorting: false,
      size: 120,
    },
  ], [generateKeywordStrategy, triggerResearchForTopic, processingTopics, acceptSuggestion, declineSuggestion]);

  const table = useReactTable({
    data: filteredTopics,
    columns: topicColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    enableRowSelection: true,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Keyword management functions
  const addKeyword = useCallback(() => {
    const term = newKeyword.trim();
    if (!term) {
      console.log('No keyword entered');
      return;
    }

    const id = term.toLowerCase().replace(/\s+/g, '-');
    console.log('Adding keyword:', { term, id, category: newKeywordCategory });

    try {
      // If keyword exists, increment usage and refresh list
      const existing = keywordManager.getKeyword(id);
      if (existing) {
        console.log('Keyword exists, incrementing usage');
        keywordManager.recordUsage(id, 'content');
        setKeywords(keywordManager.getKeywords());
        setNewKeyword('');
        setNewKeywordCategory('');
        keywordManager.saveToStorage();
        return;
      }

      // Add new keyword
      console.log('Adding new keyword');
      const newKeywordObj = keywordManager.addKeyword({
        term,
        category: newKeywordCategory || 'General',
        difficulty: term.length > 20 ? 'hard' : term.length > 10 ? 'medium' : 'easy',
      });

      console.log('New keyword added:', newKeywordObj);

      // Update state
      setKeywords(keywordManager.getKeywords());
      setNewKeyword('');
      setNewKeywordCategory('');
      keywordManager.saveToStorage();

      console.log('Keyword management complete');
    } catch (error) {
      console.error('Error adding keyword:', error);
      alert(`Error adding keyword: ${error.message || error}`);
    }
  }, [newKeyword, newKeywordCategory, keywordManager]);

  const removeKeyword = useCallback((id: string) => {
    setKeywords(prev => prev.filter(k => k.id !== id));
  }, []);

  // CSV Import functions
  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = lines.slice(1).map(line => {
      const values = [];
      let currentValue = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue.trim().replace(/"/g, ''));
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim().replace(/"/g, ''));

      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });

    return rows;
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        const parsed = parseCSV(text);
        // Preview first 10 rows
        setImportPreview(parsed.slice(0, 10));
      } catch (error) {
        console.error('Error parsing CSV:', error);
        alert('Error parsing CSV file. Please check the format.');
      }
    };
    reader.readAsText(file);
  }, []);

  const importKeywordsFromCSV = useCallback(async () => {
    if (!importFile) return;

    setIsProcessingImport(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const parsed = parseCSV(text);

        let importedCount = 0;
        let skippedCount = 0;

        parsed.forEach(row => {
          const keyword = row['Keyword']?.trim();
          if (!keyword) {
            skippedCount++;
            return;
          }

          const volume = parseInt(row['Volume']) || 0;
          const difficulty = parseInt(row['Keyword Difficulty']) || 0;
          const intent = row['Intent'] || '';
          const page = row['Page'] || row['Topic'] || 'SEMrush Import';

          // Determine difficulty level
          let difficultyLevel: 'easy' | 'medium' | 'hard' = 'medium';
          if (difficulty <= 30) difficultyLevel = 'easy';
          else if (difficulty >= 70) difficultyLevel = 'hard';

          try {
            keywordManager.addKeyword({
              term: keyword,
              category: page,
              searchVolume: volume,
              difficulty: difficultyLevel,
              targetDensity: 1.5,
              synonyms: [],
              relatedTerms: intent ? [intent] : []
            });
            importedCount++;
          } catch (error) {
            console.warn('Failed to import keyword:', keyword, error);
            skippedCount++;
          }
        });

        // Update UI
        setKeywords(keywordManager.getKeywords());
        keywordManager.saveToStorage();

        // Close modal and show results
        setIsImportModalOpen(false);
        setImportFile(null);
        setImportPreview([]);

        alert(`Import completed!\n\nImported: ${importedCount} keywords\nSkipped: ${skippedCount} keywords\n\nKeywords saved to local storage.`);
      };
      reader.readAsText(importFile);
    } catch (error) {
      console.error('Import error:', error);
      alert(`Import failed: ${error}`);
    } finally {
      setIsProcessingImport(false);
    }
  }, [importFile, keywordManager]);

  // View usage details for a keyword
  const viewKeywordUsage = useCallback((keyword: Keyword) => {
    const usage = blogScanner.getKeywordUsage(keyword.id);
    if (usage) {
      setSelectedKeywordUsage(usage);
      setIsUsageModalOpen(true);
    }
  }, [blogScanner]);

  const exportKeywordsToCSV = useCallback(() => {
    const csvHeaders = ['Term', 'Category', 'Search Volume', 'Difficulty', 'Usage Count', 'Last Used'];
    const csvRows = keywords.map(k => [
      k.term,
      k.category,
      k.searchVolume || '',
      k.difficulty || '',
      k.usageCount,
      k.lastUsed || ''
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cama-pilates-keywords-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [keywords]);

  // Get keyword suggestions for new topic
  const getKeywordSuggestionsForNewTopic = useCallback((title: string, category: string): string[] => {
    const suggestions = keywordManager.suggestKeywords(title, category);
    return suggestions.slice(0, 5).map(k => k.term);
  }, [keywordManager]);


  

  // Add new topic
  const addNewTopic = useCallback(async () => {
    if (!newTopicTitle.trim() || !newTopicCategory.trim()) {
      alert('Please fill in at least the title and category');
      return;
    }

    setIsSubmittingTopic(true);
    try {
      const slug = toSlug(newTopicTitle.trim());
      const newKeywords = newTopicKeywords.split(',').map(k => k.trim()).filter(Boolean);
      try {
        await actionEnsureTodo({ token, slug, title: newTopicTitle.trim(), category: newTopicCategory.trim(), keywords: newKeywords } as any);
      } catch {}
      await mutateQueueTopic({ token, slug, title: newTopicTitle.trim(), category: newTopicCategory.trim(), keywords: newKeywords } as any);
      try { await actionRunPipeline({ token, slug } as any); } catch {}

      // Add new keywords to the persistent manager
      if (newKeywords.length > 0) {
        keywordManager.addKeywordsFromTopics([{ keywords: newKeywords, category: newTopicCategory }]);
        setKeywords(keywordManager.getKeywords());
        try {
          const klist = keywordManager.getKeywords().map(k => ({
            term: k.term,
            category: k.category,
            usageCount: k.usageCount,
            lastUsed: k.lastUsed ? Date.parse(k.lastUsed) : undefined,
          }));
          await mutateSaveKeywords({ token, keywords: klist } as any);
        } catch {}
      }

      alert(`🎉 Topic "${newTopicTitle}" added and queued!\n\nSlug: ${slug}\nPipeline triggered in background.`);

      // Reset form and close modal
      setNewTopicTitle('');
      setNewTopicCategory('');
      setNewTopicKeywords('');
      setNewTopicDescription('');
      setIsAddTopicModalOpen(false);

      // Refresh topics dynamically and show queued view
      await refreshTopics();
      setStatusFilter('Queued');
    } catch (error) {
      alert(`Error adding topic: ${error}`);
    } finally {
      setIsSubmittingTopic(false);
    }
  }, [newTopicTitle, newTopicCategory, newTopicKeywords, newTopicDescription]);

  // Batch actions
  const runBatchPipeline = useCallback(async (type: 'quick' | 'standard' | 'full' | 'production') => {
    setIsRunningPipeline(true);
    setPipelineType(type);
    setPipelineStatus('Initializing...');

    // Determine which topics to process based on pipeline type
    const topicLimits = {
      quick: 3,
      standard: 5,
      full: 10,
      production: 20
    };

    // Get topics that need processing (research not complete, status indicates ready to research)
    const availableTopics = topics
      .filter(topic => !topic.researchComplete && topic.status === '🔬')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (availableTopics.length === 0) {
      setIsRunningPipeline(false);
      setPipelineType(null);
      setPipelineStatus(null);
      alert('No topics available for processing. All topics either have completed research or are not ready.');
      return;
    }

    // For quick run, just take the first (highest priority) topic
    const topicsToProcess = type === 'quick' ? [availableTopics[0]] : availableTopics.slice(0, topicLimits[type]);

    // Mark these topics as processing
    const processingSet = new Set(topicsToProcess.map(t => t.slug));
    setProcessingTopics(processingSet);

    setPipelineStatus(`Initializing ${topicsToProcess.length} topic${topicsToProcess.length > 1 ? 's' : ''}...`);

    try {
      if (type === 'quick') {
        const topic = topicsToProcess[0];
        await actionRunPipeline({ token, slug: topic.slug } as any);
        setPipelineStatus(`Processing "${topic.title}" in background...`);

        // Poll for research completion up to 10 minutes, then clear
        let attempts = 0;
        const maxAttempts = 20; // every 30s
        const poll = async () => {
          attempts++;
          await refreshTopics();
          try {
            const r = await fetch(`/blog-planning/research/${topic.slug}.md`, { method: 'HEAD' });
            if (r.ok) {
              setProcessingTopics(new Set());
              setIsRunningPipeline(false);
              setPipelineStatus(null);
              setPipelineType(null);
              return;
            }
          } catch {}
          if (attempts < maxAttempts) setTimeout(poll, 30000);
          else {
            setProcessingTopics(new Set());
            setIsRunningPipeline(false);
            setPipelineStatus(null);
            setPipelineType(null);
          }
        };
        setTimeout(poll, 30000);
        return;
      }

      // Batch run via Convex action
      await actionRunBatch({ token, slugs: topicsToProcess.map(t => t.slug) } as any);
      setPipelineStatus(`Processing ${topicsToProcess.length} topics in background...`);

      // Auto-clear status after 10 seconds
      setTimeout(() => {
        setIsRunningPipeline(false);
        setPipelineStatus(null);
        setPipelineType(null);
        setProcessingTopics(new Set());
        refreshTopics();
      }, 10000);
    } catch (error) {
      setPipelineStatus('Error - command copied to clipboard');

      // Fallback to the pipeline command
      const commands = {
        quick: 'npm run blog:pipeline',
        standard: 'node scripts/run-batch-blogs.js 5',
        full: 'node scripts/run-batch-blogs.js 10',
        production: 'node scripts/run-batch-blogs.js 20',
      };

      navigator.clipboard.writeText(commands[type]);

      // Clear status after 5 seconds
      setTimeout(() => {
        setIsRunningPipeline(false);
        setPipelineStatus(null);
        setPipelineType(null);
      }, 5000);
    }
  }, [topics, refreshTopics]);

  return (
    <div className="container mx-auto px-4 py-6">
      <Helmet>
        <title>Blog Management | Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Blog Management System</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => runBatchPipeline('quick')}
            variant="outline"
            disabled={isRunningPipeline}
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            {isRunningPipeline && pipelineType === 'quick' ? 'Running...' : 'Quick Run'}
          </Button>
          <Button
            onClick={() => runBatchPipeline('standard')}
            disabled={isRunningPipeline}
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            {isRunningPipeline && pipelineType === 'standard' ? 'Running...' : 'Standard Batch'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="topics" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Blog Topics
          </TabsTrigger>
          <TabsTrigger value="keywords" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Keywords
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Suggestions
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="topics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Blog Topics ({topics.length})</span>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search topics..."
                      value={globalFilter}
                      onChange={(e) => setGlobalFilter(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={refreshTopics}
                    title="Refresh topics"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <TopicFinder />
                  <Dialog open={isAddTopicModalOpen} onOpenChange={setIsAddTopicModalOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Topic
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px]">
                      <DialogHeader>
                        <DialogTitle>Add New Blog Topic</DialogTitle>
                        <DialogDescription>
                          Create a new blog topic for the autonomous writing pipeline. This will add it to BLOG_TODO.md, create a research file, and automatically trigger the autonomous blog writer to start processing.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="topic-title" className="text-right">
                            Title *
                          </Label>
                          <Input
                            id="topic-title"
                            value={newTopicTitle}
                            onChange={(e) => setNewTopicTitle(e.target.value)}
                            placeholder="e.g., Guía completa para principiantes en Pilates"
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="topic-category" className="text-right">
                            Category *
                          </Label>
                          <Select value={newTopicCategory} onValueChange={setNewTopicCategory}>
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Guías de compra">Guías de compra</SelectItem>
                              <SelectItem value="Comparativas">Comparativas</SelectItem>
                              <SelectItem value="Ejercicios y salud">Ejercicios y salud</SelectItem>
                              <SelectItem value="Equipo y mantenimiento">Equipo y mantenimiento</SelectItem>
                              <SelectItem value="Estudio">Estudio</SelectItem>
                              <SelectItem value="Tips para Instructores">Tips para Instructores</SelectItem>
                              <SelectItem value="Entrenamientos y bienestar">Entrenamientos y bienestar</SelectItem>
                              <SelectItem value="Pilates para rehabilitación">Pilates para rehabilitación</SelectItem>
                              <SelectItem value="Comunidad Pilates">Comunidad Pilates</SelectItem>
                              <SelectItem value="Hacer crecer negocio">Hacer crecer negocio</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="topic-keywords" className="text-right">
                            Keywords
                          </Label>
                          <div className="col-span-3 space-y-2">
                            <Input
                              id="topic-keywords"
                              value={newTopicKeywords}
                              onChange={(e) => setNewTopicKeywords(e.target.value)}
                              placeholder="pilates principiantes, ejercicios pilates, reformer casa"
                            />
                            {newTopicTitle && newTopicCategory && (
                              <div className="flex flex-wrap gap-1">
                                <span className="text-xs text-muted-foreground">Suggestions:</span>
                                {getKeywordSuggestionsForNewTopic(newTopicTitle, newTopicCategory).map(suggestion => (
                                  <Button
                                    key={suggestion}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-6"
                                    onClick={() => {
                                      const currentKeywords = newTopicKeywords.split(',').map(k => k.trim()).filter(Boolean);
                                      if (!currentKeywords.includes(suggestion)) {
                                        const updated = [...currentKeywords, suggestion].join(', ');
                                        setNewTopicKeywords(updated);
                                      }
                                    }}
                                  >
                                    + {suggestion}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="topic-description" className="text-right">
                            Description
                          </Label>
                          <Textarea
                            id="topic-description"
                            value={newTopicDescription}
                            onChange={(e) => setNewTopicDescription(e.target.value)}
                            placeholder="Brief description of the topic and target audience..."
                            className="col-span-3"
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsAddTopicModalOpen(false)}
                          disabled={isSubmittingTopic}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          onClick={addNewTopic}
                          disabled={isSubmittingTopic || !newTopicTitle.trim() || !newTopicCategory.trim()}
                        >
                          {isSubmittingTopic ? 'Adding...' : 'Add Topic'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Edit Topic Modal */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                  <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                      <DialogTitle>Edit Topic</DialogTitle>
                      <DialogDescription>Update title, category, keywords and target. Slug remains unchanged.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Title</Label>
                        <Input className="col-span-3" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Category</Label>
                        <Select value={editCategory} onValueChange={setEditCategory}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categoriesList.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Keywords</Label>
                        <Input className="col-span-3" value={editKeywords} onChange={(e) => setEditKeywords(e.target.value)} placeholder="comma,separated,keywords" />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Target</Label>
                        <Input className="col-span-3" value={editTarget} onChange={(e) => setEditTarget(e.target.value)} placeholder="Público objetivo" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                      <Button onClick={saveEdit}>Save</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                {/* Status filter buttons */}
                <div className="flex gap-2 items-center">
                  <span className="text-sm font-medium">Filter by status:</span>
                  <Button
                    variant={statusFilter === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(null)}
                  >
                    All ({topics.length})
                  </Button>
                  <Button
                    variant={statusFilter === 'Not Started' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter('Not Started')}
                  >
                    🔬 Not Started ({statusCounts['Not Started']})
                  </Button>
                  <Button
                    variant={statusFilter === 'In Review' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter('In Review')}
                  >
                    📝 In Review ({statusCounts['In Review']})
                  </Button>
                  <Button
                    variant={statusFilter === 'Queued' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter('Queued')}
                  >
                    ⏳ Queued ({statusCounts['Queued']})
                  </Button>
                  <Button
                    variant={statusFilter === 'Processing' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter('Processing')}
                  >
                    ⚡ Processing ({statusCounts['Processing']})
                  </Button>
                  <Button
                    variant={statusFilter === 'Complete' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter('Complete')}
                  >
                    ✅ Complete ({statusCounts['Complete']})
                  </Button>
                </div>

                {/* Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id} style={{ width: header.getSize() }}>
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                          <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={topicColumns.length} className="h-24 text-center">
                            No results.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Rows per page</p>
                    <select
                      value={table.getState().pagination.pageSize}
                      onChange={(e) => table.setPageSize(Number(e.target.value))}
                      className="rounded border border-border px-2 py-1"
                    >
                      {[10, 20, 30, 40, 50].map((pageSize) => (
                        <option key={pageSize} value={pageSize}>
                          {pageSize}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                    >
                      Next
                    </Button>
                  </div>
                </div>

                {/* Batch actions */}
                {Object.keys(table.getState().rowSelection).length > 0 && (
                  <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                    <span className="text-sm font-medium">
                      {Object.keys(table.getState().rowSelection).length} selected
                    </span>
                    <Separator orientation="vertical" className="h-4" />
                    <Button size="sm" variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                    <Button size="sm" variant="outline">
                      Update Status
                    </Button>
                    <Button size="sm" variant="outline">
                      Run Pipeline
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Keyword Management ({keywords.length})</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={scanBlogContent}
                    disabled={isScanningBlogs}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    {isScanningBlogs ? 'Scanning...' : 'Scan Blog Usage'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={exportKeywordsToCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Import CSV
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[625px]">
                      <DialogHeader>
                        <DialogTitle>Import Keywords from CSV</DialogTitle>
                        <DialogDescription>
                          Upload a CSV file from SEMrush or other keyword research tools. Supported formats include columns for Keyword, Volume, Keyword Difficulty, Page/Topic, and Intent.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="csv-file" className="text-right">
                            CSV File
                          </Label>
                          <Input
                            id="csv-file"
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            className="col-span-3"
                          />
                        </div>

                        {importPreview.length > 0 && (
                          <div className="mt-4">
                            <Label className="text-sm font-medium">Preview (first 10 rows):</Label>
                            <div className="mt-2 border rounded-md p-3 max-h-60 overflow-auto">
                              <div className="text-xs space-y-1">
                                {importPreview.map((row, index) => (
                                  <div key={index} className="grid grid-cols-4 gap-2 p-2 border-b">
                                    <div><strong>Keyword:</strong> {row['Keyword']}</div>
                                    <div><strong>Volume:</strong> {row['Volume']}</div>
                                    <div><strong>Difficulty:</strong> {row['Keyword Difficulty']}</div>
                                    <div><strong>Category:</strong> {row['Page'] || row['Topic'] || 'General'}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="mt-2 text-sm text-muted-foreground">
                              Found {importPreview.length} keywords to preview. Click Import to process the entire file.
                            </div>
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsImportModalOpen(false);
                            setImportFile(null);
                            setImportPreview([]);
                          }}
                          disabled={isProcessingImport}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          onClick={importKeywordsFromCSV}
                          disabled={!importFile || isProcessingImport}
                        >
                          {isProcessingImport ? 'Importing...' : 'Import Keywords'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add new keyword */}
              <form onSubmit={(e) => { e.preventDefault(); addKeyword(); }} className="flex gap-2">
                <Input
                  placeholder="New keyword..."
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  className="flex-1"
                  required
                />
                <Input
                  placeholder="Category"
                  value={newKeywordCategory}
                  onChange={(e) => setNewKeywordCategory(e.target.value)}
                  className="w-32"
                />
                <Button type="submit">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </form>

              {/* Keywords grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {keywords.map((keyword) => (
                  <Card key={keyword.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{keyword.term}</div>
                        <div className="text-sm text-muted-foreground">{keyword.category}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            Used {keyword.usageCount} times
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              keyword.difficulty === 'easy' ? 'text-green-600' :
                              keyword.difficulty === 'medium' ? 'text-yellow-600' : 'text-red-600'
                            }`}
                          >
                            {keyword.difficulty}
                          </Badge>
                          {keyword.searchVolume && (
                            <Badge variant="outline" className="text-xs">
                              Vol: {keyword.searchVolume}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {keyword.usageCount > 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => viewKeywordUsage(keyword)}
                            className="h-8 w-8 p-0"
                            title="View usage details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeKeyword(keyword.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Usage Details Modal */}
              <Dialog open={isUsageModalOpen} onOpenChange={setIsUsageModalOpen}>
                <DialogContent className="sm:max-w-[625px] max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Keyword Usage Details: {selectedKeywordUsage?.keyword}</DialogTitle>
                    <DialogDescription>
                      Found in {selectedKeywordUsage?.posts.length || 0} blog posts with {selectedKeywordUsage?.count || 0} total occurrences
                    </DialogDescription>
                  </DialogHeader>
                  {selectedKeywordUsage && (
                    <div className="space-y-4">
                      {selectedKeywordUsage.posts.map((post) => (
                        <Card key={post.slug} className="p-4">
                          <div className="space-y-2">
                            <div className="font-medium">{post.title}</div>
                            <div className="text-sm text-muted-foreground">
                              Slug: {post.slug}
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                              <div>Title: {post.occurrences.inTitle}</div>
                              <div>Description: {post.occurrences.inDescription}</div>
                              <div>Headers: {post.occurrences.inHeaders}</div>
                              <div>Content: {post.occurrences.inContent}</div>
                              <div>Tags: {post.occurrences.inTags}</div>
                              <div className="font-medium">Total: {post.occurrences.total}</div>
                            </div>
                            <div className="mt-2">
                              <a
                                href={`/blog/${post.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline"
                              >
                                View Blog Post →
                              </a>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                  <DialogFooter>
                    <Button onClick={() => setIsUsageModalOpen(false)}>Close</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Last Scan Info */}
              {lastScanTime && (
                <div className="p-3 border rounded-lg bg-green-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <BarChart3 className="h-4 w-4 text-green-600" />
                      <span className="text-green-700">
                        Last blog scan: {new Date(lastScanTime).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span>Auto-scanning every 5 minutes</span>
                    </div>
                  </div>
                </div>
              )}

              {/* CSV Import Help */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">📄 CSV Import Format</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>SEMrush Export:</strong> Works with keyword export files from SEMrush</p>
                  <p><strong>Required columns:</strong> Keyword (required), Volume, Keyword Difficulty, Page/Topic (for category)</p>
                  <p><strong>Optional:</strong> Intent, Database, SERP Features</p>
                  <p><strong>Example file:</strong> camapilates_clusters_2025-09-24.csv</p>
                </div>
              </div>

              {/* Keyword statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <Card className="p-4">
                  <div className="text-2xl font-bold">{keywords.length}</div>
                  <div className="text-sm text-muted-foreground">Total Keywords</div>
                </Card>
                <Card className="p-4">
                  <div className="text-2xl font-bold">
                    {keywords.reduce((sum, k) => sum + k.usageCount, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Usage</div>
                </Card>
                <Card className="p-4">
                  <div className="text-2xl font-bold">
                    {new Set(keywords.map(k => k.category)).size}
                  </div>
                  <div className="text-sm text-muted-foreground">Categories</div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suggestions */}
        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Topic Suggestions ({suggestions.length})</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={async () => {
                    setLoadingSuggestions(true);
                    try { if (suggestionsData) setSuggestions(suggestionsData as any); } catch {}
                    setLoadingSuggestions(false);
                  }}>{loadingSuggestions ? 'Refreshing…' : 'Refresh'}</Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSuggestions && <div className="text-sm text-muted-foreground">Loading suggestions…</div>}
              {!loadingSuggestions && suggestions.length === 0 && <div className="text-sm text-muted-foreground">No suggestions yet. Use "Encontrar temas" in Blog to discover.</div>}
              <div className="space-y-3">
                {suggestions.map((s) => (
                  <div key={s.slug} className="border rounded-md p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="font-medium">{s.title}</div>
                        <div className="text-xs text-muted-foreground">slug: {s.slug}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">{s.category}</Badge>
                          {s.keywords.slice(0, 4).map(k => <Badge key={k} variant="outline" className="text-xs">{k}</Badge>)}
                          {s.source && <a href={s.source} target="_blank" rel="noreferrer" className="text-xs underline text-primary">fuente</a>}
                          <Badge variant={s.status === 'accepted' ? 'default' : s.status === 'declined' ? 'destructive' : 'outline'} className="text-xs">{s.status}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => acceptSuggestion(s.slug)} disabled={s.status === 'accepted'}>Accept</Button>
                        <Button size="sm" variant="outline" onClick={() => declineSuggestion(s.slug)} disabled={s.status === 'declined'}>Decline</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pipeline Status Indicator */}
              {isRunningPipeline && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <div>
                      <p className="font-medium text-blue-900">
                        {pipelineType?.charAt(0).toUpperCase() + pipelineType?.slice(1)} Pipeline Running
                      </p>
                      <p className="text-sm text-blue-700">{pipelineStatus}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => runBatchPipeline('quick')}
                  className="h-20 flex flex-col"
                  disabled={isRunningPipeline}
                >
                  <PlayCircle className="h-6 w-6 mb-2" />
                  <span className="font-medium">
                    {isRunningPipeline && pipelineType === 'quick' ? 'Running Quick Test...' : 'Quick Test (3 blogs)'}
                  </span>
                  <span className="text-xs opacity-70">Quality: 80+</span>
                </Button>
                <Button
                  onClick={() => runBatchPipeline('standard')}
                  className="h-20 flex flex-col"
                  disabled={isRunningPipeline}
                >
                  <PlayCircle className="h-6 w-6 mb-2" />
                  <span className="font-medium">
                    {isRunningPipeline && pipelineType === 'standard' ? 'Running Standard...' : 'Standard Batch (5 blogs)'}
                  </span>
                  <span className="text-xs opacity-70">Quality: 85+</span>
                </Button>
                <Button
                  onClick={() => runBatchPipeline('full')}
                  className="h-20 flex flex-col"
                  disabled={isRunningPipeline}
                >
                  <PlayCircle className="h-6 w-6 mb-2" />
                  <span className="font-medium">
                    {isRunningPipeline && pipelineType === 'full' ? 'Running Full...' : 'Full Production (10 blogs)'}
                  </span>
                  <span className="text-xs opacity-70">Quality: 85+</span>
                </Button>
                <Button
                  onClick={() => runBatchPipeline('production')}
                  className="h-20 flex flex-col"
                  disabled={isRunningPipeline}
                >
                  <PlayCircle className="h-6 w-6 mb-2" />
                  <span className="font-medium">
                    {isRunningPipeline && pipelineType === 'production' ? 'Running Large Scale...' : 'Large Scale (20 blogs)'}
                  </span>
                  <span className="text-xs opacity-70">Quality: 90+</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="text-2xl font-bold">{topics.filter(t => t.status === '🔬').length}</div>
                    <div className="text-sm text-muted-foreground">Need Research</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-2xl font-bold">{topics.filter(t => t.status === '📝').length}</div>
                    <div className="text-sm text-muted-foreground">Ready to Write</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-2xl font-bold">{topics.filter(t => t.status === '✅').length}</div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-2xl font-bold">{topics.filter(t => t.researchComplete).length}</div>
                    <div className="text-sm text-muted-foreground">Research Complete</div>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* SEO Strategy Panel */}
            {selectedTopic && keywordStrategy && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    SEO Strategy: {selectedTopic.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Primary Keyword</h4>
                    <Badge variant="default" className="text-sm">
                      {keywordStrategy.title.primary}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Secondary Keywords</h4>
                    <div className="flex flex-wrap gap-1">
                      {keywordStrategy.title.secondary.map(keyword => (
                        <Badge key={keyword} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Long-tail Variations</h4>
                    <div className="flex flex-wrap gap-1">
                      {keywordStrategy.title.longtail.slice(0, 3).map(keyword => (
                        <Badge key={keyword} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Semantic Keywords</h4>
                    <div className="flex flex-wrap gap-1">
                      {keywordStrategy.content.semantic.slice(0, 4).map(keyword => (
                        <Badge key={keyword} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const structure = generateContentStructure(selectedTopic);
                        navigator.clipboard.writeText(structure);
                        alert('SEO structure copied to clipboard!');
                      }}
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Copy SEO Structure
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const metaDesc = ContentOptimizer.generateMetaDescription(
                          selectedTopic.title,
                          keywordStrategy.meta.primary,
                          selectedTopic.category
                        );
                        navigator.clipboard.writeText(metaDesc);
                        alert('Meta description copied!');
                      }}
                    >
                      Copy Meta Description
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Keyword Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Keyword Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {(() => {
                  const stats = keywordManager.getStatistics();
                  return (
                    <>
                      <Card className="p-4">
                        <div className="text-2xl font-bold">{stats.totalKeywords}</div>
                        <div className="text-sm text-muted-foreground">Total Keywords</div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-2xl font-bold">{stats.totalUsage}</div>
                        <div className="text-sm text-muted-foreground">Total Usage</div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-2xl font-bold">{stats.averageUsage.toFixed(1)}</div>
                        <div className="text-sm text-muted-foreground">Avg Usage</div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-2xl font-bold">{stats.unusedKeywords.length}</div>
                        <div className="text-sm text-muted-foreground">Unused</div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-2xl font-bold">{Object.keys(stats.categoryCounts).length}</div>
                        <div className="text-sm text-muted-foreground">Categories</div>
                      </Card>
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminBlogWriter;
