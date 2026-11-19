import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

// Every 6 hours, process up to 2 queued topics
crons.cron('pipeline.processQueued', '0 */6 * * *', internal.pipeline.processQueuedSuggestions);

// Every 10 minutes, ask Whop whether any open order payment link has been paid
crons.interval('orderPayments.syncOpen', { minutes: 10 }, internal.orderPayments.syncOpen);

export default crons;
