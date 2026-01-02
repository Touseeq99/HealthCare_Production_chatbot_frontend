"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import {
  Search as SearchIcon,
  Filter,
  X,
  FileText,
  Star,
  AlertCircle,
  Loader2,
  BookOpen,
  Calendar,
  Tag,
  MessageSquare,
  User
} from 'lucide-react';
import { getFiles, getCategories, getPaperTypes, searchEvidence, type FileResponse, type SearchRequest } from '@/lib/api/evidence';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export function EvidenceEngine() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [files, setFiles] = useState<FileResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<SearchRequest>({
    page: 1,
    page_size: 10,
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [paperTypes, setPaperTypes] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isLoadingPaperTypes, setIsLoadingPaperTypes] = useState<boolean>(true);
  const [selectedFile, setSelectedFile] = useState<FileResponse | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 10,
    total: 0,
    total_pages: 1,
  });

  // Fetch initial data
  useEffect(() => {
    fetchFiles();
    fetchCategories();
    fetchPaperTypes();
  }, []);

  // Fetch files based on filters
  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const currentPage = pagination.page;
      const currentPageSize = pagination.page_size;

      // Check if we have active filters or search query
      const hasActiveFilters =
        searchQuery.trim() !== '' ||
        (filters.paper_types && filters.paper_types.length > 0) ||
        filters.min_total_score !== undefined ||
        filters.max_total_score !== undefined ||
        (filters.keywords && filters.keywords.length > 0);

      let response;
      if (hasActiveFilters) {
        // Use search API if filters are present
        const searchParams: SearchRequest = {
          ...filters,
          search_text: searchQuery || undefined,
          page: currentPage,
          page_size: currentPageSize,
        };
        response = await searchEvidence(searchParams);
      } else {
        // Otherwise use standard list API
        response = await getFiles(currentPage, currentPageSize);
      }

      // Handle the response data
      if (response && response.items) {
        setFiles(response.items);

        setPagination(prev => ({
          ...prev,
          page: response.page || currentPage,
          page_size: response.page_size || currentPageSize,
          total: response.total || 0,
          total_pages: response.total_pages || Math.ceil((response.total || 0) / (response.page_size || currentPageSize)),
        }));
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPaperTypes = async () => {
    try {
      setIsLoadingPaperTypes(true);
      const data = await getPaperTypes();
      setPaperTypes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching paper types:', error);
      setPaperTypes([]);
    } finally {
      setIsLoadingPaperTypes(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFiles();
  };

  const handleFilterChange = (key: keyof SearchRequest, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    // Reset to first page when filters change
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      page_size: 10,
    });
    setSearchQuery('');
    fetchFiles();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      setPagination(prev => ({
        ...prev,
        page: newPage,
      }));
    }
  };

  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.page_size]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-amber-600 bg-amber-50 border-amber-200';
  };

  return (
    <div className="h-full flex flex-col bg-slate-50/50 dark:bg-slate-900/50 rounded-xl overflow-hidden border border-white/20 shadow-sm backdrop-blur-sm">
      {/* Header */}
      <div className="border-b border-gray-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 px-6 py-4 backdrop-blur-md sticky top-0 z-10 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Evidence Engine
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Access and manage your clinical knowledge base
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <form onSubmit={handleSearch} className="relative group">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                type="text"
                placeholder="Search evidence..."
                className="pl-10 w-64 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="bg-white/50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                  <Filter className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl p-0 gap-0 bg-white dark:bg-slate-900 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                  <DialogTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">Filter Evidence</DialogTitle>
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Paper Types Column */}
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-500" />
                        Paper Types
                      </label>
                      <div className="h-[250px] pr-4 border rounded-lg bg-slate-50/50 dark:bg-slate-900/50 p-3 overflow-y-auto">
                        <div className="space-y-2">
                          {isLoadingPaperTypes ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                            </div>
                          ) : paperTypes && paperTypes.length > 0 ? (
                            paperTypes.map((type) => (
                              <label key={type} className="flex items-center p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                  checked={filters.paper_types?.includes(type) || false}
                                  onChange={(e) => {
                                    const newTypes = filters.paper_types || [];
                                    if (e.target.checked) {
                                      handleFilterChange('paper_types', [...newTypes, type]);
                                    } else {
                                      handleFilterChange('paper_types', newTypes.filter(t => t !== type));
                                    }
                                  }}
                                />
                                <span className="ml-3 text-sm text-slate-600 dark:text-slate-300 capitalize">{type?.replace(/_/g, ' ') || 'Unknown'}</span>
                              </label>
                            ))) :
                            (
                              <div className="text-sm text-slate-500 italic">No paper types available</div>
                            )}
                        </div>
                      </div>
                    </div>

                    {/* Scores Column */}
                    <div className="space-y-6">
                      <label className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Star className="h-4 w-4 text-amber-500" />
                        Quality Scores
                      </label>

                      <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Minimum Score (0-100)</label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            className="bg-white dark:bg-slate-800"
                            value={filters.min_total_score || ''}
                            onChange={(e) => handleFilterChange('min_total_score', e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Maximum Score (0-100)</label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            className="bg-white dark:bg-slate-800"
                            value={filters.max_total_score || ''}
                            onChange={(e) => handleFilterChange('max_total_score', e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Keywords Column */}
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Tag className="h-4 w-4 text-emerald-500" />
                        Keywords
                      </label>
                      <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800 h-full">
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Comma separated values</label>
                        <textarea
                          className="w-full h-[150px] p-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                          placeholder="e.g. prognosis, diagnosis, treatment..."
                          value={filters.keywords?.join(', ') || ''}
                          onChange={(e) => {
                            const keywords = e.target.value
                              .split(',')
                              .map(k => k.trim())
                              .filter(k => k.length > 0);
                            handleFilterChange('keywords', keywords.length > 0 ? keywords : undefined);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="text-slate-600 hover:bg-slate-100"
                  >
                    Reset All
                  </Button>
                  <Button
                    onClick={() => {
                      fetchFiles();
                      setIsFilterOpen(false);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
                  >
                    Apply Filters
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative min-h-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="px-6 border-b border-gray-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <TabsList className="flex space-x-6">
              <TabsTrigger
                value="all"
                className="relative py-4 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 outline-none group"
              >
                All Evidence
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300" />
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-slate-900/20">
            <TabsContent value={activeTab} className="outline-none m-0 p-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600/50" />
                  <p className="text-sm text-slate-400">Loading evidence...</p>
                </div>
              ) : !files || files.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-64 text-center p-8 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 mx-auto max-w-2xl mt-8"
                >
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-full mb-4">
                    <FileText className="h-10 w-10 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">No evidence found</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-2">
                    {searchQuery || Object.keys(filters).length > 2
                      ? 'Try adjusting your search criteria or filters to see results'
                      : 'Your knowledge base is currently empty'}
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 gap-4 max-w-5xl mx-auto">
                  <AnimatePresence>
                    {files.map((file, index) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="group bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md border border-slate-100 dark:border-slate-700/50 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 cursor-pointer relative overflow-hidden"
                        onClick={() => setSelectedFile(file)}
                      >
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-full hover:bg-blue-100">
                            <BookOpen className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-start gap-5">
                          {/* Score Badge */}
                          <div className={cn(
                            "flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-2xl border-2",
                            getScoreColor(file.total_score)
                          )}>
                            <span className="text-xl font-bold">{file.total_score}</span>
                            <span className="text-[10px] uppercase font-bold opacity-80">Score</span>
                          </div>

                          <div className="flex-1 min-w-0 pt-1">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 mb-2">
                              {file.file_name}
                            </h3>

                            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mb-3">
                              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/50 px-2.5 py-1 rounded-md">
                                <Tag className="h-3.5 w-3.5" />
                                <span className="capitalize">{file.paper_type ? file.paper_type.replace(/_/g, ' ') : 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{format(new Date(file.created_at), 'MMM d, yyyy')}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <MessageSquare className="h-3.5 w-3.5" />
                                <span>{file.comments.length} comments</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {Array.isArray(file.keywords) && file.keywords.length > 0 ? (
                                <>
                                  {file.keywords.slice(0, 4).map((keyword, idx) => (
                                    <Badge
                                      key={`${keyword}-${idx}`}
                                      variant="secondary"
                                      className="bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-white hover:shadow-sm transition-all font-medium border-transparent hover:border-slate-200"
                                    >
                                      {keyword}
                                    </Badge>
                                  ))}
                                  {file.keywords.length > 4 && (
                                    <Badge variant="outline" className="text-xs text-slate-400 border-dashed">
                                      +{file.keywords.length - 4}
                                    </Badge>
                                  )}
                                </>
                              ) : (
                                <span className="text-xs text-slate-400 italic">No keywords tagged</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Pagination Footer */}
      {pagination.total_pages > 1 && (
        <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Showing <span className="font-bold text-slate-800 dark:text-slate-200">{(pagination.page - 1) * pagination.page_size + 1}</span> to{' '}
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {Math.min(pagination.page * pagination.page_size, pagination.total)}
              </span>{' '}
              of <span className="font-bold text-slate-800 dark:text-slate-200">{pagination.total}</span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.total_pages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal - Redesigned to be HORIZONTAL / SIDE-BY-SIDE */}
      <Dialog open={!!selectedFile} onOpenChange={(open) => !open && setSelectedFile(null)}>
        <DialogContent className="max-w-[95vw] 2xl:max-w-7xl p-0 gap-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-hidden h-[90vh] sm:h-[85vh] flex flex-col">
          {selectedFile && (
            <>
              {/* Modal Header */}
              <div className="flex-shrink-0 px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-xl border-2 bg-white dark:bg-slate-800",
                    getScoreColor(selectedFile.total_score)
                  )}>
                    <span className="text-lg font-bold">{selectedFile.total_score}</span>
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white leading-tight line-clamp-1">
                      {selectedFile.file_name}
                    </DialogTitle>
                    <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                      <span className="uppercase font-semibold tracking-wider text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {selectedFile.paper_type?.replace(/_/g, ' ') || 'Unknown Type'}
                      </span>
                      <span>•</span>
                      <span>Uploaded {format(new Date(selectedFile.created_at), 'MMM d, yyyy')}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Horizontal Split Layout: Content (Left) + Comments (Right) */}
              <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 h-full">
                {/* LEFT COLUMN: Metadata & Keywords (4 columns wide) */}
                <div className="col-span-12 md:col-span-4 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 h-full overflow-y-auto">
                  <div className="p-6 space-y-8">
                    {/* Stats */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Verification Stats</h4>
                      <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-500">Confidence</span>
                          <Badge variant={selectedFile.confidence > 80 ? "default" : "secondary"}>
                            {selectedFile.confidence}%
                          </Badge>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-500">Reviews</span>
                          <span className="text-sm font-bold">{selectedFile.comments.length}</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-500">Review ID</span>
                          <span className="text-xs font-mono text-slate-400">#{selectedFile.id}</span>
                        </div>
                      </div>
                    </div>

                    {/* Keywords */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tagged Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedFile.keywords.length > 0 ? (
                          selectedFile.keywords.map((keyword) => (
                            <Badge
                              key={keyword}
                              variant="outline"
                              className="bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 py-1"
                            >
                              {keyword}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-slate-500 italic">No keywords tagged</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Reviewer Comments (8 columns wide) */}
                <div className="col-span-12 md:col-span-8 bg-white dark:bg-slate-900 h-full overflow-y-auto">
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Reviewer Feedback</h3>
                        <p className="text-sm text-slate-500">Detailed analysis from clinical reviewers</p>
                      </div>
                    </div>

                    {selectedFile.comments.length > 0 ? (
                      <div className="grid gap-4">
                        {selectedFile.comments.map((comment, idx) => (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={comment.id}
                            className={cn(
                              "p-5 rounded-xl border transition-all hover:shadow-md",
                              comment.is_penalty
                                ? "bg-red-50/50 dark:bg-red-900/5 border-red-100 dark:border-red-900/20"
                                : "bg-emerald-50/50 dark:bg-emerald-900/5 border-emerald-100 dark:border-emerald-900/20"
                            )}
                          >
                            <div className="flex gap-4">
                              <div className={cn(
                                "flex-shrink-0 mt-1",
                                comment.is_penalty ? "text-red-500" : "text-emerald-500"
                              )}>
                                {comment.is_penalty ? (
                                  <AlertCircle className="h-5 w-5" />
                                ) : (
                                  <Star className="h-5 w-5 fill-emerald-500/20" />
                                )}
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={cn(
                                    "text-xs font-bold uppercase tracking-wide",
                                    comment.is_penalty ? "text-red-600" : "text-emerald-600"
                                  )}>
                                    {comment.is_penalty ? "Critical Note" : "Validation"}
                                  </span>
                                  <span className="text-slate-300 dark:text-slate-600">•</span>
                                  <span className="text-xs text-slate-500">Reviewer #{idx + 1}</span>
                                </div>
                                <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-sm">
                                  {comment.comment}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                        <p className="text-slate-500 dark:text-slate-400">No review comments available for this document.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-800 px-6 py-4 bg-white dark:bg-slate-900 flex justify-end">
                <Button
                  onClick={() => setSelectedFile(null)}
                  variant="outline"
                  className="min-w-[100px]"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
