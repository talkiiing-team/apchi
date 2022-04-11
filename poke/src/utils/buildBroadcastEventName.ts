export const buildBroadcastEventName = (section: string) => (event: string) =>
  `@${section}/${event}`
