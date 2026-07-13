/** Race a promise against a timeout; returns fallback on timeout or error. */
export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  fallback: T
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]).catch(() => fallback);
}
