import { MutationCtx, QueryCtx } from '../_generated/server';
import { Id } from '../_generated/dataModel';

type Ctx = QueryCtx | MutationCtx;

export async function getAdminUserId(ctx: Ctx, token: string): Promise<Id<'users'> | null> {
  if (!token) return null;

  const session = await ctx.db
    .query('sessions')
    .withIndex('by_token', (q) => q.eq('token', token))
    .unique();

  if (!session) return null;

  const now = Math.floor(Date.now() / 1000);
  if (session.expiresAt < now) return null;

  const user = await ctx.db.get(session.userId);
  if (!user) return null;

  return session.userId;
}

