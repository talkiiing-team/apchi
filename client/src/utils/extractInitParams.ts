export const extractInitParams = (
  hashString: string,
): Record<string, string> => {
  return hashString
    .replace(/^\?/, '')
    .split('&')
    .reduce((a, v) => {
      const [key, value] = v.split('=')
      return { ...a, [key]: value }
    }, {} as Record<string, string>)
}
