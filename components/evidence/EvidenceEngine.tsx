"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Root as Tabs,
  List as TabsList,
  Trigger as TabsTrigger,
  Content as TabsContent 
} from '@radix-ui/react-tabs';
import { 
  Root as Dialog,
  Trigger as DialogTrigger,
  Portal as DialogPortal,
  Overlay as DialogOverlay,
  Content as DialogContent,
  Title as DialogTitle,
  Close as DialogClose
} from '@radix-ui/react-dialog';
import { 
  Root as DropdownMenu,
  Trigger as DropdownMenuTrigger,
  Portal as DropdownMenuPortal,
  Content as DropdownMenuContent,
  Item as DropdownMenuItem
} from '@radix-ui/react-dropdown-menu';
import { Search as SearchIcon, Filter, X, ChevronDown, ChevronUp, FileText, MessageSquare, Star, AlertCircle } from 'lucide-react';
import { getFiles, searchEvidence, getCategories, getPaperTypes, type FileResponse, type SearchRequest } from '@/lib/api/evidence';

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
      
      const response = await getFiles(currentPage, currentPageSize);

      // Handle the response data
      if (response && response.items) {
        setFiles(response.items);
        
        setPagination(prev => ({
          ...prev,
          page: response.page || currentPage,
          page_size: response.page_size || currentPageSize,
          total: response.total || 0,
          total_pages: response.total_pages || Math.ceil((response.total || 0) / currentPageSize),
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
      // Ensure we always set an array, even if data is null/undefined
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
      page: 1, // Reset to first page when filters change
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

  // Add effect to fetch files when pagination changes
  useEffect(() => {
    fetchFiles();
    // We only want to run this effect when the page or page_size changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.page_size]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-teal-50 text-teal-800 border border-teal-200';
    if (score >= 60) return 'bg-blue-50 text-blue-800 border border-blue-200';
    return 'bg-blue-50 text-blue-800 border border-blue-200';
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-white to-teal-50 rounded-lg shadow-sm overflow-hidden border border-teal-100">
      {/* Header */}
      <div className="border-b border-teal-100 bg-gradient-to-r from-teal-600 to-blue-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-black">Evidence Engine</h2>
          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
              <input
                type="text"
                placeholder="Search evidence..."
                className="pl-10 pr-4 py-2 border border-teal-200 bg-white rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400 focus:outline-none transition-colors w-64 text-gray-900 placeholder-gray-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center space-x-2 px-4 py-2 border border-blue-400 bg-white/80 text-black rounded-lg hover:bg-white hover:border-blue-500 transition-colors">
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </button>
              </DialogTrigger>
              <DialogPortal>
                <DialogOverlay className="fixed inset-0 bg-black/50" />
                <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <DialogTitle className="text-lg font-medium text-black">Filters</DialogTitle>
                    <DialogClose className="text-blue-600 hover:text-blue-600">
                      <X className="h-5 w-5" />
                    </DialogClose>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Paper Types</label>
                      <div className="grid grid-cols-2 gap-3">
                        {isLoadingPaperTypes ? (
                          <div className="col-span-2 text-sm text-gray-600">Loading paper types...</div>
                        ) : paperTypes && paperTypes.length > 0 ? (
                          paperTypes.map((type) => (
                          <label key={type} className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
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
                            <span className="ml-2 text-sm text-gray-700 capitalize">{type?.replace(/_/g, ' ') || 'Unknown'}</span>
                          </label>
                        ))):
                         (
                          <div className="col-span-2 text-sm text-gray-600">No paper types available</div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Score</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                          value={filters.min_total_score || ''}
                          onChange={(e) => handleFilterChange('min_total_score', e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Score</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                          value={filters.max_total_score || ''}
                          onChange={(e) => handleFilterChange('max_total_score', e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                        placeholder="Enter keywords separated by commas"
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

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="px-4 py-2 text-sm font-medium text-teal-700 bg-white border border-teal-300 rounded-md hover:bg-teal-50 transition-colors"
                      >
                        Clear All
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          fetchFiles();
                          setIsFilterOpen(false);
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </DialogContent>
              </DialogPortal>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="flex border-b border-gray-200 px-6">
            <TabsTrigger
              value="all"
              className="px-4 py-3 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 hover:text-gray-700"
            >
              All Evidence
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto">
            <TabsContent value={activeTab} className="h-full">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : !files || files.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500 p-4 text-center">
                  <FileText className="h-12 w-12 mb-3 text-gray-300" />
                  <p className="text-lg font-medium text-gray-700 mb-1">No evidence found</p>
                  <p className="text-sm text-gray-500 max-w-md">
                    {searchQuery || Object.keys(filters).length > 2 
                      ? 'Try adjusting your search or filters' 
                      : 'No evidence has been added yet'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {files.map((file) => (
                    <div 
                      key={file.id} 
                      className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedFile(file)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {file.file_name}
                          </h3>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {file.paper_type && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {file.paper_type.replace(/_/g, ' ')}
                              </span>
                            )}
                            {Array.isArray(file.keywords) && file.keywords.length > 0 ? (
                              <>
                                {file.keywords.slice(0, 3).map((keyword, idx) => (
                                  <span 
                                    key={`${keyword}-${idx}`}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-800 hover:bg-teal-200 transition-colors"
                                    title={String(keyword)}
                                  >
                                    {keyword}
                                  </span>
                                ))}
                                {file.keywords.length > 3 && (
                                  <span 
                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors"
                                    title={file.keywords.slice(3).map(String).join(', ')}
                                  >
                                    +{file.keywords.length - 3} more
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-xs text-gray-400">No keywords</span>
                            )}
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <span>Uploaded {format(new Date(file.created_at), 'MMM d, yyyy')}</span>
                            <span className="mx-2">•</span>
                            <span>{file.comments.length} comments</span>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(file.total_score)}`}>
                            {file.total_score}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="border-t border-teal-100 px-6 py-4 bg-teal-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{(pagination.page - 1) * pagination.page_size + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(pagination.page * pagination.page_size, pagination.total)}
              </span>{' '}
              of <span className="font-medium">{pagination.total}</span> results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.total_pages}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Details Modal */}
      <Dialog open={!!selectedFile} onOpenChange={(open) => !open && setSelectedFile(null)}>
        <DialogPortal>
          <DialogOverlay className="fixed inset-0 bg-black/50" />
          <DialogContent className="fixed inset-0 sm:inset-[10vh] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden">
            {selectedFile && (
              <div className="flex flex-col h-full">
                {/* Fixed Header */}
                <div className="flex-shrink-0 px-6 py-4 border-b border-teal-100 flex items-center justify-between bg-white">
                  <DialogTitle className="text-lg font-medium text-black">{selectedFile.file_name}</DialogTitle>
                  <DialogClose className="text-blue-600 hover:text-blue-800">
                    <X className="h-5 w-5" />
                  </DialogClose>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="mb-6">
                    {/* Document Details */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Document Details</h3>
                        <p className="text-sm text-gray-500">
                          Uploaded on {format(new Date(selectedFile.created_at), 'MMMM d, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <span className="text-xs font-medium text-gray-500">Score</span>
                          <div
                            className={`text-lg font-bold ${getScoreColor(selectedFile.total_score)} px-3 py-1 rounded-full`}
                          >
                            {selectedFile.total_score}%
                          </div>
                        </div>
                        <div className="text-center">
                          <span className="text-xs font-medium text-gray-500">Confidence</span>
                          <div className="text-lg font-bold text-gray-700">{selectedFile.confidence}%</div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Paper Type</h4>
                        <p className="text-sm text-gray-900">
                          {selectedFile.paper_type ? selectedFile.paper_type.replace(/_/g, ' ') : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedFile.keywords.length > 0 ? (
                            selectedFile.keywords.map((keyword) => (
                              <span
                                key={keyword}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                {keyword}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">No keywords available</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedFile.comments.length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Reviewer Comments</h3>
                        <div className="space-y-4">
                          {selectedFile.comments.map((comment) => (
                            <div
                              key={comment.id}
                              className={`p-4 rounded-lg ${
                                comment.is_penalty
                                  ? 'bg-red-50 border-l-4 border-red-500'
                                  : 'bg-blue-50 border-l-4 border-blue-500'
                              }`}
                            >
                              <div className="flex">
                                <div className="flex-shrink-0">
                                  {comment.is_penalty ? (
                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                  ) : (
                                    <Star className="h-5 w-5 text-blue-500" />
                                  )}
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm text-gray-700">{comment.comment}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom section */}
                <div className="flex-shrink-0 border-t border-teal-100 px-6 py-4 bg-teal-50 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
            <style jsx global>{`
              /* Global styles for scrollbar */
              .overflow-y-auto {
                scrollbar-width: thin;
                scrollbar-color: #cbd5e0 #f7fafc;
                -webkit-overflow-scrolling: touch;
              }
              .overflow-y-auto::-webkit-scrollbar {
                width: 8px;
              }
              .overflow-y-auto::-webkit-scrollbar-track {
                background: #f7fafc;
              }
              .overflow-y-auto::-webkit-scrollbar-thumb {
                background-color: #cbd5e0;
                border-radius: 4px;
              }
              .overflow-y-auto::-webkit-scrollbar-thumb:hover {
                background-color: #a0aec0;
              }
              /* Ensure dialog content doesn't overflow on mobile */
              @media (max-width: 640px) {
                [data-radix-dialog-content] {
                  margin: 1rem;
                  width: calc(100% - 2rem) !important;
                  max-height: calc(100% - 2rem) !important;
                }
              }
            `}</style>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </div>
  );
}
