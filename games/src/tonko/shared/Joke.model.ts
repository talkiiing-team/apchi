export const jokePlaceholder = '%JOKE%'

export type JokeDraft = {
  incompleteText: string
}

export type JokeCommit = {
  jokeDraft: JokeDraft
  answers: readonly string[]
}
