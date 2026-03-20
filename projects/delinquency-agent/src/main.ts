// main.ts — entry point for the delinquency agent
// Run: npm start
// SANDBOX=true is always the default.

import { loadConfig } from './config.js';
import { createSnowflakeClient } from './snowflake.js';
import { createSupabaseClient } from './supabase.js';
import { runDailyCycle } from './agent.js';

async function main(): Promise<void> {
  const config = loadConfig();

  console.log('[DelinquencyAgent] Starting...');
  console.log(`[DelinquencyAgent] Property:   ${config.propertyId}`);
  console.log(`[DelinquencyAgent] Threshold:  ${config.thresholdDays} days past due`);
  console.log(`[DelinquencyAgent] Sandbox:    ${config.sandbox}`);
  console.log(`[DelinquencyAgent] Agent ID:   ${config.agentId}`);

  if (!config.sandbox) {
    console.warn(
      '[DelinquencyAgent] WARNING: SANDBOX=false — real actions will be taken. ' +
      'Ensure this is intentional.'
    );
  }

  const snowflake = createSnowflakeClient();
  const supabase = createSupabaseClient();

  const result = await runDailyCycle(snowflake, supabase, {
    propertyId: config.propertyId,
    thresholdDays: config.thresholdDays,
    sandbox: config.sandbox,
    agentId: config.agentId,
    slackWebhookUrl: config.slackWebhookUrl,
    dashboardBaseUrl: config.dashboardBaseUrl,
    propertyName: config.propertyName,
    propertyPhone: config.propertyPhone,
    paymentUrl: config.paymentUrl,
  });

  console.log('[DelinquencyAgent] Done.');
  console.log(`  New cases:      ${result.newCases}`);
  console.log(`  Existing cases: ${result.existingCases}`);
  console.log(`  Resolved:       ${result.resolved}`);
  console.log(`  Escalated:      ${result.escalated}`);

  if (result.errors.length > 0) {
    console.error(`[DelinquencyAgent] Errors (${result.errors.length}):`);
    result.errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[DelinquencyAgent] Fatal error:', err);
  process.exit(1);
});
