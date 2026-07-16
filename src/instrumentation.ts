/**
 * Next.js server boot — register Mongo shutdown handlers early so SIGINT/SIGTERM
 * close the shared client even if no route has opened Mongo yet this boot.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { registerMongoShutdownHandlers } = await import("@/lib/mongoShutdown");
  registerMongoShutdownHandlers();
}
