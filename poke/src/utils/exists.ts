export const exists = <T>(undefinable: T | undefined): undefinable is T =>
  undefinable !== undefined
