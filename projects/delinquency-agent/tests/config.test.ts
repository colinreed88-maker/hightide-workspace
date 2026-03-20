import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// Test the loadConfig function in isolation
// We need to import after setting env vars so we use a dynamic import approach

describe('config — SANDBOX default', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    // Restore env
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) delete process.env[key];
    }
    Object.assign(process.env, originalEnv);
  });

  it('SANDBOX defaults to true when not set', async () => {
    delete process.env.SANDBOX;
    const { loadConfig } = await import('../src/config.js');
    const config = loadConfig();
    expect(config.sandbox).toBe(true);
  });

  it('SANDBOX is true when set to "true"', async () => {
    process.env.SANDBOX = 'true';
    const { loadConfig } = await import('../src/config.js');
    const config = loadConfig();
    expect(config.sandbox).toBe(true);
  });

  it('SANDBOX is true when set to "TRUE" (case-insensitive)', async () => {
    process.env.SANDBOX = 'TRUE';
    const { loadConfig } = await import('../src/config.js');
    const config = loadConfig();
    expect(config.sandbox).toBe(true);
  });

  it('SANDBOX is false only when explicitly set to "false"', async () => {
    process.env.SANDBOX = 'false';
    const { loadConfig } = await import('../src/config.js');
    const config = loadConfig();
    expect(config.sandbox).toBe(false);
  });

  it('threshold defaults to 5 when not set', async () => {
    delete process.env.DELINQUENCY_THRESHOLD_DAYS;
    const { loadConfig } = await import('../src/config.js');
    const config = loadConfig();
    expect(config.thresholdDays).toBe(5);
  });

  it('property defaults to brickell when not set', async () => {
    delete process.env.DELINQUENCY_PROPERTY_ID;
    const { loadConfig } = await import('../src/config.js');
    const config = loadConfig();
    expect(config.propertyId).toBe('brickell');
  });
});
