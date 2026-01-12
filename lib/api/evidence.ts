import axios from 'axios';

const API_BASE_URL = '/api/proxy/evidence';

// Create axios instance with interceptor
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Get paginated files
export const getFiles = async (page = 1, pageSize = 10) => {
  const response = await api.get('/files', {
    params: { page, page_size: pageSize }
  });
  return response.data;
};

// Search evidence
export const searchEvidence = async (filters: SearchRequest) => {
  const response = await api.post('/search', filters);
  return response.data;
};

// Get available categories
export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data.categories;
};

// Get available paper types
export const getPaperTypes = async () => {
  const response = await api.get('/paper-types');
  return response.data.paper_types;
};

// Global cache for initial data to prevent re-fetching on tab switch
let cachedInitialData: {
  files: FileResponse[] | null;
  categories: string[] | null;
  paperTypes: string[] | null;
  pagination: any | null;
  hasLoaded: boolean;
} = {
  files: null,
  categories: null,
  paperTypes: null,
  pagination: null,
  hasLoaded: false,
};

export const getEvidenceCache = () => cachedInitialData;
export const updateEvidenceCache = (data: Partial<typeof cachedInitialData>) => {
  cachedInitialData = { ...cachedInitialData, ...data };
};

// Types
export interface CategoryScoreRange {
  min?: number;
  max?: number;
}

export interface SearchRequest {
  paper_types?: string[];
  start_date?: string;
  end_date?: string;
  file_name?: string;
  min_total_score?: number;
  max_total_score?: number;
  min_confidence?: number;
  max_confidence?: number;
  keywords?: string[];
  search_text?: string;
  min_keywords?: number;
  has_comments?: boolean;
  category_scores?: Record<string, CategoryScoreRange>;
  page?: number;
  page_size?: number;
  limit?: number;
  skip?: number;
}

export interface Comment {
  id: number;
  comment: string;
  is_penalty: boolean;
}

export interface ScoreBreakdown {
  category: string;
  score: number;
  rationale: string;
  max_score: number;
}

export interface FileResponse {
  id: number;
  file_name: string;
  paper_type: string | null;
  total_score: number;
  confidence: number;
  created_at: string;
  updated_at: string;
  keywords: string[];
  comments: Comment[];
  scores: ScoreBreakdown[];
}

export interface PaginatedFilesResponse {
  items: FileResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
