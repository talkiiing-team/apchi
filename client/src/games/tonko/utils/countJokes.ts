import { jokePlaceholder } from '@apchi/games'

export const countJokes = (base: string) =>
  (base.match(new RegExp(jokePlaceholder, 'g')) || []).length
