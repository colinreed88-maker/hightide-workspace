// config.ts — reads environment variables and produces AgentConfig
// SANDBOX defaults to true. It cannot be overridden to false by the agent itself.

import 'dotenv/config';
import type { AgentConfig } from './types.js';

export function loadConfig(): AgentConfig {
  // SANDBOX=true is the default. Requires explicit SANDBOX=false env var to disable.
  const sandboxEnv = process.env.SANDBOX ?? 'true';
  const sandbox = sandboxEnv.toLowerCase() !== 'false';

  const propertyId = process.env.DELINQUENCY_PROPERTY_ID ?? 'brickell';
  const thresholdDays = parseInt(process.env.DELINQUENCY_THRESHOLD_DAYS ?? '5', 10);
  const agentId = process.env.AGENT_ID ?? 'delinquency-agent-v1';

  return {
    propertyId,
    thresholdDays,
    sandbox,
    agentId,
    slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
    dashboardBaseUrl: process.env.DASHBOARD_BASE_URL ?? 'https://app.flow.life',
    propertyName: process.env.PROPERTY_NAME ?? 'Flow Brickell',
    propertyPhone: process.env.PROPERTY_PHONE ?? '(305) 555-0100',
    paymentUrl: process.env.PAYMENT_URL ?? 'https://pay.flow.life/brickell',
  };
}
