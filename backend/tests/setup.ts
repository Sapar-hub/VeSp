// backend/tests/setup.ts
import { beforeAll, afterAll } from 'vitest';

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret';
});

afterAll(() => {
  // Clean up environment variables if necessary
  delete process.env.JWT_SECRET;
});
