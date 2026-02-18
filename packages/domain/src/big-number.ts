export const LIMB_BASE = 1000;

export type SegmentedNumber = number[];

export function normalizeSegmented(value: SegmentedNumber): SegmentedNumber {
  const result = [...value];
  for (let index = 0; index < result.length; index += 1) {
    const limb = result[index] ?? 0;
    if (limb >= LIMB_BASE) {
      const carry = Math.floor(limb / LIMB_BASE);
      result[index] = limb % LIMB_BASE;
      result[index + 1] = (result[index + 1] ?? 0) + carry;
    }
  }

  while (result.length > 1 && result[result.length - 1] === 0) {
    result.pop();
  }

  return result;
}

export function segmentedFromNumber(input: number): SegmentedNumber {
  if (!Number.isInteger(input) || input < 0) {
    throw new Error("Input must be a non-negative integer");
  }

  if (input === 0) {
    return [0];
  }

  const result: SegmentedNumber = [];
  let remaining = input;

  while (remaining > 0) {
    result.push(remaining % LIMB_BASE);
    remaining = Math.floor(remaining / LIMB_BASE);
  }

  return result;
}

export function addSegmented(
  left: SegmentedNumber,
  right: SegmentedNumber,
): SegmentedNumber {
  const max = Math.max(left.length, right.length);
  const sum: SegmentedNumber = [];

  for (let index = 0; index < max; index += 1) {
    sum[index] = (left[index] ?? 0) + (right[index] ?? 0);
  }

  return normalizeSegmented(sum);
}

export function compareSegmented(
  left: SegmentedNumber,
  right: SegmentedNumber,
): number {
  const normalizedLeft = normalizeSegmented(left);
  const normalizedRight = normalizeSegmented(right);

  if (normalizedLeft.length > normalizedRight.length) {
    return 1;
  }

  if (normalizedLeft.length < normalizedRight.length) {
    return -1;
  }

  for (let index = normalizedLeft.length - 1; index >= 0; index -= 1) {
    if (normalizedLeft[index] > normalizedRight[index]) {
      return 1;
    }

    if (normalizedLeft[index] < normalizedRight[index]) {
      return -1;
    }
  }

  return 0;
}

export function segmentedToString(value: SegmentedNumber): string {
  const normalized = normalizeSegmented(value);
  const [first, ...rest] = [...normalized].reverse();
  return `${first}${rest.map((limb) => limb.toString().padStart(3, "0")).join("")}`;
}
