import { expect, test } from 'vitest';
import { getCachedNumberFormat, numberFormatCache } from '../../app/utils/number-format-cache';

test('getCachedNumberFormat caches and reuses formatters', () => {
  numberFormatCache.clear();

  const formatter1 = getCachedNumberFormat('en-US', { style: 'currency', currency: 'USD' });
  const formatter2 = getCachedNumberFormat('en-US', { style: 'currency', currency: 'USD' });

  expect(formatter1).toBe(formatter2);
  expect(numberFormatCache.size).toBe(1);

  const formatter3 = getCachedNumberFormat('bn-BD', { style: 'currency', currency: 'BDT' });
  expect(formatter3).not.toBe(formatter1);
  expect(numberFormatCache.size).toBe(2);
});
