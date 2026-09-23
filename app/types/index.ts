export interface Profile {
  id: string
  username: string
  created_at: string
}

export interface Palette {
  id: string
  author_id: string
  name: string
  colors: string[]
  like_count: number
  created_at: string
  // joined from profiles; null only if the author was deleted mid-request
  author: { username: string } | null
}
