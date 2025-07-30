import { convertKeysToCamel, convertKeysToSnake } from './caseConversion';

/**
 * Enhanced fetch wrapper that automatically converts:
 * - Request body keys from camelCase to snake_case
 * - Response body keys from snake_case to camelCase
 */
export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const config = { ...options };

  // Convert request body keys to snake_case if JSON content
  if (config.body && config.headers) {
    const contentType =
      typeof config.headers === 'object' && 'content-type' in config.headers
        ? (config.headers as Record<string, string>)['content-type']
        : undefined;

    if (contentType?.includes('application/json')) {
      try {
        const jsonBody = JSON.parse(config.body as string);
        config.body = JSON.stringify(convertKeysToSnake(jsonBody));
      } catch {
        // If JSON parsing fails, leave body unchanged
      }
    }
  }

  // Make the API call
  const response = await fetch(url, config);

  // Create a new response with converted JSON
  if (response.headers.get('content-type')?.includes('application/json')) {
    const originalJson = await response.json();
    const convertedJson = convertKeysToCamel(originalJson);

    // Create new response with converted data
    return new Response(JSON.stringify(convertedJson), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  }

  return response;
}

/**
 * Convenience method that calls apiFetch and returns the converted JSON directly
 */
export async function apiCall(
  url: string,
  options: RequestInit = {}
): Promise<unknown> {
  const response = await apiFetch(url, options);

  if (!response.ok) {
    throw new Error(
      `API call failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}
