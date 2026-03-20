// supabase.ts — Supabase client factory
// Returns real client when env vars are set, mock client otherwise.

import type { DelinquencyCase, DelinquencyAction, CaseStatus } from './types.js';

export interface SupabaseClient {
  /**
   * Upsert a delinquency case. Uses UNIQUE(tenant_id, cycle_date) for idempotency.
   * Returns the existing or newly created case.
   */
  upsertCase(data: Omit<DelinquencyCase, 'id' | 'created_at' | 'updated_at'>): Promise<DelinquencyCase>;

  /**
   * Find an existing case for a tenant on a given cycle date.
   */
  findCase(tenantId: string, cycleDate: string): Promise<DelinquencyCase | null>;

  /**
   * Find any open (non-resolved, non-escalated) case for a tenant across all cycle dates.
   * Used to detect whether a prior cycle's notice is still pending.
   */
  findOpenCase(tenantId: string): Promise<DelinquencyCase | null>;

  /**
   * Update fields on an existing case (status, timestamps, etc.)
   */
  updateCase(caseId: string, updates: Partial<DelinquencyCase>): Promise<DelinquencyCase>;

  /**
   * Append an action to the action log. Never updates or deletes.
   */
  insertAction(data: Omit<DelinquencyAction, 'id' | 'created_at'>): Promise<DelinquencyAction>;

  /**
   * Fetch all awaiting cases for a property (for the escalation loop).
   */
  getAwaitingCases(propertyId: string): Promise<DelinquencyCase[]>;
}

// ---- Mock Client (for sandbox/tests) ----------------------------------------

export class MockSupabaseClient implements SupabaseClient {
  public cases: Map<string, DelinquencyCase> = new Map();
  public actions: DelinquencyAction[] = [];
  private idCounter = 1;

  private newId(): string {
    return `mock-id-${this.idCounter++}`;
  }

  async upsertCase(data: Omit<DelinquencyCase, 'id' | 'created_at' | 'updated_at'>): Promise<DelinquencyCase> {
    const key = `${data.tenant_id}::${data.cycle_date}`;
    const existing = this.cases.get(key);
    if (existing) return existing;

    const newCase: DelinquencyCase = {
      ...data,
      id: this.newId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.cases.set(key, newCase);
    return newCase;
  }

  async findCase(tenantId: string, cycleDate: string): Promise<DelinquencyCase | null> {
    const key = `${tenantId}::${cycleDate}`;
    return this.cases.get(key) ?? null;
  }

  async findOpenCase(tenantId: string): Promise<DelinquencyCase | null> {
    for (const c of this.cases.values()) {
      if (c.tenant_id === tenantId && c.status !== 'resolved' && c.status !== 'escalated') {
        return c;
      }
    }
    return null;
  }

  async updateCase(caseId: string, updates: Partial<DelinquencyCase>): Promise<DelinquencyCase> {
    for (const [key, c] of this.cases.entries()) {
      if (c.id === caseId) {
        const updated = { ...c, ...updates, updated_at: new Date().toISOString() };
        this.cases.set(key, updated);
        return updated;
      }
    }
    throw new Error(`Case not found: ${caseId}`);
  }

  async insertAction(data: Omit<DelinquencyAction, 'id' | 'created_at'>): Promise<DelinquencyAction> {
    const action: DelinquencyAction = {
      ...data,
      id: this.newId(),
      created_at: new Date().toISOString(),
    };
    this.actions.push(action);
    return action;
  }

  async getAwaitingCases(propertyId: string): Promise<DelinquencyCase[]> {
    return Array.from(this.cases.values()).filter(
      (c) => c.property_id === propertyId && c.status === 'awaiting'
    );
  }
}

// ---- Real Client (wraps @supabase/supabase-js) -------------------------------

export class RealSupabaseClient implements SupabaseClient {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private client: any;

  constructor() {
    // Dynamic import to allow the module to load without installed deps in tests
  }

  private async getClient() {
    if (this.client) return this.client;
    const { createClient } = await import('@supabase/supabase-js');
    this.client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
    return this.client;
  }

  async upsertCase(data: Omit<DelinquencyCase, 'id' | 'created_at' | 'updated_at'>): Promise<DelinquencyCase> {
    const sb = await this.getClient();
    const { data: row, error } = await sb
      .from('delinquency_cases')
      .upsert(data, { onConflict: 'tenant_id,cycle_date', ignoreDuplicates: false })
      .select()
      .single();
    if (error) throw new Error(`Supabase upsert error: ${error.message}`);
    return row as DelinquencyCase;
  }

  async findCase(tenantId: string, cycleDate: string): Promise<DelinquencyCase | null> {
    const sb = await this.getClient();
    const { data: rows, error } = await sb
      .from('delinquency_cases')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('cycle_date', cycleDate)
      .limit(1);
    if (error) throw new Error(`Supabase select error: ${error.message}`);
    return rows && rows.length > 0 ? (rows[0] as DelinquencyCase) : null;
  }

  async findOpenCase(tenantId: string): Promise<DelinquencyCase | null> {
    const sb = await this.getClient();
    const { data: rows, error } = await sb
      .from('delinquency_cases')
      .select('*')
      .eq('tenant_id', tenantId)
      .not('status', 'in', '("resolved","escalated")')
      .order('created_at', { ascending: false })
      .limit(1);
    if (error) throw new Error(`Supabase select error: ${error.message}`);
    return rows && rows.length > 0 ? (rows[0] as DelinquencyCase) : null;
  }

  async updateCase(caseId: string, updates: Partial<DelinquencyCase>): Promise<DelinquencyCase> {
    const sb = await this.getClient();
    const { data: row, error } = await sb
      .from('delinquency_cases')
      .update(updates)
      .eq('id', caseId)
      .select()
      .single();
    if (error) throw new Error(`Supabase update error: ${error.message}`);
    return row as DelinquencyCase;
  }

  async insertAction(data: Omit<DelinquencyAction, 'id' | 'created_at'>): Promise<DelinquencyAction> {
    const sb = await this.getClient();
    const { data: row, error } = await sb
      .from('delinquency_actions')
      .insert(data)
      .select()
      .single();
    if (error) throw new Error(`Supabase insert action error: ${error.message}`);
    return row as DelinquencyAction;
  }

  async getAwaitingCases(propertyId: string): Promise<DelinquencyCase[]> {
    const sb = await this.getClient();
    const { data: rows, error } = await sb
      .from('delinquency_cases')
      .select('*')
      .eq('property_id', propertyId)
      .eq('status', 'awaiting' as CaseStatus);
    if (error) throw new Error(`Supabase select error: ${error.message}`);
    return (rows ?? []) as DelinquencyCase[];
  }
}

// ---- Factory -----------------------------------------------------------------

export function createSupabaseClient(): SupabaseClient {
  const hasCredentials = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY;
  if (!hasCredentials) {
    console.log('[Supabase] No credentials configured — using mock client (sandbox safe).');
    return new MockSupabaseClient();
  }
  return new RealSupabaseClient();
}
