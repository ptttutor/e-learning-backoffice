/**
 * API Utility - Centralized fetch wrapper with authentication error handling
 * Automatically redirects to login page when receiving 401 Unauthorized
 */

/**
 * Enhanced fetch wrapper that handles authentication errors
 * @param {string} url - API endpoint URL
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<Response>}
 */
export async function apiFetch(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Check for 401 Unauthorized
    if (response.status === 401) {
      console.log('🔴 [API] 401 Unauthorized - Redirecting to login');
      
      // Get current path for redirect after login
      const currentPath = window.location.pathname + window.location.search;
      const redirectUrl = currentPath !== '/login' 
        ? `/login?redirect=${encodeURIComponent(currentPath)}`
        : '/login';
      
      // Clear any stored auth data
      try {
        localStorage.removeItem('user');
      } catch {}
      
      // Redirect to login
      window.location.href = redirectUrl;
      
      // Throw error to prevent further processing
      throw new Error('Unauthorized - Redirecting to login');
    }

    return response;
  } catch (error) {
    // Re-throw for caller to handle
    throw error;
  }
}

/**
 * API GET request with auth error handling
 * @param {string} url - API endpoint URL
 * @returns {Promise<any>} - Parsed JSON response
 */
export async function apiGet(url) {
  const response = await apiFetch(url, { method: 'GET' });
  return response.json();
}

/**
 * API POST request with auth error handling
 * @param {string} url - API endpoint URL
 * @param {any} data - Request body data
 * @returns {Promise<any>} - Parsed JSON response
 */
export async function apiPost(url, data) {
  const response = await apiFetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * API PUT request with auth error handling
 * @param {string} url - API endpoint URL
 * @param {any} data - Request body data
 * @returns {Promise<any>} - Parsed JSON response
 */
export async function apiPut(url, data) {
  const response = await apiFetch(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * API DELETE request with auth error handling
 * @param {string} url - API endpoint URL
 * @returns {Promise<any>} - Parsed JSON response
 */
export async function apiDelete(url) {
  const response = await apiFetch(url, { method: 'DELETE' });
  return response.json();
}

/**
 * API PATCH request with auth error handling
 * @param {string} url - API endpoint URL
 * @param {any} data - Request body data
 * @returns {Promise<any>} - Parsed JSON response
 */
export async function apiPatch(url, data) {
  const response = await apiFetch(url, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * API request for file upload with auth error handling
 * @param {string} url - API endpoint URL
 * @param {FormData} formData - Form data with files
 * @returns {Promise<any>} - Parsed JSON response
 */
export async function apiUpload(url, formData) {
  const response = await apiFetch(url, {
    method: 'POST',
    body: formData,
    // Don't set Content-Type for FormData - browser will set it with boundary
    headers: {},
  });
  return response.json();
}
