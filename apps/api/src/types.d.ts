export type Env = {
  DB: D1Database;
  GITHUB_REPO?: string;
  GITHUB_BRANCH?: string;
  GITHUB_TOKEN?: string;
  BUILD_HOOK_URL?: string;
  PIPELINE: Queue<unknown>;
};

