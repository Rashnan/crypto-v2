export function attemptCalculation<T>(calculate: () => T): { result: T | null; error: string } {
  try {
    return { result: calculate(), error: '' }
  } catch (caught) {
    return { result: null, error: caught instanceof Error ? caught.message : 'Unable to calculate.' }
  }
}
