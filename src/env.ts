export function getEnv(key: string): string | undefined {
  return process.env[key];
}

export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!!value) {
    return value;
  }
  throw new Error(`Requires env variable "${key}"`);
}

export const gitHubEnv = {
  get workspace(): string {
    return requireEnv('GITHUB_WORKSPACE');
  },
};
