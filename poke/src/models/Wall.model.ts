export enum ContentType {
  Text = 'text',
  Picture = 'picture',
}

export type ContentMap<T extends ContentType> = T extends ContentType.Text
  ? { text: string }
  : T extends ContentType.Picture
  ? { url: string }
  : never

export type WallPost<T extends ContentType = ContentType> = {
  author: {
    id: number
  }
  target: number
  content: {
    type: T
    data: ContentMap<T>
  }
  id: number
}

export const primaryKey = 'id'
