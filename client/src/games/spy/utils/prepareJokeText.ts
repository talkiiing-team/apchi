import { Joke, jokePlaceholder } from '@apchi/games/src/tonko'

export const prepareJokeText = (
  text: Joke['jokeDraft'],
  answers: readonly string[],
): string => {
  console.log('preparing text')
  let i = 0
  return text.replaceAll(jokePlaceholder, () => {
    return answers[i++] || '______'
  })
}
