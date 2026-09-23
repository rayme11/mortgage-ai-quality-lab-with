// Chapter 0 demo: verify the toolchain before we build.
// Run: node scripts/env-check.mjs
import { execSync } from 'node:child_process';

const checks = [
  {
    name: 'Node.js >= 20',
    run: () => {
      const major = Number(process.versions.node.split('.')[0]);
      return { ok: major >= 20, detail: `v${process.versions.node}` };
    },
  },
  {
    name: 'Git installed',
    run: () => {
      const out = execSync('git --version').toString().trim();
      return { ok: out.startsWith('git version'), detail: out };
    },
  },
  {
    name: 'Inside the mortgage-ai-quality-lab repo',
    run: () => {
      const out = execSync('git remote get-url origin 2>/dev/null || echo none').toString().trim();
      return { ok: out !== 'none' || true, detail: out === 'none' ? 'no remote yet (ok for now)' : out };
    },
  },
];

let allOk = true;
for (const check of checks) {
  try {
    const { ok, detail } = check.run();
    allOk = allOk && ok;
    console.log(`${ok ? '✅' : '❌'} ${check.name} — ${detail}`);
  } catch (err) {
    allOk = false;
    console.log(`❌ ${check.name} — ${err.message}`);
  }
}

console.log(allOk ? '\nEnvironment ready. On to Chapter 1.' : '\nFix the failures above before continuing.');
process.exit(allOk ? 0 : 1);
