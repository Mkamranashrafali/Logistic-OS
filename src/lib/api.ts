export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL as string;
if (!API_BASE_URL) {
  console.warn("NEXT_PUBLIC_API_URL is missing! Requests will likely fail.");
}

export class ApiError extends Error {
  public status: number;
  public data: any;
  
  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const isAuthRoute = currentPath === '/' ||
                          currentPath.startsWith('/login') || 
                          currentPath.startsWith('/signup') || 
                          currentPath.startsWith('/forgot-password') ||
                          currentPath.startsWith('/reset-password');
                          
      if (!isAuthRoute) {
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
  }

  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    if (typeof data?.detail === 'string') {
      errorMessage = data.detail;
    } else if (Array.isArray(data?.detail)) {
      errorMessage = data.detail.map((err: any) => `${err.loc?.slice(-1)?.[0] || 'Field'}: ${err.msg}`).join(', ');
    } else if (data?.message) {
      errorMessage = data.message;
    }
    
    throw new ApiError(response.status, errorMessage, data);
  }

  return data?.data !== undefined ? data.data : data;
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T = any>(endpoint: string, body: any, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: <T = any>(endpoint: string, body: any, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  patch: <T = any>(endpoint: string, body: any, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T = any>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'DELETE' }),
};
