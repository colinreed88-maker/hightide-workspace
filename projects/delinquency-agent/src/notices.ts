// notices.ts — notice generation and simulation

import type { TenantArrears } from './types.js';

interface NoticeContext {
  paymentUrl?: string;
  propertyPhone?: string;
  propertyName?: string;
}

/**
 * Generate a notice string for a delinquent tenant.
 * Uses the standard Flow notice template.
 */
export function generateNotice(tenant: TenantArrears, ctx: NoticeContext = {}): string {
  const {
    paymentUrl = 'https://pay.flow.life/brickell',
    propertyPhone = '(305) 555-0100',
    propertyName = 'Flow Residential',
  } = ctx;

  const balance = tenant.balance_due.toFixed(2);
  const days = tenant.days_past_due;

  return `Hi ${tenant.tenant_name},

This is a reminder that your rent payment of $${balance} for unit ${tenant.unit_id} is ${days} day${days === 1 ? '' : 's'} past due.

Please submit payment at: ${paymentUrl}

If you have already submitted payment or have questions, please contact the leasing office at ${propertyPhone}.

Thank you,
${propertyName}`.trim();
}

/**
 * In sandbox mode, log the notice to stdout and write to the action log.
 * Never sends a real message.
 */
export function logSimulatedNotice(
  caseId: string,
  tenantId: string,
  noticeText: string,
  sandbox: boolean
): void {
  if (!sandbox) {
    // In production this would be handled by the caller (Twilio/SendGrid)
    return;
  }
  console.log(
    `[SANDBOX] notice_simulated | case=${caseId} | tenant=${tenantId}\n` +
    `--- NOTICE ---\n${noticeText}\n--- END NOTICE ---`
  );
}
