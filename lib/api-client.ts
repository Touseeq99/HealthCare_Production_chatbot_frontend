import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Create axios instance
const apiClient = axios.create({
    baseURL: '/api', // Proxies to backend via Next.js API routes
    timeout: 30000, // 30 seconds timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // We don't need to manually attach tokens here because we are using HttpOnly cookies
        // which are automatically sent with requests to the same domain (/api/...)
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
interface RetryQueueItem {
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
    config: InternalAxiosRequestConfig;
}

let isRefreshing = false;
let failedQueue: RetryQueueItem[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });

    failedQueue = [];
};

apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (!originalRequest) {
            return Promise.reject(error);
        }

        // Handle Network Timeout
        if (error.code === 'ECONNABORTED') {
            console.error('Request timed out');
            // You could trigger a toast here if you have a global toast handler
            return Promise.reject(new Error('Request timed out. Please try again.'));
        }

        // Handle 401 Unauthorized - Auto Refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            // 1. Don't refresh if we're already on an auth page or it's an auth request
            const isAuthRequest = originalRequest.url?.includes('/auth/');
            const isLoginPage = typeof window !== 'undefined' && window.location.pathname === '/login';

            if (isAuthRequest || isLoginPage) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject, config: originalRequest });
                })
                    .then(() => {
                        return apiClient(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Call the Next.js API route to refresh the HttpOnly cookie
                await axios.post('/api/auth/refresh');

                processQueue(null);
                isRefreshing = false;

                return apiClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;

                // Refresh failed - clear everything and redirect to login
                if (typeof window !== 'undefined') {
                    // Clear all client-side auth state
                    localStorage.clear();
                    sessionStorage.clear();

                    // Clear cookies server-side
                    try {
                        import('axios').then(ax => ax.default.post('/api/auth/logout')).catch(() => { });
                    } catch (e) { }

                    window.location.href = '/login?error=session_expired';
                }
                return Promise.reject(refreshError);
            }
        }

        // Handle 429 Rate Limited - Basic Exponential Backoff
        if (error.response?.status === 429) {
            // Logic could be added here to wait and retry
            // For now, simpler to just reject with a specific message
            console.warn('Rate limited');
        }

        return Promise.reject(error);
    }
);

export default apiClient;
