/** Chạy async map có giới hạn song song (dùng cho tải tối đa 6 logo, 3 CSS...). */
export async function mapLimit<T, R>(
  items: readonly T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<(R | undefined)[]> {
  const results: (R | undefined)[] = new Array(items.length).fill(undefined);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(Math.max(1, limit), items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      try {
        results[index] = await worker(items[index]!, index);
      } catch {
        results[index] = undefined;
      }
    }
  });
  await Promise.all(runners);
  return results;
}

export async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
