"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
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
  Shield,
  Check,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { getFiles, getCategories, getPaperTypes, searchEvidence, getEvidenceCache, updateEvidenceCache, type FileResponse, type SearchRequest } from '@/lib/api/evidence';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';

export function EvidenceEngine() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [files, setFiles] = useState<FileResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Separate pending filters (in dialog) from applied filters
  const [appliedFilters, setAppliedFilters] = useState<SearchRequest>({
    page: 1,
    page_size: 10,
  });
  const [pendingFilters, setPendingFilters] = useState<SearchRequest>({
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

  // Count active filters for the badge
  const getActiveFilterCount = useCallback(() => {
    let count = 0;
    if (appliedFilters.paper_types && appliedFilters.paper_types.length > 0) count++;
    if (appliedFilters.min_total_score !== undefined) count++;
    if (appliedFilters.max_total_score !== undefined) count++;
    if (appliedFilters.min_confidence !== undefined) count++;
    if (appliedFilters.start_date) count++;
    if (appliedFilters.end_date) count++;
    if (appliedFilters.keywords && appliedFilters.keywords.length > 0) count++;
    if (appliedFilters.has_comments) count++;
    return count;
  }, [appliedFilters]);

  // Fetch initial data
  useEffect(() => {
    const cache = getEvidenceCache();
    if (cache.hasLoaded && cache.files) {
      setFiles(cache.files);
      setCategories(cache.categories || []);
      setPaperTypes(cache.paperTypes || []);
      if (cache.pagination) setPagination(cache.pagination);
      setIsLoading(false);
      setIsLoadingPaperTypes(false);
    } else {
      fetchCategories();
      fetchPaperTypes();
    }
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useCallback((filters: SearchRequest, query: string) => {
    return (
      query.trim() !== '' ||
      (filters.paper_types && filters.paper_types.length > 0) ||
      filters.min_total_score !== undefined ||
      filters.max_total_score !== undefined ||
      filters.min_confidence !== undefined ||
      filters.start_date !== undefined ||
      filters.end_date !== undefined ||
      (filters.keywords && filters.keywords.length > 0) ||
      filters.has_comments === true
    );
  }, []);

  // Fetch files based on filters
  const fetchFiles = useCallback(async (isInitialLoad = false, currentFilters?: SearchRequest) => {
    try {
      setIsLoading(true);
      const filtersToUse = currentFilters || appliedFilters;
      const currentPage = pagination.page;
      const currentPageSize = pagination.page_size;

      const filtersActive = hasActiveFilters(filtersToUse, searchQuery);

      let response;
      if (filtersActive) {
        const searchParams: SearchRequest = {
          ...filtersToUse,
          search_text: searchQuery || undefined,
          page: currentPage,
          page_size: currentPageSize,
        };
        response = await searchEvidence(searchParams);
      } else {
        response = await getFiles(currentPage, currentPageSize);
      }

      if (Array.isArray(response)) {
        setFiles(response);
        setPagination(prev => {
          const paginationData = {
            ...prev,
            total: response.length,
            total_pages: 1,
          };

          if (isInitialLoad && !filtersActive) {
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

          if (isInitialLoad && !filtersActive && (paginationData.page === 1)) {
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
  }, [pagination.page, pagination.page_size, searchQuery, appliedFilters, hasActiveFilters]);

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
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchFiles(false);
  };

  // Handle pending filter changes (in dialog)
  const handlePendingFilterChange = (key: keyof SearchRequest, value: any) => {
    setPendingFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Apply filters from dialog
  const applyFilters = () => {
    setAppliedFilters(pendingFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    setIsFilterOpen(false);
    // Fetch with the new filters
    fetchFiles(false, pendingFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    const emptyFilters: SearchRequest = {
      page: 1,
      page_size: 10,
    };
    setPendingFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setSearchQuery('');
    setPagination(prev => ({ ...prev, page: 1 }));
    setIsFilterOpen(false);
    fetchFiles(false, emptyFilters);
  };

  // Reset pending filters to match applied
  const resetPendingFilters = () => {
    setPendingFilters(appliedFilters);
  };

  // Initialize pending filters when dialog opens
  useEffect(() => {
    if (isFilterOpen) {
      setPendingFilters(appliedFilters);
    }
  }, [isFilterOpen, appliedFilters]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      setPagination(prev => ({
        ...prev,
        page: newPage,
      }));
    }
  };

  // Fetch on page change
  useEffect(() => {
    fetchFiles();
  }, [pagination.page]);

  // Initial load
  useEffect(() => {
    const cache = getEvidenceCache();
    if (!cache.hasLoaded) {
      fetchFiles(true);
    }
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 60) return 'text-teal-400 bg-teal-500/10 border-teal-500/30';
    if (score >= 40) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-red-400 bg-red-500/10 border-red-500/30';
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-xl">
      {/* Header */}
      <div className="border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 px-6 py-5 sticky top-0 z-10 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Evidence Library
              </h2>
              <p className="text-sm text-slate-400">
                Clinical knowledge base • {pagination.total} documents
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative group">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-teal-400 transition-colors" />
              <Input
                type="text"
                placeholder="Search evidence..."
                className="pl-10 w-72 bg-slate-800/80 border-slate-700 focus:ring-teal-500/30 focus:border-teal-500 transition-all text-slate-200 placeholder:text-slate-500 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            {/* Filter Button */}
            <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "relative bg-slate-800/80 border-slate-700 hover:bg-slate-700 transition-all rounded-xl gap-2",
                    activeFilterCount > 0
                      ? "text-teal-400 border-teal-500/50 hover:border-teal-500"
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {activeFilterCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-teal-500 text-white text-xs font-bold rounded-full shadow-lg shadow-teal-500/30">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-3xl p-0 gap-0 bg-slate-900 border-slate-700 overflow-hidden flex flex-col max-h-[85vh] text-slate-200 rounded-2xl shadow-2xl">
                {/* Dialog Header */}
                <div className="px-6 py-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <DialogTitle className="text-lg font-bold text-white">Advanced Filters</DialogTitle>
                        <p className="text-sm text-slate-400">Refine your evidence search</p>
                      </div>
                    </div>
                    {activeFilterCount > 0 && (
                      <Badge className="bg-teal-500/20 text-teal-400 border border-teal-500/30">
                        {activeFilterCount} active
                      </Badge>
                    )}
                  </div>
                </div>

                <ScrollArea className="flex-1 max-h-[55vh]">
                  <div className="p-6 space-y-6">
                    {/* Paper Types Section */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-teal-400" />
                        <label className="text-sm font-semibold text-slate-300">Paper Types</label>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
                        {isLoadingPaperTypes ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-5 w-5 animate-spin text-teal-500" />
                          </div>
                        ) : paperTypes && paperTypes.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {paperTypes.map((type) => {
                              const isSelected = pendingFilters.paper_types?.includes(type) || false;
                              return (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => {
                                    const newTypes = pendingFilters.paper_types || [];
                                    if (isSelected) {
                                      handlePendingFilterChange('paper_types', newTypes.filter(t => t !== type));
                                    } else {
                                      handlePendingFilterChange('paper_types', [...newTypes, type]);
                                    }
                                  }}
                                  className={cn(
                                    "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border",
                                    isSelected
                                      ? "bg-teal-500/20 text-teal-400 border-teal-500/50 shadow-md shadow-teal-500/10"
                                      : "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600 hover:text-slate-300"
                                  )}
                                >
                                  <span className="flex items-center gap-2">
                                    {isSelected && <Check className="h-3.5 w-3.5" />}
                                    <span className="capitalize">{type?.replace(/_/g, ' ') || 'Unknown'}</span>
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-sm text-slate-500 italic text-center py-4">No paper types available</div>
                        )}
                      </div>
                    </div>

                    {/* Score Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Quality Score Range */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-amber-400" />
                          <label className="text-sm font-semibold text-slate-300">Quality Score</label>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4 space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-slate-500 mb-1.5">Min Score</label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                placeholder="0"
                                className="bg-slate-900 border-slate-700 text-slate-200 focus:border-teal-500 rounded-lg"
                                value={pendingFilters.min_total_score || ''}
                                onChange={(e) => handlePendingFilterChange('min_total_score', e.target.value ? Number(e.target.value) : undefined)}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-500 mb-1.5">Max Score</label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                placeholder="100"
                                className="bg-slate-900 border-slate-700 text-slate-200 focus:border-teal-500 rounded-lg"
                                value={pendingFilters.max_total_score || ''}
                                onChange={(e) => handlePendingFilterChange('max_total_score', e.target.value ? Number(e.target.value) : undefined)}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">Min Confidence %</label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="0"
                              className="bg-slate-900 border-slate-700 text-slate-200 focus:border-teal-500 rounded-lg"
                              value={pendingFilters.min_confidence || ''}
                              onChange={(e) => handlePendingFilterChange('min_confidence', e.target.value ? Number(e.target.value) : undefined)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Date Range */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-400" />
                          <label className="text-sm font-semibold text-slate-300">Date Range</label>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4 space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">From Date</label>
                            <Input
                              type="date"
                              className="bg-slate-900 border-slate-700 text-slate-200 focus:border-teal-500 rounded-lg"
                              value={pendingFilters.start_date?.split('T')[0] || ''}
                              onChange={(e) => handlePendingFilterChange('start_date', e.target.value ? `${e.target.value}T00:00:00Z` : undefined)}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">To Date</label>
                            <Input
                              type="date"
                              className="bg-slate-900 border-slate-700 text-slate-200 focus:border-teal-500 rounded-lg"
                              value={pendingFilters.end_date?.split('T')[0] || ''}
                              onChange={(e) => handlePendingFilterChange('end_date', e.target.value ? `${e.target.value}T23:59:59Z` : undefined)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Keywords */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-purple-400" />
                        <label className="text-sm font-semibold text-slate-300">Keywords</label>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
                        <textarea
                          className="w-full h-24 p-3 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none resize-none transition-all placeholder:text-slate-500"
                          placeholder="Enter keywords separated by commas (e.g., prognosis, diagnosis, treatment)"
                          value={pendingFilters.keywords?.join(', ') || ''}
                          onChange={(e) => {
                            const keywords = e.target.value
                              .split(',')
                              .map(k => k.trim())
                              .filter(k => k.length > 0);
                            handlePendingFilterChange('keywords', keywords.length > 0 ? keywords : undefined);
                          }}
                        />
                      </div>
                    </div>

                    {/* Additional Options */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-rose-400" />
                        <label className="text-sm font-semibold text-slate-300">Additional Options</label>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className={cn(
                            "w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center",
                            pendingFilters.has_comments
                              ? "bg-teal-500 border-teal-500"
                              : "bg-slate-900 border-slate-600 group-hover:border-slate-500"
                          )}>
                            {pendingFilters.has_comments && <Check className="h-3.5 w-3.5 text-white" />}
                          </div>
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={pendingFilters.has_comments || false}
                            onChange={(e) => handlePendingFilterChange('has_comments', e.target.checked || undefined)}
                          />
                          <div>
                            <span className="text-sm font-medium text-slate-200">Reviewed Documents Only</span>
                            <p className="text-xs text-slate-500">Show only documents with reviewer comments</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                {/* Dialog Footer */}
                <div className="p-5 border-t border-slate-800 bg-slate-900/80 backdrop-blur-sm flex items-center justify-between gap-3">
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset All
                  </Button>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsFilterOpen(false)}
                      className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={applyFilters}
                      className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium px-6 shadow-lg shadow-teal-500/20"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Quick Clear Filters */}
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Active Filter Pills */}
        {activeFilterCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 flex flex-wrap gap-2"
          >
            {appliedFilters.paper_types?.map((type) => (
              <Badge
                key={type}
                variant="secondary"
                className="bg-teal-500/20 text-teal-400 border border-teal-500/30 pl-2 pr-1 py-1 gap-1"
              >
                <span className="capitalize">{type.replace(/_/g, ' ')}</span>
                <button
                  onClick={() => {
                    const newTypes = appliedFilters.paper_types?.filter(t => t !== type);
                    const newFilters = { ...appliedFilters, paper_types: newTypes?.length ? newTypes : undefined };
                    setAppliedFilters(newFilters);
                    fetchFiles(false, newFilters);
                  }}
                  className="ml-1 hover:bg-teal-500/30 rounded p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {appliedFilters.min_total_score !== undefined && (
              <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Score ≥ {appliedFilters.min_total_score}
              </Badge>
            )}
            {appliedFilters.max_total_score !== undefined && (
              <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Score ≤ {appliedFilters.max_total_score}
              </Badge>
            )}
            {appliedFilters.min_confidence !== undefined && (
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Confidence ≥ {appliedFilters.min_confidence}%
              </Badge>
            )}
            {appliedFilters.has_comments && (
              <Badge variant="secondary" className="bg-rose-500/20 text-rose-400 border border-rose-500/30">
                Reviewed Only
              </Badge>
            )}
          </motion.div>
        )}
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
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-teal-500 to-teal-400 scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-300" />
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-900/50 to-slate-900 p-6">
            <TabsContent value="all" className="outline-none m-0">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-slate-700 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-sm text-slate-500">Loading evidence...</p>
                </div>
              ) : !files || files.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-64 text-center p-8 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700 mx-auto max-w-2xl mt-8"
                >
                  <div className="bg-slate-800 p-4 rounded-2xl mb-4">
                    <FileText className="h-10 w-10 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-300">No evidence found</h3>
                  <p className="text-slate-500 max-w-sm mt-2">
                    {searchQuery || activeFilterCount > 0
                      ? 'Try adjusting your search criteria or filters to see results'
                      : 'Your knowledge base is currently empty'}
                  </p>
                  {activeFilterCount > 0 && (
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="mt-4 border-slate-700 text-slate-400 hover:text-white"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Clear All Filters
                    </Button>
                  )}
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
                        className="group bg-slate-800/50 rounded-xl p-5 shadow-sm hover:shadow-xl border border-slate-700/50 hover:border-teal-500/40 transition-all duration-300 cursor-pointer relative overflow-hidden backdrop-blur-sm"
                        onClick={() => setSelectedFile(file)}
                      >
                        {/* Hover glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/5 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-teal-400 bg-teal-500/10 rounded-lg hover:bg-teal-500/20">
                            <BookOpen className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-start gap-5 relative">
                          {/* Score Badge */}
                          <div className={cn(
                            "flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-xl border-2 shadow-lg",
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
                              <div className="flex items-center gap-1.5 bg-slate-900/50 px-2.5 py-1 rounded-lg border border-slate-700/50">
                                <Tag className="h-3.5 w-3.5" />
                                <span className="capitalize">{file.paper_type ? file.paper_type.replace(/_/g, ' ') : 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{format(new Date(file.created_at), 'MMM d, yyyy')}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <MessageSquare className="h-3.5 w-3.5" />
                                <span>{file.comments?.length || 0} comments</span>
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
                                  {(file.keywords?.length || 0) > 4 && (
                                    <Badge variant="outline" className="text-xs text-slate-500 border-dashed border-slate-600">
                                      +{(file.keywords?.length || 0) - 4}
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
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 rounded-lg gap-1"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              {/* Page numbers */}
              <div className="hidden sm:flex gap-1">
                {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                  let pageNum;
                  if (pagination.total_pages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.total_pages - 2) {
                    pageNum = pagination.total_pages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant="outline"
                      size="sm"
                      className={cn(
                        "w-9 rounded-lg",
                        pagination.page === pageNum
                          ? "bg-teal-500 border-teal-500 text-white hover:bg-teal-600"
                          : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                      )}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 rounded-lg gap-1"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.total_pages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      <Dialog open={!!selectedFile} onOpenChange={(open) => !open && setSelectedFile(null)}>
        <DialogContent className="max-w-[95vw] 2xl:max-w-7xl p-0 gap-0 bg-slate-950 border-slate-800 text-slate-200 overflow-hidden h-[90vh] sm:h-[85vh] flex flex-col rounded-2xl shadow-2xl">
          {selectedFile && (
            <>
              {/* Modal Header */}
              <div className="flex-shrink-0 px-8 py-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "flex items-center justify-center w-14 h-14 rounded-xl border-2 bg-slate-900 shadow-lg",
                    getScoreColor(selectedFile.total_score)
                  )}>
                    <span className="text-xl font-bold">{selectedFile.total_score}</span>
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-white leading-tight line-clamp-1">
                      {selectedFile.file_name}
                    </DialogTitle>
                    <p className="text-sm text-slate-400 flex items-center gap-2 mt-1">
                      <Badge className="uppercase font-semibold text-[10px] bg-teal-500/20 text-teal-400 border border-teal-500/30">
                        {selectedFile.paper_type?.replace(/_/g, ' ') || 'Unknown Type'}
                      </Badge>
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
                          <Badge className="bg-teal-500 text-white hover:bg-teal-600">
                            {selectedFile.confidence}%
                          </Badge>
                        </div>
                        <Separator className="bg-slate-800" />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Reviews</span>
                          <span className="text-sm font-bold text-slate-200">{selectedFile.comments?.length || 0}</span>
                        </div>
                        <Separator className="bg-slate-800" />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Document ID</span>
                          <span className="text-xs font-mono text-slate-500">#{selectedFile.id}</span>
                        </div>
                      </div>
                    </div>

                    {/* Keywords */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tagged Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(selectedFile.keywords) && selectedFile.keywords.length > 0 ? (
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
                            <div key={idx} className="bg-slate-900 p-3 rounded-xl border border-slate-800 shadow-sm">
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-xs font-bold capitalize text-slate-400">
                                  {score.category?.replace(/_/g, ' ')}
                                </span>
                                <Badge variant="secondary" className="text-[10px] font-bold bg-slate-800 text-slate-300">
                                  {score.score}/{score.max_score}
                                </Badge>
                              </div>
                              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-teal-500 to-teal-400 h-full rounded-full transition-all"
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
                      <div className="p-2.5 bg-teal-500/10 rounded-xl text-teal-400">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Reviewer Feedback</h3>
                        <p className="text-sm text-slate-400">Detailed analysis from clinical reviewers</p>
                      </div>
                    </div>

                    {(selectedFile.comments?.length || 0) > 0 ? (
                      <div className="grid gap-4">
                        {selectedFile.comments?.map((comment, idx) => (
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
                  className="min-w-[100px] border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg"
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
