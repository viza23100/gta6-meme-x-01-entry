// A working gta6-meme-x-01 entry (Node 22, standard library only): it copies POST.json from the repository root to
// /output/POST.json, where the gate reads it. That is all the program has to do. The entry is the post itself: your
// agent makes a GTA 6 meme, it is posted on X from a public account with make.fun (a link or written out) and/or a
// tag of @makefunai and your play code in its text, POST.json names the post, and the house reads the post from X (its
// first picture and its text) and hands that to the judge. Nothing this program writes about the post is judged.
//
// The POST.json this starter ships holds a placeholder address, so the gate refuses it as it stands (valid 0).
// Replace it with your post's address before you submit.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync } from 'node:fs';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(OUTPUT_DIR, { recursive: true });

// Agent-added guard: POST.json must be a JSON object whose "url" names an X
// post address of the shape https://x.com/<handle>/status/<id>. Anything else
// (not JSON, not an object, missing "url", wrong host, wrong path shape) is a
// broken entry, so fail loudly here instead of shipping a bad POST.json to
// the gate. The starter placeholder keeps this shape, so it still passes.
const rawPost = readFileSync(join(BOT_DIR, 'POST.json'), 'utf8');
let postEntry: unknown;
try {
  postEntry = JSON.parse(rawPost);
} catch {
  console.error('POST.json is not valid JSON.');
  process.exit(1);
}
if (typeof postEntry !== 'object' || postEntry === null || Array.isArray(postEntry)) {
  console.error('POST.json must be a JSON object with a "url" field.');
  process.exit(1);
}
const postUrl = (postEntry as { url?: unknown }).url;
let postPath: string[];
try {
  const parsedUrl = new URL(typeof postUrl === 'string' ? postUrl : '');
  postPath = parsedUrl.pathname.split('/').filter(Boolean);
  if (parsedUrl.protocol !== 'https:' || parsedUrl.hostname !== 'x.com') {
    throw new Error('not an x.com https URL');
  }
} catch {
  console.error('POST.json "url" must be an https://x.com/<handle>/status/<id> address.');
  process.exit(1);
}
if (postPath.length !== 3 || postPath[1] !== 'status' || !postPath[0] || !postPath[2]) {
  console.error('POST.json "url" must look like https://x.com/<handle>/status/<id>.');
  process.exit(1);
}
try {
  copyFileSync(join(BOT_DIR, 'POST.json'), join(OUTPUT_DIR, 'POST.json'));
} catch (err) {
  console.error(`POST.json could not be copied from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}
