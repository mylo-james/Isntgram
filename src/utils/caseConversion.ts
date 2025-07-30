/**
 * Utility functions for converting between snake_case and camelCase
 * Used to handle API responses from Python backend (snake_case) to JavaScript frontend (camelCase)
 */

/**
 * Convert snake_case string to camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert camelCase string to snake_case
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Recursively convert all object keys from snake_case to camelCase
 */
export function convertKeysToCamel(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(convertKeysToCamel);
  }

  if (typeof obj === 'object' && obj !== null && obj.constructor === Object) {
    const converted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = snakeToCamel(key);
      converted[camelKey] = convertKeysToCamel(value);
    }
    return converted;
  }

  return obj;
}

/**
 * Recursively convert all object keys from camelCase to snake_case
 */
export function convertKeysToSnake(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(convertKeysToSnake);
  }

  if (typeof obj === 'object' && obj !== null && obj.constructor === Object) {
    const converted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = camelToSnake(key);
      converted[snakeKey] = convertKeysToSnake(value);
    }
    return converted;
  }

  return obj;
}
