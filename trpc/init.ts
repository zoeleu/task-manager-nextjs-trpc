import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { tasks } from '@/server/store';

/**
 * Here we initialize the context for every request that goes
 * through tRPC. It's used, for example, to hold data about user
 * authentication, or about our database connection.
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
    // This is where we would implement a mechanism to authenticate
    // requests, for a more complete application.
    return { tasks };
};

// It's better for us to export the items from `t`,
// since `t` isn't a very descriptive name,
// and `t` is also used by other libraries
// such as i18n.
const t = initTRPC
    .context<Awaited<ReturnType<typeof createTRPCContext>>>()
    .create({
        /**
         * @see https://trpc.io/docs/server/data-transformers
         * Useful for passing `Date`, `Map`, and other JS
         * data structures.
         */
        transformer: superjson,
    });

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;