import { describe, it, expect } from 'vitest';
import { formatSlackEscalation } from '../src/slack.js';
import { makeCase, mockTenants } from './fixtures.js';

const tenant = mockTenants[0]; // T001 - Alice Johnson

describe('formatSlackEscalation', () => {
  it('includes the property name', () => {
    const msg = formatSlackEscalation(makeCase(), tenant, 2450.00, {
      propertyName: 'Flow Brickell',
    });
    expect(msg).toContain('Flow Brickell');
  });

  it('includes tenant name and unit', () => {
    const msg = formatSlackEscalation(makeCase(), tenant, 2450.00);
    expect(msg).toContain('Alice Johnson');
    expect(msg).toContain('Unit 101');
  });

  it('includes the current balance', () => {
    const msg = formatSlackEscalation(makeCase(), tenant, 2450.00);
    expect(msg).toContain('$2450.00');
  });

  it('includes days past due', () => {
    const msg = formatSlackEscalation(makeCase(), tenant, 2450.00);
    expect(msg).toContain('7 days');
  });

  it('includes dashboard action link', () => {
    const msg = formatSlackEscalation(makeCase({ id: 'case-abc' }), tenant, 2450.00, {
      dashboardBaseUrl: 'https://app.flow.life',
    });
    expect(msg).toContain('https://app.flow.life/delinquency/cases/case-abc');
  });

  it('includes escalation emoji marker', () => {
    const msg = formatSlackEscalation(makeCase(), tenant, 2450.00);
    expect(msg).toContain('🔴');
  });

  it('includes 48-hour context', () => {
    const msg = formatSlackEscalation(makeCase(), tenant, 2450.00);
    expect(msg).toContain('48 hours');
  });
});
