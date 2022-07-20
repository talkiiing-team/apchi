export const handlerRestrictUnauthorized = (
  reject: (...reason: any[]) => any,
) => reject({ reason: 'UNAUTHORIZED' })
