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
  Sparkles,
  ClipboardList
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
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (score >= 60) return 'text-rose-600 bg-rose-50 border-rose-100';
    if (score >= 40) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-red-600 bg-red-50 border-red-100';
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="h-full flex flex-col bg-white rounded-3xl overflow-hidden border border-rose-100 shadow-xl shadow-rose-500/5">
      {/* Header */}
      <div className="border-b border-rose-50 bg-white px-8 py-8 sticky top-0 z-10 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20 rotate-3">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                Evidence <span className="text-rose-500">Library</span>
              </h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
                Clinical knowledge base · {pagination.total} Verified Records
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative group">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
              <Input
                type="text"
                placeholder="PROBE KNOWLEDGE BASE..."
                className="pl-12 w-80 bg-rose-50/30 border-rose-100 focus:ring-rose-500/10 focus:border-rose-300 transition-all text-slate-800 placeholder:text-rose-300 placeholder:font-black placeholder:uppercase placeholder:tracking-widest rounded-2xl h-12 outline-none"
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
                    "relative bg-white border-rose-100 hover:bg-rose-50 transition-all rounded-2xl h-12 px-6 gap-2 font-black uppercase tracking-widest text-[10px]",
                    activeFilterCount > 0
                      ? "text-rose-600 border-rose-300 bg-rose-50 shadow-lg shadow-rose-500/5"
                      : "text-slate-500 hover:text-rose-600"
                  )}
                >
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Advanced Scope</span>
                  {activeFilterCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-rose-500 text-white text-[10px] font-black rounded-full shadow-lg shadow-rose-500/20 border-2 border-white">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-3xl p-0 gap-0 bg-white border-rose-100 overflow-hidden flex flex-col max-h-[85vh] text-slate-800 rounded-[2.5rem] shadow-2xl">
                {/* Dialog Header */}
                <div className="px-10 py-8 border-b border-rose-50 bg-rose-50/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
                        <Sparkles className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <DialogTitle className="text-xl font-black text-slate-900 uppercase tracking-tight">Advanced Parameters</DialogTitle>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Refine Clinical Search Scope</p>
                      </div>
                    </div>
                    {activeFilterCount > 0 && (
                      <Badge className="bg-rose-500 text-white font-black px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest border-0">
                        {activeFilterCount} active filters
                      </Badge>
                    )}
                  </div>
                </div>

                <ScrollArea className="flex-1 max-h-[55vh]">
                  <div className="p-10 space-y-10">
                    {/* Paper Types Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-rose-500" />
                        <label className="text-xs font-black text-rose-950 uppercase tracking-widest">Knowledge Class</label>
                      </div>
                      <div className="bg-rose-50/30 rounded-[2rem] border border-rose-100/50 p-6">
                        {isLoadingPaperTypes ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-5 w-5 animate-spin text-rose-500" />
                          </div>
                        ) : paperTypes && paperTypes.length > 0 ? (
                          <div className="flex flex-wrap gap-2.5">
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
                                    "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border",
                                    isSelected
                                      ? "bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/20 scale-105"
                                      : "bg-white text-slate-500 border-rose-100 hover:border-rose-300 hover:bg-rose-50"
                                  )}
                                >
                                  <span className="flex items-center gap-2">
                                    {isSelected && <Check className="h-3 w-3" />}
                                    <span>{type?.replace(/_/g, ' ') || 'Unknown'}</span>
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest text-center py-8">No Asset Types Identified</div>
                        )}
                      </div>
                    </div>

                    {/* Score Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Quality Score Range */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Star className="h-4 w-4 text-rose-500" />
                          <label className="text-xs font-black text-rose-950 uppercase tracking-widest">Quality Metrics</label>
                        </div>
                        <div className="bg-rose-50/30 rounded-[2rem] border border-rose-100/50 p-6 space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Min Rank</label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                placeholder="0"
                                className="bg-white border-rose-100 text-slate-800 focus:ring-rose-500/10 focus:border-rose-300 rounded-xl h-11"
                                value={pendingFilters.min_total_score || ''}
                                onChange={(e) => handlePendingFilterChange('min_total_score', e.target.value ? Number(e.target.value) : undefined)}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Max Rank</label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                placeholder="100"
                                className="bg-white border-rose-100 text-slate-800 focus:ring-rose-500/10 focus:border-rose-300 rounded-xl h-11"
                                value={pendingFilters.max_total_score || ''}
                                onChange={(e) => handlePendingFilterChange('max_total_score', e.target.value ? Number(e.target.value) : undefined)}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Min Confidence %</label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="75"
                              className="bg-white border-rose-100 text-slate-800 focus:ring-rose-500/10 focus:border-rose-300 rounded-xl h-11"
                              value={pendingFilters.min_confidence || ''}
                              onChange={(e) => handlePendingFilterChange('min_confidence', e.target.value ? Number(e.target.value) : undefined)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Date Range */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-rose-500" />
                          <label className="text-xs font-black text-rose-950 uppercase tracking-widest">Temporal Window</label>
                        </div>
                        <div className="bg-rose-50/30 rounded-[2rem] border border-rose-100/50 p-6 space-y-5">
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Horizon Start</label>
                            <Input
                              type="date"
                              className="bg-white border-rose-100 text-slate-800 focus:ring-rose-500/10 focus:border-rose-300 rounded-xl h-11"
                              value={pendingFilters.start_date?.split('T')[0] || ''}
                              onChange={(e) => handlePendingFilterChange('start_date', e.target.value ? `${e.target.value}T00:00:00Z` : undefined)}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Horizon End</label>
                            <Input
                              type="date"
                              className="bg-white border-rose-100 text-slate-800 focus:ring-rose-500/10 focus:border-rose-300 rounded-xl h-11"
                              value={pendingFilters.end_date?.split('T')[0] || ''}
                              onChange={(e) => handlePendingFilterChange('end_date', e.target.value ? `${e.target.value}T23:59:59Z` : undefined)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Keywords */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Tag className="h-4 w-4 text-rose-500" />
                        <label className="text-xs font-black text-rose-950 uppercase tracking-widest">Semantic Filters</label>
                      </div>
                      <div className="bg-rose-50/30 rounded-[2rem] border border-rose-100/50 p-6">
                        <textarea
                          className="w-full h-28 p-5 rounded-2xl border border-rose-100 bg-white text-slate-800 text-sm focus:ring-4 focus:ring-rose-500/5 focus:border-rose-300 outline-none resize-none transition-all placeholder:text-slate-300 placeholder:uppercase placeholder:font-black placeholder:text-[10px] placeholder:tracking-widest"
                          placeholder="ENTER SEMANTIC TOKENS SEPARATED BY COMMAS..."
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
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="h-4 w-4 text-rose-500" />
                        <label className="text-xs font-black text-rose-950 uppercase tracking-widest">Validation State</label>
                      </div>
                      <div className="bg-rose-50/30 rounded-[2rem] border border-rose-100/50 p-6">
                        <label className="flex items-center gap-4 cursor-pointer group">
                          <div className={cn(
                            "w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center",
                            pendingFilters.has_comments
                              ? "bg-rose-500 border-rose-400 shadow-lg shadow-rose-500/20"
                              : "bg-white border-rose-100 group-hover:border-rose-300"
                          )}>
                            {pendingFilters.has_comments && <Check className="h-4 w-4 text-white font-black" />}
                          </div>
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={pendingFilters.has_comments || false}
                            onChange={(e) => handlePendingFilterChange('has_comments', e.target.checked || undefined)}
                          />
                          <div>
                            <span className="text-xs font-black text-slate-800 uppercase tracking-tight">Verified Assets Only</span>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Filter for peer-reviewed knowledge objects</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                {/* Dialog Footer */}
                <div className="p-8 border-t border-rose-50 bg-white flex items-center justify-between gap-4">
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 font-black uppercase tracking-widest text-[10px] h-12 px-6 rounded-2xl"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Scope
                  </Button>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsFilterOpen(false)}
                      className="border-rose-100 bg-white text-slate-500 hover:bg-rose-50 font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-2xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={applyFilters}
                      className="bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-widest text-[10px] h-12 px-10 rounded-2xl shadow-xl shadow-rose-500/20"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Commit Parameters
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
                className="bg-rose-500 text-white pl-4 pr-2 py-2 gap-2 rounded-full font-black uppercase tracking-widest text-[9px] border-0"
              >
                <span className="capitalize">{type.replace(/_/g, ' ')}</span>
                <button
                  onClick={() => {
                    const newTypes = appliedFilters.paper_types?.filter(t => t !== type);
                    const newFilters = { ...appliedFilters, paper_types: newTypes?.length ? newTypes : undefined };
                    setAppliedFilters(newFilters);
                    fetchFiles(false, newFilters);
                  }}
                  className="ml-1 hover:bg-white/20 rounded-full p-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {appliedFilters.min_total_score !== undefined && (
              <Badge variant="secondary" className="bg-rose-50 text-rose-600 border border-rose-100 rounded-full font-black text-[9px] uppercase tracking-widest py-2 px-4">
                Min Score: {appliedFilters.min_total_score}
              </Badge>
            )}
            {appliedFilters.max_total_score !== undefined && (
              <Badge variant="secondary" className="bg-rose-50 text-rose-600 border border-rose-100 rounded-full font-black text-[9px] uppercase tracking-widest py-2 px-4">
                Max Score: {appliedFilters.max_total_score}
              </Badge>
            )}
            {appliedFilters.min_confidence !== undefined && (
              <Badge variant="secondary" className="bg-rose-50 text-rose-600 border border-rose-100 rounded-full font-black text-[9px] uppercase tracking-widest py-2 px-4">
                Confidence ≥ {appliedFilters.min_confidence}%
              </Badge>
            )}
            {appliedFilters.has_comments && (
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full font-black text-[9px] uppercase tracking-widest py-2 px-4">
                Verified Only
              </Badge>
            )}
          </motion.div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative min-h-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="px-8 border-b border-rose-50 bg-white">
            <TabsList className="flex space-x-10 bg-transparent">
              <TabsTrigger
                value="all"
                className="relative py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-rose-500 transition-colors data-[state=active]:text-rose-600 data-[state=active]:bg-transparent outline-none group"
              >
                Knowledge Assets
                <span className="absolute bottom-0 left-0 w-full h-1 bg-rose-500 scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-500 rounded-t-full" />
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto bg-white p-8">
            <TabsContent value="all" className="outline-none m-0">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-6">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-rose-50 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400">Syncing Knowledge Assets...</p>
                </div>
              ) : !files || files.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-96 text-center p-12 bg-rose-50/20 rounded-[3rem] border-2 border-dashed border-rose-100 mx-auto max-w-2xl mt-8"
                >
                  <div className="bg-white p-6 rounded-3xl shadow-xl shadow-rose-500/5 mb-6 rotate-6">
                    <FileText className="h-12 w-12 text-rose-200" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">No Evidence Found</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-sm mt-3 leading-loose">
                    {searchQuery || activeFilterCount > 0
                      ? 'Adjust search parameters or parameters to detect clinical assets'
                      : 'The clinical knowledge base is currently in standby'}
                  </p>
                  {activeFilterCount > 0 && (
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="mt-8 border-rose-200 text-rose-500 hover:bg-rose-50 rounded-2xl px-10 h-12 font-black uppercase tracking-widest text-[10px]"
                    >
                      <RotateCcw className="h-4 w-4 mr-3" />
                      Purge Filters
                    </Button>
                  )}
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 gap-6 max-w-5xl mx-auto">
                  <AnimatePresence>
                    {files.map((file, index) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className="group bg-white rounded-3xl p-7 shadow-sm hover:shadow-2xl border border-rose-50 hover:border-rose-300 transition-all duration-500 cursor-pointer relative overflow-hidden"
                        onClick={() => setSelectedFile(file)}
                      >
                        {/* Hover glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-500/5 to-rose-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                          <Button size="icon" variant="ghost" className="h-10 w-10 text-rose-500 bg-rose-50 rounded-xl hover:bg-rose-100">
                            <BookOpen className="h-5 w-5" />
                          </Button>
                        </div>

                        <div className="flex items-start gap-8 relative">
                          {/* Score Badge */}
                          <div className={cn(
                            "flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-2xl border-2 shadow-xl shadow-rose-500/5 bg-white",
                            getScoreColor(file.total_score)
                          )}>
                            <span className="text-2xl font-black">{file.total_score}</span>
                            <span className="text-[9px] uppercase font-black tracking-widest opacity-60">Score</span>
                          </div>

                          <div className="flex-1 min-w-0 pt-1">
                            <h3 className="text-xl font-black text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-1 mb-3 uppercase tracking-tight">
                              {file.file_name}
                            </h3>

                            <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-4">
                              <div className="flex items-center gap-2 bg-rose-50 text-rose-600 px-3 py-1.5 rounded-full border border-rose-100">
                                <Tag className="h-3.5 w-3.5" />
                                <span>{file.paper_type ? file.paper_type.replace(/_/g, ' ') : 'CORE ASSET'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5 text-slate-300" />
                                <span>{format(new Date(file.created_at), 'MMM d, yyyy')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MessageSquare className="h-3.5 w-3.5 text-slate-300" />
                                <span>{file.comments?.length || 0} REVIEWS</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {Array.isArray(file.keywords) && file.keywords.length > 0 ? (
                                <>
                                  {file.keywords.slice(0, 4).map((keyword, idx) => (
                                    <Badge
                                      key={`${keyword}-${idx}`}
                                      variant="secondary"
                                      className="bg-slate-50 text-slate-500 hover:bg-rose-50 group-hover:text-rose-600 transition-all font-black uppercase tracking-widest text-[8px] border border-slate-100 px-3 py-1 rounded-full"
                                    >
                                      {keyword}
                                    </Badge>
                                  ))}
                                  {(file.keywords?.length || 0) > 4 && (
                                    <Badge variant="outline" className="text-[9px] font-black text-slate-300 border-dashed border-slate-200 uppercase tracking-widest rounded-full">
                                      +{(file.keywords?.length || 0) - 4} Meta
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
        <div className="border-t border-rose-50 px-8 py-6 bg-white">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Discovered <span className="text-slate-900">{(pagination.page - 1) * pagination.page_size + 1} - {Math.min(pagination.page * pagination.page_size, pagination.total)}</span>
              {' '}/ <span className="text-rose-500">{pagination.total}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-white border-rose-100 text-slate-500 hover:bg-rose-50 hover:border-rose-300 rounded-xl gap-2 font-black uppercase tracking-widest text-[9px] h-10 px-4"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              {/* Page numbers */}
              <div className="hidden sm:flex gap-1.5">
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
                        "w-10 h-10 rounded-xl font-black text-[10px] transition-all duration-300",
                        pagination.page === pageNum
                          ? "bg-rose-500 border-rose-400 text-white shadow-lg shadow-rose-500/20"
                          : "bg-white border-rose-100 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300"
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
                className="bg-white border-rose-100 text-slate-500 hover:bg-rose-50 hover:border-rose-300 rounded-xl gap-2 font-black uppercase tracking-widest text-[9px] h-10 px-4"
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
        <DialogContent className="max-w-[95vw] 2xl:max-w-7xl p-0 gap-0 bg-white border-rose-100 text-slate-800 overflow-hidden h-[90vh] sm:h-[85vh] flex flex-col rounded-[2.5rem] shadow-2xl">
          {selectedFile && (
            <>
              {/* Modal Header */}
              <div className="flex-shrink-0 px-10 py-7 border-b border-rose-50 flex items-center justify-between bg-white relative">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.05),transparent)] pointer-events-none" />
                <div className="flex items-center gap-6 relative">
                  <div className={cn(
                    "flex flex-col items-center justify-center w-20 h-20 rounded-[2rem] border-2 bg-white shadow-xl shadow-rose-500/5",
                    getScoreColor(selectedFile.total_score)
                  )}>
                    <span className="text-2xl font-black">{selectedFile.total_score}</span>
                    <span className="text-[9px] uppercase font-black tracking-widest opacity-60">Rank</span>
                  </div>
                  <div>
                    <DialogTitle className="text-3xl font-black text-rose-950 leading-tight line-clamp-1 uppercase tracking-tighter">
                      {selectedFile.file_name}
                    </DialogTitle>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge className="uppercase font-black text-[9px] tracking-widest py-1.5 px-4 bg-rose-500 text-white border-0 rounded-full shadow-lg shadow-rose-500/10">
                        {selectedFile.paper_type?.replace(/_/g, ' ') || 'CLINICAL ASSET'}
                      </Badge>
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-200" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Ingested {format(new Date(selectedFile.created_at), 'MMMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Horizontal Split Layout */}
              <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 h-full">
                {/* LEFT COLUMN */}
                <div className="col-span-12 md:col-span-4 border-b md:border-b-0 md:border-r border-rose-50 bg-rose-50/10 h-full overflow-y-auto">
                  <div className="p-10 space-y-10">
                    {/* Stats */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-rose-950 uppercase tracking-[0.2em]">Clinical Metadata</h4>
                      <div className="p-6 bg-white rounded-[2rem] border border-rose-100/50 shadow-sm space-y-5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confidence</span>
                          <Badge className="bg-rose-50 text-rose-600 border border-rose-100 font-black uppercase tracking-widest text-[9px] rounded-full px-3">
                            {selectedFile.confidence}%
                          </Badge>
                        </div>
                        <Separator className="bg-rose-50" />
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Peer Reviews</span>
                          <span className="text-xs font-black text-rose-950">{selectedFile.comments?.length || 0}</span>
                        </div>
                        <Separator className="bg-rose-50" />
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Object ID</span>
                          <span className="text-[9px] font-black text-slate-300 tracking-tighter uppercase tabular-nums">#{String(selectedFile.id).substring(0, 12)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Keywords */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-rose-950 uppercase tracking-[0.2em]">Semantic Scope</h4>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(selectedFile.keywords) && selectedFile.keywords.length > 0 ? (
                          selectedFile.keywords.map((keyword) => (
                            <Badge
                              key={keyword}
                              variant="outline"
                              className="bg-white text-slate-500 border-rose-100 font-black uppercase tracking-widest text-[8px] py-1.5 px-4 rounded-full group hover:border-rose-400 hover:text-rose-600 transition-all"
                            >
                              {keyword}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">No Tags Detected</span>
                        )}
                      </div>
                    </div>

                    {/* Detailed Category Scores */}
                    {selectedFile.scores && selectedFile.scores.length > 0 && (
                      <div className="space-y-5">
                        <h4 className="text-[10px] font-black text-rose-950 uppercase tracking-[0.2em]">Factor Decomposition</h4>
                        <div className="space-y-4">
                          {selectedFile.scores.map((score, idx) => (
                            <div key={idx} className="bg-white p-5 rounded-2xl border border-rose-100/50 shadow-sm relative overflow-hidden group">
                              <div className="absolute top-0 left-0 w-1 h-full bg-rose-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-500" />
                              <div className="flex justify-between items-center mb-2.5">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                                  {score.category?.replace(/_/g, ' ')}
                                </span>
                                <span className="text-[10px] font-black text-rose-600 tabular-nums">
                                  {score.score}/{score.max_score}
                                </span>
                              </div>
                              <div className="w-full bg-rose-50 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-rose-500 h-full rounded-full transition-all duration-1000"
                                  style={{ width: `${(score.score / score.max_score) * 100}%` }}
                                />
                              </div>
                              {score.rationale && (
                                <p className="text-[9px] text-slate-400 mt-3 font-medium italic leading-relaxed">"{score.rationale}"</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="col-span-12 md:col-span-8 bg-white h-full overflow-y-auto">
                  <div className="p-12">
                    <div className="flex items-center gap-5 mb-10">
                      <div className="p-3 bg-rose-500 rounded-2xl text-white shadow-lg shadow-rose-500/20 rotate-3">
                        <MessageSquare className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-rose-950 uppercase tracking-tight">Clinical Review Notes</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Specialized Verification Analysis</p>
                      </div>
                    </div>

                    {(selectedFile.comments?.length || 0) > 0 ? (
                      <div className="grid gap-6">
                        {selectedFile.comments?.map((comment, idx) => (
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={comment.id}
                            className={cn(
                              "p-7 rounded-[2rem] border transition-all duration-500 group relative",
                              comment.is_penalty
                                ? "bg-rose-50/50 border-rose-100"
                                : "bg-emerald-50/20 border-emerald-100/50"
                            )}
                          >
                            <div className="flex gap-6">
                              <div className={cn(
                                "flex-shrink-0 mt-1.5 w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500",
                                comment.is_penalty ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"
                              )}>
                                {comment.is_penalty ? (
                                  <AlertCircle className="h-5 w-5" />
                                ) : (
                                  <Check className="h-5 w-5" />
                                )}
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                  <span className={cn(
                                    "text-[9px] font-black uppercase tracking-[0.2em]",
                                    comment.is_penalty ? "text-rose-600" : "text-emerald-600"
                                  )}>
                                    {comment.is_penalty ? "Clinical Friction Note" : "Verified Alignment"}
                                  </span>
                                  <span className="w-1 h-1 rounded-full bg-slate-200" />
                                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Review Segment #{idx + 1}</span>
                                </div>
                                <p className="text-slate-600 leading-relaxed text-sm font-medium">
                                  {comment.comment}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-20 text-center bg-rose-50/20 rounded-[3rem] border-2 border-dashed border-rose-100 flex flex-col items-center">
                        <div className="bg-white p-4 rounded-2xl shadow-xl shadow-rose-500/5 mb-4">
                          <ClipboardList className="h-8 w-8 text-rose-200" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No validation feedback currently archived</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 border-t border-rose-50 px-8 py-6 bg-white flex justify-end">
                <Button
                  onClick={() => setSelectedFile(null)}
                  variant="outline"
                  className="min-w-[140px] border-rose-100 bg-white text-slate-500 hover:bg-rose-50 font-black uppercase tracking-widest text-[10px] h-12 rounded-2xl"
                >
                  Dismiss Insight
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
