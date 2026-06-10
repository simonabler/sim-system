export type SortDirection = 'asc' | 'desc';

export interface SortState<K extends string> {
  key: K | null;
  direction: SortDirection | null;
}

export type SortValue = string | number | boolean | Date | null | undefined;

export function nextSortState<K extends string>(current: SortState<K>, key: K): SortState<K> {
  if (current.key !== key) {
    return { key, direction: 'asc' };
  }

  if (current.direction === 'asc') {
    return { key, direction: 'desc' };
  }

  return { key: null, direction: null };
}

export function sortItems<T, K extends string>(
  items: readonly T[],
  state: SortState<K>,
  selectors: Record<K, (item: T) => SortValue>,
): T[] {
  if (!state.key || !state.direction) {
    return [...items];
  }

  const selector = selectors[state.key];
  const direction = state.direction === 'asc' ? 1 : -1;

  return [...items].sort((a, b) => compareValues(selector(a), selector(b)) * direction);
}

export function compareValues(a: SortValue, b: SortValue): number {
  const aEmpty = isEmpty(a);
  const bEmpty = isEmpty(b);

  if (aEmpty && bEmpty) {
    return 0;
  }
  if (aEmpty) {
    return 1;
  }
  if (bEmpty) {
    return -1;
  }

  const aDate = toTime(a);
  const bDate = toTime(b);
  if (aDate !== null && bDate !== null) {
    return aDate - bDate;
  }

  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }

  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return Number(a) - Number(b);
  }

  return String(a).localeCompare(String(b), 'de-AT', {
    sensitivity: 'base',
    numeric: true,
  });
}

export function sortIcon<K extends string>(state: SortState<K>, key: K): string {
  if (state.key !== key || !state.direction) {
    return '↕';
  }

  return state.direction === 'asc' ? '↑' : '↓';
}

export function ariaSort<K extends string>(state: SortState<K>, key: K): 'none' | 'ascending' | 'descending' {
  if (state.key !== key || !state.direction) {
    return 'none';
  }

  return state.direction === 'asc' ? 'ascending' : 'descending';
}

function isEmpty(value: SortValue): boolean {
  return value == null || value === '';
}

function toTime(value: SortValue): number | null {
  if (value instanceof Date) {
    const time = value.getTime();
    return Number.isNaN(time) ? null : time;
  }

  if (typeof value !== 'string' || !looksLikeDate(value)) {
    return null;
  }

  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
}

function looksLikeDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}/.test(value) || /^\d{4}-\d{2}-\d{2}T/.test(value);
}
