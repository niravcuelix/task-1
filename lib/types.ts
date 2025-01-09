export interface Review {
  id: number;
  organization: string;
  phone: string;
  rating: number;
  totalReview: number;
  category: string;
  country: string;
  state: string;
  city: string;
  street: string;
}

export interface SearchParams {
  query: string;
  page: number;
  limit: number;
}

export interface SearchResponse {
  items: Review[];
  total: number;
  hasMore: boolean;
  error?: string;
}