/**
 * Example BullMQ Queue Setup
 * 
 * This file demonstrates how to set up a BullMQ queue using the Redis connection.
 * Copy and modify this pattern for your specific queue needs.
 */

import { Queue, Worker, QueueEvents } from 'bullmq';
import { getRedisConnection } from '../redis/client';

// Get Redis connection (returns null if not configured)
const connection = getRedisConnection();

if (!connection) {
  console.warn('⚠️  Redis not configured. Queues will not work.');
}

/**
 * Example: Campaign Processing Queue
 * 
 * Usage:
 *   import { campaignQueue } from '@/lib/server/queues/example-queue';
 *   await campaignQueue.add('process-campaign', { campaignId: '123' });
 */
export const campaignQueue = connection
  ? new Queue('campaign-processing', {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: {
          age: 3600, // Keep completed jobs for 1 hour
          count: 1000, // Keep max 1000 completed jobs
        },
        removeOnFail: {
          age: 86400, // Keep failed jobs for 24 hours
        },
      },
    })
  : null;

/**
 * Example: Campaign Worker
 * 
 * This worker processes jobs from the campaign queue.
 * In production, you'd typically run this in a separate process or Vercel Cron Job.
 */
export const campaignWorker = connection
  ? new Worker(
      'campaign-processing',
      async (job) => {
        const { campaignId } = job.data;
        console.log(`Processing campaign: ${campaignId}`);
        
        // Your campaign processing logic here
        // Example:
        // const campaignService = new CampaignService();
        // await campaignService.processCampaign(campaignId);
        
        return { success: true, campaignId };
      },
      {
        connection,
        concurrency: 5, // Process 5 jobs concurrently
        limiter: {
          max: 10, // Max 10 jobs
          duration: 1000, // Per second
        },
      }
    )
  : null;

/**
 * Example: Queue Events (for monitoring)
 */
export const campaignQueueEvents = connection
  ? new QueueEvents('campaign-processing', { connection })
  : null;

// Set up event listeners (optional)
if (campaignQueueEvents) {
  campaignQueueEvents.on('completed', ({ jobId }) => {
    console.log(`✅ Job ${jobId} completed`);
  });

  campaignQueueEvents.on('failed', ({ jobId, failedReason }) => {
    console.error(`❌ Job ${jobId} failed:`, failedReason);
  });
}

/**
 * Graceful shutdown helper
 */
export async function closeQueues(): Promise<void> {
  await Promise.all([
    campaignQueue?.close(),
    campaignWorker?.close(),
    campaignQueueEvents?.close(),
  ]);
}



