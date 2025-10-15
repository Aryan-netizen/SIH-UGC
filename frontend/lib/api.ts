import {
  UGCCriteria,
  CollegeApplication,
  EvaluateRequest,
  BatchEvaluateRequest,
  StatusUpdateRequest
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new APIError(response.status, errorData.message || 'Request failed');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new Error('Network error or server unavailable');
  }
}

export const criteriaAPI = {
  getAll: () => fetchAPI<UGCCriteria[]>('/criteria'),

  getById: (id: string) => fetchAPI<UGCCriteria>(`/criteria/${id}`),

  create: (data: Omit<UGCCriteria, '_id' | 'createdAt' | 'updatedAt'>) =>
    fetchAPI<UGCCriteria>('/criteria', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const applicationsAPI = {
  getAll: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return fetchAPI<CollegeApplication[]>(`/applications${query}`);
  },

  getById: (id: string) => fetchAPI<CollegeApplication>(`/applications/${id}`),

  create: (data: Omit<CollegeApplication, '_id' | 'status' | 'createdAt' | 'updatedAt'>) =>
    fetchAPI<CollegeApplication>('/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, data: StatusUpdateRequest) =>
    fetchAPI<CollegeApplication>(`/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

export const evaluationAPI = {
  evaluateSingle: (data: EvaluateRequest) =>
    fetchAPI<CollegeApplication>('/evaluate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  evaluateBatch: (data: BatchEvaluateRequest) =>
    fetchAPI<{ evaluated: number; results: CollegeApplication[] }>('/evaluate-batch', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export { APIError };
