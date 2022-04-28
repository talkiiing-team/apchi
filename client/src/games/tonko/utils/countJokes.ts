import { jokePlaceholder } from '@apchi/games/src/tonko'

export const countJokes = (base: string) =>
  (base.match(new RegExp(jokePlaceholder, 'g')) || []).length
