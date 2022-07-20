export const buildPrefix = (basePrefix: string) => (eventName: string) =>
  `${basePrefix}/${eventName}`
