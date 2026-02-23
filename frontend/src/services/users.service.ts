import { api } from '@/services/api';

export interface ApiKeysStatus {
  has_gemini_key: boolean;
  has_groq_key: boolean;
  has_serpapi_key: boolean;
  message: string;
}

export interface UserSettings {
  id: string;
  access_code: string;
  api_keys: ApiKeysStatus;
}

export interface UpdateApiKeysRequest {
  gemini_key?: string;
  groq_key?: string;
  serpapi_key?: string;
}

// Local storage keys for demo mode (when no database)
const LOCAL_GEMINI_KEY = 'user_gemini_api_key';
const LOCAL_GROQ_KEY = 'user_groq_api_key';
const LOCAL_SERPAPI_KEY = 'user_serpapi_api_key';

export const usersService = {
  /**
   * Get current user settings
   */
  async getSettings(): Promise<UserSettings> {
    const response = await api.get<UserSettings>('/users/me/settings');
    return response.data;
  },

  /**
   * Get API keys status (without revealing actual keys)
   * Falls back to localStorage in demo mode
   */
  async getApiKeysStatus(): Promise<ApiKeysStatus> {
    try {
      // Try server first
      const response = await api.get<ApiKeysStatus>('/users/me/api-keys');
      return response.data;
    } catch (error) {
      // Fallback to localStorage for demo mode
      const gemini = localStorage.getItem(LOCAL_GEMINI_KEY);
      const groq = localStorage.getItem(LOCAL_GROQ_KEY);
      const serpapi = localStorage.getItem(LOCAL_SERPAPI_KEY);
      
      return {
        has_gemini_key: !!gemini,
        has_groq_key: !!groq,
        has_serpapi_key: !!serpapi,
        message: 'Using locally stored API keys (demo mode)',
      };
    }
  },

  /**
   * Update user's API keys
   * Set a key to empty string "" to remove it
   * Falls back to localStorage in demo mode
   */
  async updateApiKeys(data: UpdateApiKeysRequest): Promise<ApiKeysStatus> {
    try {
      // Try server first
      const response = await api.put<ApiKeysStatus>('/users/me/api-keys', data);
      return response.data;
    } catch (error) {
      // Fallback to localStorage for demo mode
      if (data.gemini_key !== undefined) {
        if (data.gemini_key === '') {
          localStorage.removeItem(LOCAL_GEMINI_KEY);
        } else {
          localStorage.setItem(LOCAL_GEMINI_KEY, data.gemini_key);
        }
      }
      
      if (data.groq_key !== undefined) {
        if (data.groq_key === '') {
          localStorage.removeItem(LOCAL_GROQ_KEY);
        } else {
          localStorage.setItem(LOCAL_GROQ_KEY, data.groq_key);
        }
      }
      
      if (data.serpapi_key !== undefined) {
        if (data.serpapi_key === '') {
          localStorage.removeItem(LOCAL_SERPAPI_KEY);
        } else {
          localStorage.setItem(LOCAL_SERPAPI_KEY, data.serpapi_key);
        }
      }
      
      return this.getApiKeysStatus();
    }
  },

  /**
   * Delete all API keys
   */
  async deleteAllApiKeys(): Promise<ApiKeysStatus> {
    try {
      const response = await api.delete<ApiKeysStatus>('/users/me/api-keys');
      return response.data;
    } catch (error) {
      // Fallback to localStorage for demo mode
      localStorage.removeItem(LOCAL_GEMINI_KEY);
      localStorage.removeItem(LOCAL_GROQ_KEY);
      localStorage.removeItem(LOCAL_SERPAPI_KEY);
      
      return {
        has_gemini_key: false,
        has_groq_key: false,
        has_serpapi_key: false,
        message: 'All keys deleted from local storage',
      };
    }
  },

  /**
   * Get user's API keys for sending in headers (internal use)
   */
  getStoredApiKeys(): { gemini?: string; groq?: string; serpapi?: string } {
    return {
      gemini: localStorage.getItem(LOCAL_GEMINI_KEY) || undefined,
      groq: localStorage.getItem(LOCAL_GROQ_KEY) || undefined,
      serpapi: localStorage.getItem(LOCAL_SERPAPI_KEY) || undefined,
    };
  },
};
