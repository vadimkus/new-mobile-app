import { createLogger } from '../utils/logger';
import { getToken } from './secureTokenStorage';
import AUTH_CONFIG from '../config/auth';

const log = createLogger('authFetch');

export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {},
  tokenOverride?: string | null,
): Promise<Response> => {
  const token = tokenOverride ?? (await getToken());

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'x-api-key': AUTH_CONFIG.API_KEY,
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      log.warn('Received 401 — token may be expired');
    }

    return response;
  } catch (error: any) {
    log.error('Network request failed', error?.message);
    throw error;
  }
};

export default authenticatedFetch;
