import { describe, expect, it } from 'vitest';
import { filterRows } from './filter-rows';

const ROWS = [
  { id: 1, name: 'Ana', description: 'Socio principal' },
  { id: 2, name: 'Samuel', description: null },
  { id: 3, name: 'María', description: 'Ahorros' },
];

const pick = (row: (typeof ROWS)[number]) => [
  row.id,
  row.name,
  row.description,
];

describe('filterRows', () => {
  it('should return a copy when the query is empty', () => {
    const result = filterRows(ROWS, '', pick);

    expect(result).toEqual(ROWS);
    expect(result).not.toBe(ROWS);
  });

  it('should return a copy when the query contains only spaces', () => {
    const result = filterRows(ROWS, '   ', pick);

    expect(result).toEqual(ROWS);
    expect(result).not.toBe(ROWS);
  });

  it('should match text without case sensitivity', () => {
    expect(filterRows(ROWS, 'ANA', pick)).toEqual([ROWS[0]]);
  });

  it('should safely handle null values', () => {
    expect(filterRows(ROWS, 'samuel', pick)).toEqual([ROWS[1]]);
  });

  it('should return an empty array when there are no matches', () => {
    expect(filterRows(ROWS, 'inexistente', pick)).toEqual([]);
  });
});
