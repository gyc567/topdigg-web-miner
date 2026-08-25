/**
 * Wrapper for fast CI build: sets PRERENDER_SKIP_ARCHIVE=1 then chains the
 * full build pipeline. Used by `npm run build:fast`.
 *
 * Why a wrapper instead of inline env var?
 *   - Cross-platform: works on macOS/Linux (POSIX) and Windows (cmd) without
 *     pulling in cross-env as a dependency.
 *   - Single source of truth for the env-var name; PR builds can grep for it.
 *
 * To override the archive cutoff window, set PRERENDER_SKIP_ARCHIVE_DAYS.
 */
import { spawnSync } from "node:child_process";

const extraEnv = {
  ...process.env,
  PRERENDER_SKIP_ARCHIVE: "1",
};

const result = spawnSync("npm", ["run", "build"], {
  stdio: "inherit",
  env: extraEnv,
  shell: true,
});

process.exit(result.status ?? 1);