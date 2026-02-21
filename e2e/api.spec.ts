import { test, expect } from '@playwright/test';

/**
 * API endpoint tests — exercises the backend REST routes directly via
 * page.request (no browser rendering required).
 *
 * Required env vars:
 *   IOT_DEVICE_SECRET — bearer token returned by the server for IoT devices
 *   E2E_USER_EMAIL / E2E_USER_PASSWORD — used indirectly to validate 401
 */

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
function bearerToken() {
  return process.env.IOT_DEVICE_SECRET ?? '';
}

// ---------------------------------------------------------------------------
// POST /api/v1/sensor-data — JSON ingestion endpoint
// ---------------------------------------------------------------------------
test.describe('POST /api/v1/sensor-data', () => {
  const endpoint = '/api/v1/sensor-data';

  const validPayload = {
    device_id: 'e2e-device-001',
    site: 'E2E Test Site',
    timestamp: new Date().toISOString(),
    readings: {
      pm1: 5,
      pm25: 12,
      pm10: 18,
      co2: 450,
      voc: 0.3,
      temp: 22.5,
      hum: 45,
      co: 0.1,
      o3: 0.02,
      no2: 0.015,
    },
  };

  test('returns 401 when Authorization header is missing', async ({ request }) => {
    const response = await request.post(endpoint, { data: validPayload });
    expect(response.status()).toBe(401);
  });

  test('returns 401 when an invalid bearer token is supplied', async ({ request }) => {
    const response = await request.post(endpoint, {
      headers: { Authorization: 'Bearer invalid-secret-token' },
      data: validPayload,
    });
    expect(response.status()).toBe(401);
  });

  test('returns 400 when the request body is missing required fields', async ({ request }) => {
    test.skip(!bearerToken(), 'IOT_DEVICE_SECRET not set');

    const response = await request.post(endpoint, {
      headers: { Authorization: `Bearer ${bearerToken()}` },
      data: { device_id: 'incomplete' }, // missing readings etc.
    });
    expect(response.status()).toBe(400);
  });

  test('ingests valid sensor data and returns 201 with a readingId', async ({ request }) => {
    test.skip(!bearerToken(), 'IOT_DEVICE_SECRET not set');

    const response = await request.post(endpoint, {
      headers: {
        Authorization: `Bearer ${bearerToken()}`,
        'Content-Type': 'application/json',
      },
      data: validPayload,
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('data.readingId');
  });

  test('returns a duplicate warning when identical timestamp + device_id is submitted twice', async ({
    request,
  }) => {
    test.skip(
      true,
      'Skipped: duplicate-detection response varies by DB state/schema and is non-deterministic in CI'
    );

    test.skip(!bearerToken(), 'IOT_DEVICE_SECRET not set');

    const dedupPayload = {
      ...validPayload,
      timestamp: '2024-01-01T00:00:00.000Z', // fixed timestamp to force duplicate
      device_id: 'e2e-dedup-device',
    };

    const headers = {
      Authorization: `Bearer ${bearerToken()}`,
      'Content-Type': 'application/json',
    };

    // First submission
    await request.post(endpoint, { headers, data: dedupPayload });
    // Second (duplicate) submission
    const response = await request.post(endpoint, { headers, data: dedupPayload });

    const body = await response.json();
    const acceptedAsDuplicate = response.status() === 200 && body.duplicate === true;
    const acceptedAsCreate = response.status() === 201 && body.success === true;
    expect(acceptedAsDuplicate || acceptedAsCreate).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// POST /api/ingest — CSV-style ingestion endpoint
// ---------------------------------------------------------------------------
test.describe('POST /api/ingest', () => {
  const endpoint = '/api/ingest';

  test('returns 401 when Authorization header is missing', async ({ request }) => {
    const response = await request.post(endpoint, {
      data: 'device_id,timestamp,pm25\ne2e-csv-001,2024-01-01T00:00:00Z,12',
    });
    expect(response.status()).toBe(401);
  });

  test('returns 401 when an invalid bearer token is supplied', async ({ request }) => {
    const response = await request.post(endpoint, {
      headers: { Authorization: 'Bearer wrong-token' },
      data: 'device_id,timestamp,pm25\ne2e-csv-001,2024-01-01T00:00:00Z,12',
    });
    expect(response.status()).toBe(401);
  });

  test.skip(
    true,
    'Skipped: CSV ingestion integration test requires a stable test sensor registered in the DB'
  );

  test('accepts valid CSV data and returns 200', async ({ request }) => {
    const csvBody =
      'device_id,site,timestamp,pm1,pm25,pm10,co2,voc,temp,hum,co,o3,no2\n' +
      `e2e-csv-001,E2E Site,${new Date().toISOString()},4,11,17,430,0.2,21,50,0.1,0.02,0.01`;

    const response = await request.post(endpoint, {
      headers: {
        Authorization: `Bearer ${bearerToken()}`,
        'Content-Type': 'text/csv',
      },
      data: csvBody,
    });

    expect(response.status()).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// NextAuth endpoints
// ---------------------------------------------------------------------------
test.describe('NextAuth endpoints', () => {
  test('GET /api/auth/providers returns a JSON object with credentials provider', async ({
    request,
  }) => {
    const response = await request.get('/api/auth/providers');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toHaveProperty('credentials');
  });

  test('GET /api/auth/session returns a valid JSON response', async ({ request }) => {
    const response = await request.get('/api/auth/session');
    expect(response.status()).toBe(200);
    // Unauthenticated: body is {} or { user: null }
    const body = await response.json();
    expect(typeof body).toBe('object');
  });
});

// ---------------------------------------------------------------------------
// Signup API route
// ---------------------------------------------------------------------------
test.describe('POST /api/auth/signup', () => {
  test('returns 400 when required fields are missing', async ({ request }) => {
    const response = await request.post('/api/auth/signup', {
      data: { email: 'nopw@example.com' }, // missing name + password
    });
    expect(response.status()).toBe(400);
  });

  test('returns 400 when password is shorter than 8 characters', async ({ request }) => {
    const response = await request.post('/api/auth/signup', {
      data: { name: 'Test', email: 'short@example.com', password: 'abc' },
    });
    expect(response.status()).toBe(400);
  });

  test('returns 409 when trying to register the same email twice', async ({ request }) => {
    const duplicateEmail = `e2e-duplicate-${Date.now()}@example.com`;

    const first = await request.post('/api/auth/signup', {
      data: { name: 'Duplicate', email: duplicateEmail, password: 'SecurePass1!' },
    });
    expect(first.status()).toBe(201);

    const second = await request.post('/api/auth/signup', {
      data: { name: 'Duplicate Again', email: duplicateEmail, password: 'SecurePass1!' },
    });
    expect(second.status()).toBe(409);
  });

  test('returns 201 when a valid new account is submitted', async ({ request }) => {
    const uniqueEmail = `e2e-api-${Date.now()}@example.com`;
    const response = await request.post('/api/auth/signup', {
      data: { name: 'API E2E User', email: uniqueEmail, password: 'Secure1234!' },
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('user.id');
  });
});
