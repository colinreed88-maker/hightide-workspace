// snowflake.ts — Snowflake client abstraction
// In sandbox mode (or when no credentials are configured), uses a mock client.
// All Snowflake access is read-only.

import type { TenantArrears, TenantArrearsRaw } from './types.js';

/**
 * Normalize a raw Snowflake TENANT_ARREARS row into the agent's TenantArrears shape.
 * The source table uses aging buckets instead of a single balance_due/days_past_due.
 */
function normalizeArrearsRow(row: TenantArrearsRaw): TenantArrears {
  const balance_due =
    (row.THIRTY_DAY_PAST_DUE ?? 0) +
    (row.SIXTY_DAY_PAST_DUE ?? 0) +
    (row.NINETY_DAY_PAST_DUE ?? 0) +
    (row.OVER_NINETY_DAY_PAST_DUE ?? 0) +
    (row.ONE_TWENTY_DAYS_PAST_DUE ?? 0);

  // Derive days_past_due from the earliest non-zero bucket
  let days_past_due = 0;
  if (row.THIRTY_DAY_PAST_DUE > 0) days_past_due = 30;
  else if (row.SIXTY_DAY_PAST_DUE > 0) days_past_due = 60;
  else if (row.NINETY_DAY_PAST_DUE > 0) days_past_due = 90;
  else if (row.OVER_NINETY_DAY_PAST_DUE > 0) days_past_due = 91;
  else if (row.ONE_TWENTY_DAYS_PAST_DUE > 0) days_past_due = 120;

  return {
    tenant_id: String(row.TENANT_ID),
    unit_id: String(row.UNIT_ID),
    property_id: String(row.PROPERTY_ID),
    tenant_name: `${row.TENANT_FIRST_NAME} ${row.TENANT_LAST_NAME}`.trim(),
    balance_due,
    days_past_due,
    payment_plan_flag: false, // not in source schema
    as_of_date: row.DATE_TS?.split('T')[0],
  };
}

export interface SnowflakeClient {
  /**
   * Query delinquent tenants from ANALYTICS.FINANCIAL.TENANT_ARREARS.
   * Returns only tenants with days_past_due >= thresholdDays, balance > 0,
   * no active payment plan, for the given property and current date.
   */
  queryDelinquentTenants(propertyId: string, thresholdDays: number): Promise<TenantArrears[]>;

  /**
   * Re-check the current balance for a single tenant (used in escalation loop).
   * Returns null if tenant has no current arrears record (i.e., balance cleared).
   */
  getTenantBalance(tenantId: string): Promise<{ balance_due: number } | null>;
}

/**
 * Mock Snowflake client for sandbox/testing.
 * Returns configurable mock data — never makes real network calls.
 */
export class MockSnowflakeClient implements SnowflakeClient {
  private mockArrears: TenantArrears[];
  private mockBalances: Map<string, number>;

  constructor(
    mockArrears: TenantArrears[] = [],
    mockBalances: Map<string, number> = new Map()
  ) {
    this.mockArrears = mockArrears;
    this.mockBalances = mockBalances;
  }

  async queryDelinquentTenants(propertyId: string, thresholdDays: number): Promise<TenantArrears[]> {
    return this.mockArrears.filter(
      (t) =>
        t.property_id === propertyId &&
        t.days_past_due >= thresholdDays &&
        t.balance_due > 0 &&
        !t.payment_plan_flag
    );
  }

  async getTenantBalance(tenantId: string): Promise<{ balance_due: number } | null> {
    const balance = this.mockBalances.get(tenantId);
    if (balance === undefined) return null;
    return { balance_due: balance };
  }

  /** Helper for tests: update a tenant's current balance */
  setMockBalance(tenantId: string, balance: number): void {
    this.mockBalances.set(tenantId, balance);
  }
}

/**
 * Real Snowflake client — wraps the snowflake-sdk.
 * Only instantiated when SNOWFLAKE_ACCOUNT env var is set.
 */
export class RealSnowflakeClient implements SnowflakeClient {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private connection: any;

  constructor() {
    // Dynamic import to avoid requiring snowflake-sdk in sandbox environments
    // where the package may not be installed.
    this.connection = null;
  }

  private async getConnection() {
    if (this.connection) return this.connection;

    // Dynamic require — snowflake-sdk is an optional dependency
    const snowflake = await import('snowflake-sdk' as string);

    this.connection = snowflake.createConnection({
      account: process.env.SNOWFLAKE_ACCOUNT!,
      username: process.env.SNOWFLAKE_USER!,
      password: process.env.SNOWFLAKE_PASSWORD!,
      database: process.env.SNOWFLAKE_DATABASE ?? 'ANALYTICS',
      schema: process.env.SNOWFLAKE_SCHEMA ?? 'FINANCIAL',
      warehouse: process.env.SNOWFLAKE_WAREHOUSE,
    });

    await new Promise<void>((resolve, reject) => {
      this.connection.connect((err: Error) => {
        if (err) reject(err);
        else resolve();
      });
    });

    return this.connection;
  }

  async queryDelinquentTenants(propertyId: string, thresholdDays: number): Promise<TenantArrears[]> {
    const conn = await this.getConnection();
    // Real schema uses aging bucket columns, not a single balance_due/days_past_due.
    // We filter by the 30-day bucket being non-zero (>= 30 days past due threshold).
    // thresholdDays maps to the appropriate bucket: <30=any, 30=30d, 60=60d, 90=90d
    const bucketFilter = thresholdDays <= 30
      ? `(THIRTY_DAY_PAST_DUE + SIXTY_DAY_PAST_DUE + NINETY_DAY_PAST_DUE + OVER_NINETY_DAY_PAST_DUE + ONE_TWENTY_DAYS_PAST_DUE) > 0`
      : thresholdDays <= 60
      ? `(SIXTY_DAY_PAST_DUE + NINETY_DAY_PAST_DUE + OVER_NINETY_DAY_PAST_DUE + ONE_TWENTY_DAYS_PAST_DUE) > 0`
      : `(NINETY_DAY_PAST_DUE + OVER_NINETY_DAY_PAST_DUE + ONE_TWENTY_DAYS_PAST_DUE) > 0`;

    const sql = `
      SELECT
        TENANT_ID, TENANT_CODE, TENANT_FIRST_NAME, TENANT_LAST_NAME,
        UNIT_ID, UNIT_CODE, PROPERTY_ID, PROPERTY_NAME, TENANT_STATUS,
        THIRTY_DAY_PAST_DUE, SIXTY_DAY_PAST_DUE, NINETY_DAY_PAST_DUE,
        OVER_NINETY_DAY_PAST_DUE, ONE_TWENTY_DAYS_PAST_DUE, DATE_TS
      FROM ANALYTICS.FINANCIAL.TENANT_ARREARS
      WHERE PROPERTY_ID = :1
        AND TENANT_STATUS = 'Current'
        AND ${bucketFilter}
        AND DATE_TS >= DATEADD(day, -1, CURRENT_TIMESTAMP)
    `;

    const rows: TenantArrearsRaw[] = await new Promise((resolve, reject) => {
      conn.execute({
        sqlText: sql,
        binds: [propertyId],
        complete: (err: Error, _stmt: unknown, rows: TenantArrearsRaw[]) => {
          if (err) reject(err);
          else resolve(rows ?? []);
        },
      });
    });

    return rows.map(normalizeArrearsRow);
  }

  async getTenantBalance(tenantId: string): Promise<{ balance_due: number } | null> {
    const conn = await this.getConnection();
    const sql = `
      SELECT
        THIRTY_DAY_PAST_DUE + SIXTY_DAY_PAST_DUE + NINETY_DAY_PAST_DUE +
        OVER_NINETY_DAY_PAST_DUE + ONE_TWENTY_DAYS_PAST_DUE AS total_balance
      FROM ANALYTICS.FINANCIAL.TENANT_ARREARS
      WHERE TENANT_ID = :1
        AND DATE_TS >= DATEADD(day, -1, CURRENT_TIMESTAMP)
      ORDER BY DATE_TS DESC
      LIMIT 1
    `;

    const rows: Array<{ TOTAL_BALANCE: number }> = await new Promise((resolve, reject) => {
      conn.execute({
        sqlText: sql,
        binds: [tenantId],
        complete: (err: Error, _stmt: unknown, rows: Array<{ TOTAL_BALANCE: number }>) => {
          if (err) reject(err);
          else resolve(rows ?? []);
        },
      });
    });

    return rows.length > 0 ? { balance_due: rows[0].TOTAL_BALANCE ?? 0 } : null;
  }
}

/**
 * Factory: returns a real client if Snowflake creds are configured,
 * otherwise returns a mock client (safe for sandbox/CI).
 */
export function createSnowflakeClient(
  mockArrears?: TenantArrears[],
  mockBalances?: Map<string, number>
): SnowflakeClient {
  const hasCredentials =
    process.env.SNOWFLAKE_ACCOUNT &&
    process.env.SNOWFLAKE_USER &&
    process.env.SNOWFLAKE_PASSWORD;

  if (!hasCredentials) {
    console.log('[Snowflake] No credentials configured — using mock client (sandbox safe).');
    return new MockSnowflakeClient(mockArrears ?? [], mockBalances ?? new Map());
  }

  return new RealSnowflakeClient();
}
