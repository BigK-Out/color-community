// Which palettes the logged-in user has liked, shared by every LikeButton.
// useState() is Nuxt's app-wide reactive state: every component that calls
// useState('my-likes') gets the same array.

export function useMyLikes() {
  const ids = useState<string[]>('my-likes', () => [])
  const api = usePalettes()

  async function load() {
    try {
      ids.value = await api.myLikedIds()
    }
    catch {
      ids.value = [] // hearts just show as empty; liking still works
    }
  }

  const has = (id: string) => ids.value.includes(id)

  function set(id: string, liked: boolean) {
    ids.value = liked ? [...ids.value, id] : ids.value.filter(x => x !== id)
  }

  return { ids, load, has, set }
}
