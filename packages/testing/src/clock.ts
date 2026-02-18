export interface TestClock {
  now: () => number;
  advanceMs: (ms: number) => void;
}

export function createTestClock(startMs = 1_700_000_000_000): TestClock {
  let current = startMs;
  return {
    now: () => current,
    advanceMs: (ms: number) => {
      current += ms;
    },
  };
}
