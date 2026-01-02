import axios from 'axios';

const API_BASE_URL = '/api/proxy/evidence';

// Get paginated files
export const getFiles = async (page = 1, pageSize = 10) => {
  const response = await axios.get(`${API_BASE_URL}/files`, {
    params: { page, page_size: pageSize },
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

// Search evidence
export const searchEvidence = async (filters: SearchRequest) => {
  const response = await axios.post(`${API_BASE_URL}/search`, filters, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

// Get available categories
export const getCategories = async () => {
  const response = await axios.get(`${API_BASE_URL}/categories`, {
    headers: {
    }
  });
  return response.data.categories;
};

// Get available paper types
export const getPaperTypes = async () => {
  const response = await axios.get(`${API_BASE_URL}/paper-types`, {
    headers: {
    }
  });
  return response.data.paper_types;
};

// Types
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
  page?: number;
  page_size?: number;
}

export interface Comment {
  id: number;
  comment: string;
  is_penalty: boolean;
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
}

export interface PaginatedFilesResponse {
  items: FileResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
