import { decimalNumber, parseDecimal } from './decimalNumber';

describe('parseDecimal() util function', () => {
  it('should accept a dot as decimal separator', () => {
    expect(parseDecimal('12.5')).toBe(12.5);
  });

  it('should accept a comma as decimal separator', () => {
    expect(parseDecimal('12,5')).toBe(12.5);
  });

  it('should return undefined for empty input', () => {
    expect(parseDecimal('')).toBeUndefined();
    expect(parseDecimal('  ')).toBeUndefined();
  });

  it('should return NaN for invalid input', () => {
    expect(parseDecimal('abc')).toBeNaN();
    expect(parseDecimal('1,2,3')).toBeNaN();
  });
});

describe('decimalNumber() schema', () => {
  const schema = decimalNumber().required();

  it('should cast comma and dot separated strings to numbers', () => {
    expect(schema.cast('12,34')).toBe(12.34);
    expect(schema.cast('12.34')).toBe(12.34);
    expect(schema.cast(7)).toBe(7);
  });

  it('should reject invalid and empty input', () => {
    expect(schema.isValidSync('abc')).toBeFalsy();
    expect(schema.isValidSync('')).toBeFalsy();
  });
});
