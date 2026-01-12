"use client";

import { useState, useEffect, useCallback } from 'react';
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
  User,
  Shield
} from 'lucide-react';
import { getFiles, getCategories, getPaperTypes, searchEvidence, getEvidenceCache, updateEvidenceCache, type FileResponse, type SearchRequest } from '@/lib/api/evidence';
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
    const cache = getEvidenceCache();
    if (cache.hasLoaded && cache.files) {
      // Use cached data if available
      setFiles(cache.files);
      setCategories(cache.categories || []);
      setPaperTypes(cache.paperTypes || []);
      if (cache.pagination) setPagination(cache.pagination);
      setIsLoading(false);
      setIsLoadingPaperTypes(false);
    } else {
      // Otherwise fetch fresh - handled by the fetchFiles effect
      fetchCategories();
      fetchPaperTypes();
    }
  }, []);

  // Fetch files based on filters
  const fetchFiles = useCallback(async (isInitialLoad = false) => {
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
      if (Array.isArray(response)) {
        setFiles(response);
        setPagination(prev => {
          const paginationData = {
            ...prev,
            total: response.length,
            total_pages: 1,
          };

          if (isInitialLoad && !hasActiveFilters) {
            updateEvidenceCache({
              files: response,
              pagination: paginationData,
              hasLoaded: true
            });
          }
          return paginationData;
        });

      } else if (response && response.items) {
        setFiles(response.items);
        setPagination(prev => {
          const paginationData = {
            ...prev,
            page: response.page || currentPage,
            page_size: response.page_size || currentPageSize,
            total: response.total || 0,
            total_pages: response.total_pages || Math.ceil((response.total || 0) / (response.page_size || currentPageSize)),
          };

          if (isInitialLoad && !hasActiveFilters && (paginationData.page === 1)) {
            updateEvidenceCache({
              files: response.items,
              pagination: paginationData,
              hasLoaded: true
            });
          }
          return paginationData;
        });
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.page_size, searchQuery, filters]);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
      updateEvidenceCache({ categories: data });
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPaperTypes = async () => {
    try {
      setIsLoadingPaperTypes(true);
      const data = await getPaperTypes();
      const types = Array.isArray(data) ? data : [];
      setPaperTypes(types);
      updateEvidenceCache({ paperTypes: types });
    } catch (error) {
      console.error('Error fetching paper types:', error);
      setPaperTypes([]);
    } finally {
      setIsLoadingPaperTypes(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset page to 1 when searching
    setPagination(prev => ({ ...prev, page: 1 }));
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
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
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
  }, [fetchFiles]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-teal-400 bg-teal-500/10 border-teal-500/20';
    if (score >= 60) return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900 px-6 py-4 sticky top-0 z-10 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-400" />
              Evidence Library
            </h2>
            <p className="text-sm text-slate-400">
              Access and manage your clinical knowledge base
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <form onSubmit={handleSearch} className="relative group">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
              <Input
                type="text"
                placeholder="Search evidence..."
                className="pl-10 w-64 bg-slate-800 border-slate-700 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-slate-200 placeholder:text-slate-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700">
                  <Filter className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl p-0 gap-0 bg-slate-900 border-slate-800 overflow-hidden flex flex-col max-h-[90vh] text-slate-200">
                <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                  <DialogTitle className="text-lg font-semibold text-white">Filter Evidence</DialogTitle>
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Paper Types Column */}
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <FileText className="h-4 w-4 text-teal-500" />
                        Paper Types
                      </label>
                      <div className="h-[150px] pr-4 border border-slate-700 rounded-lg bg-slate-800/50 p-3 overflow-y-auto">
                        <div className="space-y-2">
                          {isLoadingPaperTypes ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="h-5 w-5 animate-spin text-teal-500" />
                            </div>
                          ) : paperTypes && paperTypes.length > 0 ? (
                            paperTypes.map((type) => (
                              <label key={type} className="flex items-center p-2 rounded-md hover:bg-slate-800 transition-colors cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 accent-teal-500 rounded border-slate-600 bg-slate-700"
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
                                <span className="ml-3 text-sm text-slate-300 capitalize">{type?.replace(/_/g, ' ') || 'Unknown'}</span>
                              </label>
                            ))) :
                            (
                              <div className="text-sm text-slate-500 italic">No paper types available</div>
                            )}
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-800">
                        <label className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                          <Calendar className="h-4 w-4 text-amber-500" />
                          Date Range
                        </label>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Start Date</label>
                            <Input
                              type="date"
                              className="bg-slate-800 border-slate-700 text-slate-200"
                              value={filters.start_date?.split('T')[0] || ''}
                              onChange={(e) => handleFilterChange('start_date', e.target.value ? `${e.target.value}T00:00:00Z` : undefined)}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">End Date</label>
                            <Input
                              type="date"
                              className="bg-slate-800 border-slate-700 text-slate-200"
                              value={filters.end_date?.split('T')[0] || ''}
                              onChange={(e) => handleFilterChange('end_date', e.target.value ? `${e.target.value}T23:59:59Z` : undefined)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Scores Column */}
                    <div className="space-y-6">
                      <label className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Star className="h-4 w-4 text-amber-500" />
                        Quality Scores
                      </label>

                      <div className="space-y-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Min Total Score (0-100)</label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            className="bg-slate-800 border-slate-700 text-slate-200"
                            value={filters.min_total_score || ''}
                            onChange={(e) => handleFilterChange('min_total_score', e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Max Total Score (0-100)</label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            className="bg-slate-800 border-slate-700 text-slate-200"
                            value={filters.max_total_score || ''}
                            onChange={(e) => handleFilterChange('max_total_score', e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </div>
                        <Separator className="bg-slate-700" />
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Min Confidence %</label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            className="bg-slate-800 border-slate-700 text-slate-200"
                            value={filters.min_confidence || ''}
                            onChange={(e) => handleFilterChange('min_confidence', e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 p-3 bg-teal-500/10 rounded-lg border border-teal-500/20">
                        <input
                          type="checkbox"
                          id="has_comments"
                          className="h-4 w-4 accent-teal-500 rounded border-slate-600 bg-slate-700"
                          checked={filters.has_comments || false}
                          onChange={(e) => handleFilterChange('has_comments', e.target.checked)}
                        />
                        <label htmlFor="has_comments" className="text-sm font-medium text-slate-200 cursor-pointer">
                          Include Only Reviewed Files
                        </label>
                      </div>
                    </div>

                    {/* Keywords Column */}
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Tag className="h-4 w-4 text-teal-500" />
                        Keywords
                      </label>
                      <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 h-full">
                        <label className="block text-xs font-semibold text-slate-500 mb-2">Comma separated values</label>
                        <textarea
                          className="w-full h-[150px] p-3 rounded-md border border-slate-700 bg-slate-800 text-slate-200 text-sm focus:ring-2 focus:ring-teal-500/50 outline-none resize-none"
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

                <div className="p-6 border-t border-slate-800 bg-slate-900 flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-white"
                  >
                    Reset All
                  </Button>
                  <Button
                    onClick={() => {
                      setIsFilterOpen(false);
                      // Applying filters might not strictly require checking page if filters object already updated
                      // But usually 'Filter' dialog Apply button implies action.
                      // We'll rely on the effect triggered by state changes if any.
                      // If no state changed, no fetch. That's consistent.
                    }}
                    className="bg-teal-500 hover:bg-teal-600 text-white min-w-[120px]"
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
          <div className="px-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
            <TabsList className="flex space-x-6 bg-transparent">
              <TabsTrigger
                value="all"
                className="relative py-4 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors data-[state=active]:text-teal-400 data-[state=active]:bg-transparent outline-none group"
              >
                All Evidence
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-500 scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300" />
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-900/50 p-6">
            <TabsContent value="active" className="outline-none m-0">
              {/* empty */}
            </TabsContent>
            <TabsContent value="all" className="outline-none m-0">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-teal-500/50" />
                  <p className="text-sm text-slate-500">Loading evidence...</p>
                </div>
              ) : !files || files.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-64 text-center p-8 bg-slate-800/50 rounded-2xl border border-dashed border-slate-700 mx-auto max-w-2xl mt-8"
                >
                  <div className="bg-slate-800 p-4 rounded-full mb-4">
                    <FileText className="h-10 w-10 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-300">No evidence found</h3>
                  <p className="text-slate-500 max-w-sm mt-2">
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
                        className="group bg-slate-800 rounded-xl p-5 shadow-sm hover:shadow-lg border border-slate-700 hover:border-teal-500/50 transition-all duration-300 cursor-pointer relative overflow-hidden"
                        onClick={() => setSelectedFile(file)}
                      >
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-teal-400 bg-teal-500/10 rounded-full hover:bg-teal-500/20">
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
                            <h3 className="text-lg font-bold text-slate-200 group-hover:text-teal-400 transition-colors line-clamp-1 mb-2">
                              {file.file_name}
                            </h3>

                            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400 mb-3">
                              <div className="flex items-center gap-1.5 bg-slate-900/50 px-2.5 py-1 rounded-md border border-slate-700/50">
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
                                      className="bg-slate-900/60 text-slate-400 hover:bg-slate-900 transition-all font-medium border border-slate-700/50"
                                    >
                                      {keyword}
                                    </Badge>
                                  ))}
                                  {file.keywords.length > 4 && (
                                    <Badge variant="outline" className="text-xs text-slate-500 border-dashed border-slate-600">
                                      +{file.keywords.length - 4}
                                    </Badge>
                                  )}
                                </>
                              ) : (
                                <span className="text-xs text-slate-500 italic">No keywords tagged</span>
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
        <div className="border-t border-slate-800 px-6 py-4 bg-slate-900">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            <div className="text-sm text-slate-400">
              Showing <span className="font-bold text-slate-200">{(pagination.page - 1) * pagination.page_size + 1}</span> to{' '}
              <span className="font-bold text-slate-200">
                {Math.min(pagination.page * pagination.page_size, pagination.total)}
              </span>{' '}
              of <span className="font-bold text-slate-200">{pagination.total}</span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.total_pages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      <Dialog open={!!selectedFile} onOpenChange={(open) => !open && setSelectedFile(null)}>
        <DialogContent className="max-w-[95vw] 2xl:max-w-7xl p-0 gap-0 bg-slate-950 border-slate-800 text-slate-200 overflow-hidden h-[90vh] sm:h-[85vh] flex flex-col">
          {selectedFile && (
            <>
              {/* Modal Header */}
              <div className="flex-shrink-0 px-8 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-xl border-2 bg-slate-900",
                    getScoreColor(selectedFile.total_score)
                  )}>
                    <span className="text-lg font-bold">{selectedFile.total_score}</span>
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-white leading-tight line-clamp-1">
                      {selectedFile.file_name}
                    </DialogTitle>
                    <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                      <span className="uppercase font-semibold tracking-wider text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-teal-400">
                        {selectedFile.paper_type?.replace(/_/g, ' ') || 'Unknown Type'}
                      </span>
                      <span>•</span>
                      <span>Uploaded {format(new Date(selectedFile.created_at), 'MMM d, yyyy')}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Horizontal Split Layout */}
              <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 h-full">
                {/* LEFT COLUMN */}
                <div className="col-span-12 md:col-span-4 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-900/50 h-full overflow-y-auto">
                  <div className="p-6 space-y-8">
                    {/* Stats */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Verification Stats</h4>
                      <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Confidence</span>
                          <Badge variant={selectedFile.confidence > 80 ? "default" : "secondary"} className="bg-teal-500 text-white hover:bg-teal-600">
                            {selectedFile.confidence}%
                          </Badge>
                        </div>
                        <Separator className="bg-slate-800" />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Reviews</span>
                          <span className="text-sm font-bold text-slate-200">{selectedFile.comments.length}</span>
                        </div>
                        <Separator className="bg-slate-800" />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Review ID</span>
                          <span className="text-xs font-mono text-slate-500">#{selectedFile.id}</span>
                        </div>
                      </div>
                    </div>

                    {/* Keywords */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tagged Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedFile.keywords.length > 0 ? (
                          selectedFile.keywords.map((keyword) => (
                            <Badge
                              key={keyword}
                              variant="outline"
                              className="bg-slate-900 text-slate-400 border-slate-700 py-1"
                            >
                              {keyword}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-slate-500 italic">No keywords tagged</span>
                        )}
                      </div>
                    </div>

                    {/* Detailed Category Scores */}
                    {selectedFile.scores && selectedFile.scores.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Detailed Performance</h4>
                        <div className="space-y-3">
                          {selectedFile.scores.map((score, idx) => (
                            <div key={idx} className="bg-slate-900 p-3 rounded-lg border border-slate-800 shadow-sm">
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-xs font-bold capitalize text-slate-400">
                                  {score.category?.replace(/_/g, ' ')}
                                </span>
                                <Badge variant="secondary" className="text-[10px] font-bold bg-slate-800 text-slate-300">
                                  {score.score}/{score.max_score}
                                </Badge>
                              </div>
                              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                                <div
                                  className="bg-teal-500 h-full rounded-full transition-all"
                                  style={{ width: `${(score.score / score.max_score) * 100}%` }}
                                />
                              </div>
                              {score.rationale && (
                                <p className="text-[10px] text-slate-500 mt-2 line-clamp-2 italic">"{score.rationale}"</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="col-span-12 md:col-span-8 bg-slate-950 h-full overflow-y-auto">
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-teal-500/10 rounded-lg text-teal-400">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Reviewer Feedback</h3>
                        <p className="text-sm text-slate-400">Detailed analysis from clinical reviewers</p>
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
                                ? "bg-red-900/10 border-red-900/30"
                                : "bg-emerald-900/10 border-emerald-900/30"
                            )}
                          >
                            <div className="flex gap-4">
                              <div className={cn(
                                "flex-shrink-0 mt-1",
                                comment.is_penalty ? "text-red-400" : "text-emerald-400"
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
                                    comment.is_penalty ? "text-red-400" : "text-emerald-400"
                                  )}>
                                    {comment.is_penalty ? "Critical Note" : "Validation"}
                                  </span>
                                  <span className="text-slate-600">•</span>
                                  <span className="text-xs text-slate-500">Reviewer #{idx + 1}</span>
                                </div>
                                <p className="text-slate-300 leading-relaxed text-sm">
                                  {comment.comment}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
                        <p className="text-slate-500">No review comments available for this document.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 border-t border-slate-800 px-6 py-4 bg-slate-900 flex justify-end">
                <Button
                  onClick={() => setSelectedFile(null)}
                  variant="outline"
                  className="min-w-[100px] border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
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
