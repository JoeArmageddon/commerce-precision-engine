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
   */
  async getApiKeysStatus(): Promise<ApiKeysStatus> {
    const response = await api.get<ApiKeysStatus>('/users/me/api-keys');
    return response.data;
  },

  /**
   * Update user's API keys
   * Set a key to empty string "" to remove it
   */
  async updateApiKeys(data: UpdateApiKeysRequest): Promise<ApiKeysStatus> {
    const response = await api.put<ApiKeysStatus>('/users/me/api-keys', data);
    return response.data;
  },

  /**
   * Delete all API keys
   */
  async deleteAllApiKeys(): Promise<ApiKeysStatus> {
    const response = await api.delete<ApiKeysStatus>('/users/me/api-keys');
    return response.data;
  },
};
