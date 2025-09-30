import { query } from './_generated/server';

export const listStudiosWithPlaceIds = query({
  args: {},
  handler: async (ctx) => {
    const studios = await ctx.db
      .query('studios')
      .filter((q) => q.neq(q.field('googlePlaceId'), null))
      .take(5);

    return studios.map(studio => ({
      name: studio.name,
      googlePlaceId: studio.googlePlaceId,
      city: studio.address.city,
    }));
  },
});