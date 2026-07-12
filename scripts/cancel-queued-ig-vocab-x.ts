/**
 * Cancel queued IG-import X posts so only new vocab-infographic cards go out.
 *   npx tsx scripts/cancel-queued-ig-vocab-x.ts
 */
import { loadEnvLocal } from "./lib/env_local.mjs";
loadEnvLocal(process.cwd());

import { cancelQueuedIgVocabPosts } from "../src/lib/grammarXQueueRepo";

async function main() {
  const n = await cancelQueuedIgVocabPosts();
  console.log(JSON.stringify({ cancelledIgVocab: n }, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
