import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { api } from '../../src/io/api';

describe('api', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('register handles success correctly', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    const mockToken = 'abc-123';
    const mockResponse = { user: mockUser, token: mockToken };

    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await api.register('test@example.com', 'password');

    expect(result).toEqual({
      success: true,
      data: mockResponse,
    });
  });

  it('register handles error correctly', async () => {
    const mockError = { error: 'User already exists' };

    (global.fetch as Mock).mockResolvedValue({
      ok: false,
      statusText: 'Bad Request',
      json: async () => mockError,
    });

    const result = await api.register('test@example.com', 'password');

    expect(result).toEqual({
      success: false,
      message: 'User already exists',
    });
  });

  it('register handles error with fallback message', async () => {
      // Case where backend doesn't send 'error' field but just a status text or empty body
      // Though our code checks for data.error.
      // If data is empty object:
      const mockError = {};
  
      (global.fetch as Mock).mockResolvedValue({
        ok: false,
        statusText: 'Bad Request',
        json: async () => mockError,
      });
  
      const result = await api.register('test@example.com', 'password');
  
      expect(result).toEqual({
        success: false,
        message: 'Bad Request',
      });
    });
});
