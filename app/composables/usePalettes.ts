import type { Palette, Profile } from '~/types'

// Composables are functions whose name starts with "use". Nuxt auto-imports
// anything in app/composables/, and they can call other composables such as
// useSupabaseClient(). Every Supabase query in the app lives in this file.

export const PAGE_SIZE = 24

export type FeedSort = 'new' | 'popular'

// "author:profiles!…(username)" follows the author_id foreign key and nests
// the author's username inside each palette. The key has to be named:
// palettes also reach profiles through likes, so plain "profiles" is ambiguous.
const PALETTE_FIELDS = 'id, author_id, name, colors, like_count, created_at, author:profiles!palettes_author_id_fkey(username)'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function usePalettes() {
  const client = useSupabaseClient()
  const user = useSupabaseUser()

  function requireUserId(): string {
    const id = user.value?.sub
    if (!id) throw new Error('You need to be logged in.')
    return id
  }

  async function feed(sort: FeedSort, page = 0, limit = PAGE_SIZE): Promise<Palette[]> {
    let query = client.from('palettes').select(PALETTE_FIELDS)
    query = sort === 'popular'
      ? query.order('like_count', { ascending: false }).order('created_at', { ascending: false })
      : query.order('created_at', { ascending: false })
    const from = page * limit
    const { data, error } = await query.range(from, from + limit - 1)
    if (error) throw error
    return data as unknown as Palette[]
  }

  async function byId(id: string): Promise<Palette | null> {
    if (!UUID.test(id)) return null // Postgres would error on a malformed uuid
    const { data, error } = await client.from('palettes').select(PALETTE_FIELDS).eq('id', id).maybeSingle()
    if (error) throw error
    return data as unknown as Palette | null
  }

  async function byAuthor(authorId: string): Promise<Palette[]> {
    const { data, error } = await client
      .from('palettes')
      .select(PALETTE_FIELDS)
      .eq('author_id', authorId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as unknown as Palette[]
  }

  async function likedBy(userId: string): Promise<Palette[]> {
    const { data, error } = await client
      .from('likes')
      .select(`palette:palettes(${PALETTE_FIELDS})`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data as unknown as { palette: Palette | null }[])
      .map(row => row.palette)
      .filter((p): p is Palette => p !== null)
  }

  async function profileByUsername(username: string): Promise<Profile | null> {
    const { data, error } = await client
      .from('profiles')
      .select('id, username, created_at')
      .eq('username', username.toLowerCase())
      .maybeSingle()
    if (error) throw error
    return data as Profile | null
  }

  async function usernameTaken(username: string): Promise<boolean> {
    return (await profileByUsername(username)) !== null
  }

  /** Ids of every palette the current user has liked. */
  async function myLikedIds(): Promise<string[]> {
    const id = user.value?.sub
    if (!id) return []
    const { data, error } = await client.from('likes').select('palette_id').eq('user_id', id)
    if (error) throw error
    return (data as { palette_id: string }[]).map(row => row.palette_id)
  }

  async function publish(name: string, colors: string[]): Promise<string> {
    const { data, error } = await client
      .from('palettes')
      .insert({ author_id: requireUserId(), name: name.trim(), colors })
      .select('id')
      .single()
    if (error) throw error
    return (data as { id: string }).id
  }

  async function remove(id: string): Promise<void> {
    const { error } = await client.from('palettes').delete().eq('id', id)
    if (error) throw error
  }

  async function like(paletteId: string): Promise<void> {
    const { error } = await client.from('likes').insert({ user_id: requireUserId(), palette_id: paletteId })
    // 23505 = already liked (e.g. double click in two tabs) — that's fine
    if (error && error.code !== '23505') throw error
  }

  async function unlike(paletteId: string): Promise<void> {
    const { error } = await client
      .from('likes')
      .delete()
      .eq('user_id', requireUserId())
      .eq('palette_id', paletteId)
    if (error) throw error
  }

  return {
    feed, byId, byAuthor, likedBy, profileByUsername, usernameTaken,
    myLikedIds, publish, remove, like, unlike,
  }
}
