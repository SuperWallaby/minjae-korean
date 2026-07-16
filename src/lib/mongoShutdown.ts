/**
 * Process shutdown hooks — no top-level `mongodb` import so instrumentation
 * can register handlers without pulling Node-only deps into the client bundle.
 */

type GlobalWithMongo = typeof globalThis & {
  __mjMongoShutdownRegistered?: boolean;
};

/** Attach process listeners once (no-op on Edge). */
export function registerMongoShutdownHandlers(): void {
  const g = globalThis as GlobalWithMongo;
  if (g.__mjMongoShutdownRegistered) return;
  if (typeof process === "undefined" || typeof process.on !== "function") {
    return;
  }
  if (process.env.NEXT_RUNTIME === "edge") return;

  g.__mjMongoShutdownRegistered = true;

  const shutdown = () => {
    void import(/* webpackIgnore: true */ "@/lib/mongo").then(({ closeMongoClient }) =>
      closeMongoClient(),
    );
  };

  // Do not process.exit here — Next.js / the host own the lifecycle.
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  process.on("beforeExit", shutdown);
}
