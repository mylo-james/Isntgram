import {
  snakeToCamel,
  camelToSnake,
  convertKeysToCamel,
  convertKeysToSnake,
} from '../../utils/caseConversion';

describe('Case Conversion Utilities', () => {
  describe('snakeToCamel', () => {
    it('converts simple snake_case to camelCase', () => {
      expect(snakeToCamel('user_name')).toBe('userName');
      expect(snakeToCamel('first_name')).toBe('firstName');
      expect(snakeToCamel('last_name')).toBe('lastName');
    });

    it('converts multiple underscores', () => {
      expect(snakeToCamel('user_profile_image_url')).toBe(
        'userProfileImageUrl'
      );
      expect(snakeToCamel('api_response_data')).toBe('apiResponseData');
    });

    it('handles single word without underscores', () => {
      expect(snakeToCamel('user')).toBe('user');
      expect(snakeToCamel('name')).toBe('name');
    });

    it('handles empty string', () => {
      expect(snakeToCamel('')).toBe('');
    });

    it('handles strings with numbers', () => {
      expect(snakeToCamel('user_id_123')).toBe('userId123');
      expect(snakeToCamel('api_v2_response')).toBe('apiV2Response');
    });

    it('handles strings with special characters', () => {
      expect(snakeToCamel('user_name_with_special_chars')).toBe(
        'userNameWithSpecialChars'
      );
    });

    it('handles strings starting with underscore', () => {
      expect(snakeToCamel('_user_name')).toBe('_userName');
    });

    it('handles strings ending with underscore', () => {
      expect(snakeToCamel('user_name_')).toBe('userName_');
    });

    it('handles consecutive underscores', () => {
      expect(snakeToCamel('user__name')).toBe('user__name');
    });
  });

  describe('camelToSnake', () => {
    it('converts simple camelCase to snake_case', () => {
      expect(camelToSnake('userName')).toBe('user_name');
      expect(camelToSnake('firstName')).toBe('first_name');
      expect(camelToSnake('lastName')).toBe('last_name');
    });

    it('converts multiple camelCase words', () => {
      expect(camelToSnake('userProfileImageUrl')).toBe(
        'user_profile_image_url'
      );
      expect(camelToSnake('apiResponseData')).toBe('api_response_data');
    });

    it('handles single word without capitals', () => {
      expect(camelToSnake('user')).toBe('user');
      expect(camelToSnake('name')).toBe('name');
    });

    it('handles empty string', () => {
      expect(camelToSnake('')).toBe('');
    });

    it('handles strings with numbers', () => {
      expect(camelToSnake('userId123')).toBe('user_id_123');
      expect(camelToSnake('apiV2Response')).toBe('api_v2_response');
    });

    it('handles strings with special characters', () => {
      expect(camelToSnake('userNameWithSpecialChars')).toBe(
        'user_name_with_special_chars'
      );
    });

    it('handles strings starting with capital', () => {
      expect(camelToSnake('UserName')).toBe('_user_name');
    });

    it('handles consecutive capitals', () => {
      expect(camelToSnake('APIResponse')).toBe('a_p_i_response');
    });

    it('handles acronyms', () => {
      expect(camelToSnake('JSONData')).toBe('j_s_o_n_data');
      expect(camelToSnake('XMLParser')).toBe('x_m_l_parser');
    });
  });

  describe('convertKeysToCamel', () => {
    it('converts simple object keys', () => {
      const input = {
        user_name: 'John',
        first_name: 'John',
        last_name: 'Doe',
      };
      const expected = {
        userName: 'John',
        firstName: 'John',
        lastName: 'Doe',
      };
      expect(convertKeysToCamel(input)).toEqual(expected);
    });

    it('converts nested object keys', () => {
      const input = {
        user_profile: {
          profile_image_url: 'https://example.com/image.jpg',
          bio_text: 'Hello world',
        },
        api_response: {
          response_data: {
            user_id: 123,
          },
        },
      };
      const expected = {
        userProfile: {
          profileImageUrl: 'https://example.com/image.jpg',
          bioText: 'Hello world',
        },
        apiResponse: {
          responseData: {
            userId: 123,
          },
        },
      };
      expect(convertKeysToCamel(input)).toEqual(expected);
    });

    it('converts array elements', () => {
      const input = [
        { user_name: 'John', first_name: 'John' },
        { user_name: 'Jane', first_name: 'Jane' },
      ];
      const expected = [
        { userName: 'John', firstName: 'John' },
        { userName: 'Jane', firstName: 'Jane' },
      ];
      expect(convertKeysToCamel(input)).toEqual(expected);
    });

    it('handles null values', () => {
      expect(convertKeysToCamel(null)).toBe(null);
    });

    it('handles undefined values', () => {
      expect(convertKeysToCamel(undefined)).toBe(undefined);
    });

    it('handles primitive values', () => {
      expect(convertKeysToCamel('string')).toBe('string');
      expect(convertKeysToCamel(123)).toBe(123);
      expect(convertKeysToCamel(true)).toBe(true);
      expect(convertKeysToCamel(false)).toBe(false);
    });

    it('handles empty object', () => {
      expect(convertKeysToCamel({})).toEqual({});
    });

    it('handles empty array', () => {
      expect(convertKeysToCamel([])).toEqual([]);
    });

    it('handles mixed data types', () => {
      const input = {
        user_data: {
          profile_info: {
            name: 'John',
            age: 30,
            is_active: true,
            hobbies: ['reading', 'gaming'],
            metadata: null,
          },
          settings: {
            notifications_enabled: false,
            theme_preference: 'dark',
          },
        },
        posts: [
          { post_id: 1, caption_text: 'Hello' },
          { post_id: 2, caption_text: 'World' },
        ],
      };
      const expected = {
        userData: {
          profileInfo: {
            name: 'John',
            age: 30,
            isActive: true,
            hobbies: ['reading', 'gaming'],
            metadata: null,
          },
          settings: {
            notificationsEnabled: false,
            themePreference: 'dark',
          },
        },
        posts: [
          { postId: 1, captionText: 'Hello' },
          { postId: 2, captionText: 'World' },
        ],
      };
      expect(convertKeysToCamel(input)).toEqual(expected);
    });

    it('handles non-object constructors', () => {
      const date = new Date();
      const regex = /test/;
      const set = new Set([1, 2, 3]);
      const map = new Map([['key', 'value']]);

      expect(convertKeysToCamel(date)).toBe(date);
      expect(convertKeysToCamel(regex)).toBe(regex);
      expect(convertKeysToCamel(set)).toBe(set);
      expect(convertKeysToCamel(map)).toBe(map);
    });
  });

  describe('convertKeysToSnake', () => {
    it('converts simple object keys', () => {
      const input = {
        userName: 'John',
        firstName: 'John',
        lastName: 'Doe',
      };
      const expected = {
        user_name: 'John',
        first_name: 'John',
        last_name: 'Doe',
      };
      expect(convertKeysToSnake(input)).toEqual(expected);
    });

    it('converts nested object keys', () => {
      const input = {
        userProfile: {
          profileImageUrl: 'https://example.com/image.jpg',
          bioText: 'Hello world',
        },
        apiResponse: {
          responseData: {
            userId: 123,
          },
        },
      };
      const expected = {
        user_profile: {
          profile_image_url: 'https://example.com/image.jpg',
          bio_text: 'Hello world',
        },
        api_response: {
          response_data: {
            user_id: 123,
          },
        },
      };
      expect(convertKeysToSnake(input)).toEqual(expected);
    });

    it('converts array elements', () => {
      const input = [
        { userName: 'John', firstName: 'John' },
        { userName: 'Jane', firstName: 'Jane' },
      ];
      const expected = [
        { user_name: 'John', first_name: 'John' },
        { user_name: 'Jane', first_name: 'Jane' },
      ];
      expect(convertKeysToSnake(input)).toEqual(expected);
    });

    it('handles null values', () => {
      expect(convertKeysToSnake(null)).toBe(null);
    });

    it('handles undefined values', () => {
      expect(convertKeysToSnake(undefined)).toBe(undefined);
    });

    it('handles primitive values', () => {
      expect(convertKeysToSnake('string')).toBe('string');
      expect(convertKeysToSnake(123)).toBe(123);
      expect(convertKeysToSnake(true)).toBe(true);
      expect(convertKeysToSnake(false)).toBe(false);
    });

    it('handles empty object', () => {
      expect(convertKeysToSnake({})).toEqual({});
    });

    it('handles empty array', () => {
      expect(convertKeysToSnake([])).toEqual([]);
    });

    it('handles mixed data types', () => {
      const input = {
        userData: {
          profileInfo: {
            name: 'John',
            age: 30,
            isActive: true,
            hobbies: ['reading', 'gaming'],
            metadata: null,
          },
          settings: {
            notificationsEnabled: false,
            themePreference: 'dark',
          },
        },
        posts: [
          { postId: 1, captionText: 'Hello' },
          { postId: 2, captionText: 'World' },
        ],
      };
      const expected = {
        user_data: {
          profile_info: {
            name: 'John',
            age: 30,
            is_active: true,
            hobbies: ['reading', 'gaming'],
            metadata: null,
          },
          settings: {
            notifications_enabled: false,
            theme_preference: 'dark',
          },
        },
        posts: [
          { post_id: 1, caption_text: 'Hello' },
          { post_id: 2, caption_text: 'World' },
        ],
      };
      expect(convertKeysToSnake(input)).toEqual(expected);
    });

    it('handles non-object constructors', () => {
      const date = new Date();
      const regex = /test/;
      const set = new Set([1, 2, 3]);
      const map = new Map([['key', 'value']]);

      expect(convertKeysToSnake(date)).toBe(date);
      expect(convertKeysToSnake(regex)).toBe(regex);
      expect(convertKeysToSnake(set)).toBe(set);
      expect(convertKeysToSnake(map)).toBe(map);
    });

    it('handles acronyms in object keys', () => {
      const input = {
        JSONData: 'data',
        XMLParser: 'parser',
        APIResponse: 'response',
      };
      const expected = {
        j_s_o_n_data: 'data',
        x_m_l_parser: 'parser',
        a_p_i_response: 'response',
      };
      expect(convertKeysToSnake(input)).toEqual(expected);
    });
  });

  describe('Round-trip conversion', () => {
    it('converts snake_case to camelCase and back', () => {
      const original = {
        user_name: 'John',
        first_name: 'John',
        last_name: 'Doe',
        profile_image_url: 'https://example.com/image.jpg',
      };

      const camelCase = convertKeysToCamel(original);
      const backToSnake = convertKeysToSnake(camelCase);

      expect(backToSnake).toEqual(original);
    });

    it('converts camelCase to snake_case and back', () => {
      const original = {
        userName: 'John',
        firstName: 'John',
        lastName: 'Doe',
        profileImageUrl: 'https://example.com/image.jpg',
      };

      const snakeCase = convertKeysToSnake(original);
      const backToCamel = convertKeysToCamel(snakeCase);

      expect(backToCamel).toEqual(original);
    });
  });
});
