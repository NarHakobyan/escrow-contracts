export function env(key: string): string {
  const value = process.env[key];
  if (value === undefined) {
    throw new Error(`env: ${key} is not defined`);
  }
  return value;
}
