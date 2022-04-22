export const jokePlaceholder = '%JOKE%'

export type Joke = {
  id: string
  jokeDraft: string
  answers?: readonly string[]
}
