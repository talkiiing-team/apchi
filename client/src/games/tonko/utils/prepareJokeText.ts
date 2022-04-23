import { Joke, jokePlaceholder } from '@apchi/games'

export const prepareJokeText = (text: Joke['jokeDraft']): string => {
  return text.replaceAll(jokePlaceholder, '______')
}
