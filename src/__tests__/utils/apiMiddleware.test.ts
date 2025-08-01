import { apiFetch, apiCall } from '../../utils/apiMiddleware';

// Mock fetch globally
global.fetch = jest.fn();

// Mock the case conversion utilities
jest.mock('../../utils/caseConversion', () => ({
  convertKeysToCamel: jest.fn((data) => data),
  convertKeysToSnake: jest.fn((data) => data),
}));

const {
  convertKeysToCamel,
  convertKeysToSnake,
} = require('../../utils/caseConversion');

describe('API Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('apiFetch', () => {
    it('makes a basic fetch request without conversion', async () => {
      const mockResponse = new Response('{"test": "data"}', {
        status: 200,
        headers: { 'content-type': 'text/plain' },
      });
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await apiFetch('/api/test');

      expect(global.fetch).toHaveBeenCalledWith('/api/test', {});
      expect(result).toBe(mockResponse);
    });

    it('converts request body from camelCase to snake_case for JSON requests', async () => {
      const mockResponse = new Response('{"test": "data"}', {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const requestBody = { userName: 'test', profileImageUrl: 'url' };
      const convertedBody = { user_name: 'test', profile_image_url: 'url' };
      (convertKeysToSnake as jest.Mock).mockReturnValue(convertedBody);

      await apiFetch('/api/test', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      expect(convertKeysToSnake).toHaveBeenCalledWith(requestBody);
      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(convertedBody),
      });
    });

    it('handles JSON parsing errors gracefully', async () => {
      const mockResponse = new Response('{"test": "data"}', {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await apiFetch('/api/test', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: 'invalid json',
      });

      expect(convertKeysToSnake).not.toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: 'invalid json',
      });
    });

    it('converts response body from snake_case to camelCase for JSON responses', async () => {
      const responseData = { user_name: 'test', profile_image_url: 'url' };
      const convertedData = { userName: 'test', profileImageUrl: 'url' };
      const mockResponse = new Response(JSON.stringify(responseData), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      (convertKeysToCamel as jest.Mock).mockReturnValue(convertedData);

      const result = await apiFetch('/api/test');

      expect(convertKeysToCamel).toHaveBeenCalledWith(responseData);
      expect(result).toBeInstanceOf(Response);
      expect(await result.json()).toEqual(convertedData);
    });

    it('handles non-JSON responses without conversion', async () => {
      const mockResponse = new Response('plain text response', {
        status: 200,
        headers: { 'content-type': 'text/plain' },
      });
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await apiFetch('/api/test');

      expect(convertKeysToCamel).not.toHaveBeenCalled();
      expect(result).toBe(mockResponse);
    });

    it('handles responses without content-type header', async () => {
      const mockResponse = new Response('{"test": "data"}', {
        status: 200,
      });
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await apiFetch('/api/test');

      expect(convertKeysToCamel).not.toHaveBeenCalled();
      expect(result).toBe(mockResponse);
    });

    it('handles request headers as Headers object', async () => {
      const mockResponse = new Response('{"test": "data"}', {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const headers = new Headers();
      headers.set('content-type', 'application/json');

      await apiFetch('/api/test', {
        method: 'POST',
        headers,
        body: JSON.stringify({ userName: 'test' }),
      });

      expect(convertKeysToSnake).toHaveBeenCalled();
    });

    it('handles request headers as array', async () => {
      const mockResponse = new Response('{"test": "data"}', {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await apiFetch('/api/test', {
        method: 'POST',
        headers: [['content-type', 'application/json']],
        body: JSON.stringify({ userName: 'test' }),
      });

      expect(convertKeysToSnake).toHaveBeenCalled();
    });

    it('handles request headers as string', async () => {
      const mockResponse = new Response('{"test": "data"}', {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await apiFetch('/api/test', {
        method: 'POST',
        headers: 'content-type: application/json',
        body: JSON.stringify({ userName: 'test' }),
      });

      expect(convertKeysToSnake).toHaveBeenCalled();
    });

    it('handles non-JSON content types', async () => {
      const mockResponse = new Response('{"test": "data"}', {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await apiFetch('/api/test', {
        method: 'POST',
        headers: { 'content-type': 'text/plain' },
        body: JSON.stringify({ userName: 'test' }),
      });

      expect(convertKeysToSnake).not.toHaveBeenCalled();
    });

    it('handles missing content-type in headers', async () => {
      const mockResponse = new Response('{"test": "data"}', {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await apiFetch('/api/test', {
        method: 'POST',
        headers: { authorization: 'Bearer token' },
        body: JSON.stringify({ userName: 'test' }),
      });

      expect(convertKeysToSnake).not.toHaveBeenCalled();
    });

    it('handles null body', async () => {
      const mockResponse = new Response('{"test": "data"}', {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await apiFetch('/api/test', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: null,
      });

      expect(convertKeysToSnake).not.toHaveBeenCalled();
    });

    it('handles undefined body', async () => {
      const mockResponse = new Response('{"test": "data"}', {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await apiFetch('/api/test', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: undefined,
      });

      expect(convertKeysToSnake).not.toHaveBeenCalled();
    });

    it('handles FormData body without conversion', async () => {
      const mockResponse = new Response('{"test": "data"}', {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const formData = new FormData();
      formData.append('file', new Blob(['test']));

      await apiFetch('/api/test', {
        method: 'POST',
        body: formData,
      });

      expect(convertKeysToSnake).not.toHaveBeenCalled();
    });

    it('preserves response status and headers', async () => {
      const responseData = { user_name: 'test' };
      const convertedData = { userName: 'test' };
      const mockResponse = new Response(JSON.stringify(responseData), {
        status: 404,
        statusText: 'Not Found',
        headers: { 'content-type': 'application/json', 'x-custom': 'value' },
      });
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      (convertKeysToCamel as jest.Mock).mockReturnValue(convertedData);

      const result = await apiFetch('/api/test');

      expect(result.status).toBe(404);
      expect(result.statusText).toBe('Not Found');
      expect(result.headers.get('content-type')).toBe('application/json');
      expect(result.headers.get('x-custom')).toBe('value');
    });
  });

  describe('apiCall', () => {
    it('returns converted JSON data for successful requests', async () => {
      const responseData = { user_name: 'test' };
      const convertedData = { userName: 'test' };
      const mockResponse = new Response(JSON.stringify(responseData), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      (convertKeysToCamel as jest.Mock).mockReturnValue(convertedData);

      const result = await apiCall('/api/test');

      expect(result).toEqual(convertedData);
    });

    it('throws error for failed requests', async () => {
      const mockResponse = new Response('{"error": "Not found"}', {
        status: 404,
        statusText: 'Not Found',
      });
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(apiCall('/api/test')).rejects.toThrow(
        'API call failed: 404 Not Found'
      );
    });

    it('throws error for network failures', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(apiCall('/api/test')).rejects.toThrow('Network error');
    });

    it('handles non-JSON responses', async () => {
      const mockResponse = new Response('plain text', {
        status: 200,
        headers: { 'content-type': 'text/plain' },
      });
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await apiCall('/api/test');

      expect(result).toBe('plain text');
    });

    it('passes through request options', async () => {
      const responseData = { user_name: 'test' };
      const convertedData = { userName: 'test' };
      const mockResponse = new Response(JSON.stringify(responseData), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      (convertKeysToCamel as jest.Mock).mockReturnValue(convertedData);

      const options = {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ userName: 'test' }),
      };

      await apiCall('/api/test', options);

      expect(global.fetch).toHaveBeenCalledWith('/api/test', options);
    });

    it('handles empty response body', async () => {
      const mockResponse = new Response('', {
        status: 204,
        headers: { 'content-type': 'application/json' },
      });
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await apiCall('/api/test');

      expect(result).toBe('');
    });

    it('handles null response body', async () => {
      const mockResponse = new Response(null, {
        status: 204,
        headers: { 'content-type': 'application/json' },
      });
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await apiCall('/api/test');

      expect(result).toBe(null);
    });
  });

  describe('Integration Tests', () => {
    it('handles complete request-response cycle with conversion', async () => {
      const requestBody = { userName: 'test', profileImageUrl: 'url' };
      const convertedRequestBody = {
        user_name: 'test',
        profile_image_url: 'url',
      };
      const responseData = {
        user_name: 'response',
        profile_image_url: 'response_url',
      };
      const convertedResponseData = {
        userName: 'response',
        profileImageUrl: 'response_url',
      };

      const mockResponse = new Response(JSON.stringify(responseData), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      (convertKeysToSnake as jest.Mock).mockReturnValue(convertedRequestBody);
      (convertKeysToCamel as jest.Mock).mockReturnValue(convertedResponseData);

      const result = await apiCall('/api/test', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      expect(convertKeysToSnake).toHaveBeenCalledWith(requestBody);
      expect(convertKeysToCamel).toHaveBeenCalledWith(responseData);
      expect(result).toEqual(convertedResponseData);
    });

    it('handles error responses with conversion', async () => {
      const errorData = { error_message: 'Something went wrong' };
      const convertedErrorData = { errorMessage: 'Something went wrong' };
      const mockResponse = new Response(JSON.stringify(errorData), {
        status: 400,
        statusText: 'Bad Request',
        headers: { 'content-type': 'application/json' },
      });
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      (convertKeysToCamel as jest.Mock).mockReturnValue(convertedErrorData);

      await expect(apiCall('/api/test')).rejects.toThrow(
        'API call failed: 400 Bad Request'
      );
    });
  });
});
