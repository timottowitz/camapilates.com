import { cronJobs } from 'convex/server';
import { api } from './_generated/api';

const crons = cronJobs();

// Every 6 hours, process up to 2 queued topics
crons.cron('pipeline.processQueued', '0 */6 * * *', api.pipeline.processQueuedSuggestions);

export default crons;

