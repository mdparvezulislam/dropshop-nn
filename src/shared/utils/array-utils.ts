export function chunk<T>(array: T[], size: number): T[][] {
  const chunked: T[][] = [];
  let index = 0;
  while (index < array.length) {
    chunked.push(array.slice(index, index + size));
    index += size;
  }
  return chunked;
}

export function groupBy<T, K extends string | number | symbol>(
  array: T[],
  getKey: (item: T) => K,
): Record<K, T[]> {
  return array.reduce(
    (accumulator, item) => {
      const key = getKey(item);
      if (!accumulator[key]) {
        accumulator[key] = [];
      }
      accumulator[key].push(item);
      return accumulator;
    },
    {} as Record<K, T[]>,
  );
}

export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}
