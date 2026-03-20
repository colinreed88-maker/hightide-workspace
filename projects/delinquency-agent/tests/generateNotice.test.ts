import { describe, it, expect } from 'vitest';
import { generateNotice } from '../src/notices.js';
import { mockTenants } from './fixtures.js';

describe('generateNotice', () => {
  const tenant = mockTenants[0]; // Alice Johnson, $2450, 7 days past due, unit 101

  it('includes tenant name', () => {
    const notice = generateNotice(tenant);
    expect(notice).toContain('Alice Johnson');
  });

  it('includes balance_due formatted with 2 decimal places', () => {
    const notice = generateNotice(tenant);
    expect(notice).toContain('$2450.00');
  });

  it('includes unit_id', () => {
    const notice = generateNotice(tenant);
    expect(notice).toContain('unit 101');
  });

  it('includes days_past_due', () => {
    const notice = generateNotice(tenant);
    expect(notice).toContain('7 days');
  });

  it('includes the payment URL', () => {
    const notice = generateNotice(tenant, { paymentUrl: 'https://pay.flow.life/brickell' });
    expect(notice).toContain('https://pay.flow.life/brickell');
  });

  it('includes the property phone', () => {
    const notice = generateNotice(tenant, { propertyPhone: '(305) 555-0100' });
    expect(notice).toContain('(305) 555-0100');
  });

  it('includes the property name', () => {
    const notice = generateNotice(tenant, { propertyName: 'Flow Residential' });
    expect(notice).toContain('Flow Residential');
  });

  it('uses default values when context is not provided', () => {
    const notice = generateNotice(tenant);
    expect(notice).toContain('pay.flow.life');
    expect(notice).toContain('Flow Residential');
  });

  it('uses singular "day" for exactly 1 day past due', () => {
    const singleDay = { ...tenant, days_past_due: 1 };
    const notice = generateNotice(singleDay);
    expect(notice).toContain('1 day past due');
    expect(notice).not.toContain('1 days');
  });

  it('produces a non-empty string', () => {
    const notice = generateNotice(tenant);
    expect(notice.length).toBeGreaterThan(50);
  });
});
