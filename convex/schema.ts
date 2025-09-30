import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    username: v.string(),
    passHash: v.string(),
    salt: v.string(),
    createdAt: v.number(),
  }).index('by_username', ['username']),

  sessions: defineTable({
    token: v.string(),
    userId: v.id('users'),
    expiresAt: v.number(),
  }).index('by_token', ['token']).index('by_user', ['userId']),

  blog_suggestions: defineTable({
    slug: v.string(),
    title: v.string(),
    category: v.string(),
    keywords: v.array(v.string()),
    source: v.optional(v.string()),
    status: v.string(), // queued | in_review | accepted | completed | declined
    createdAt: v.number(),
  }).index('by_slug', ['slug']).index('by_status', ['status']).index('by_created', ['createdAt']),

  pipeline_jobs: defineTable({
    type: v.string(), // single | batch
    slugs: v.array(v.string()),
    status: v.string(), // queued | running | done | error
    stages: v.optional(v.any()),
    logs: v.optional(v.array(v.string())),
    error: v.optional(v.string()),
    createdAt: v.number(),
    startedAt: v.optional(v.number()),
    finishedAt: v.optional(v.number()),
  }).index('by_status', ['status']).index('by_created', ['createdAt']),

  blog_images: defineTable({
    slug: v.string(),
    heroStorageId: v.optional(v.id('_storage')), // Convex storage file id
    sectionStorageIds: v.optional(v.array(v.id('_storage'))),
    updatedAt: v.number(),
  }).index('by_slug', ['slug']).index('by_updated', ['updatedAt']),

  app_settings: defineTable({
    key: v.string(),
    valueEnc: v.string(),
    updatedAt: v.number(),
  }).index('by_key', ['key']),

  keywords: defineTable({
    term: v.string(),
    category: v.string(),
    usageCount: v.number(),
    lastUsed: v.optional(v.number()),
  }).index('by_term', ['term']).index('by_category', ['category']),
});

