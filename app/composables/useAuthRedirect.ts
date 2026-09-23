// Helpers for "log in, then come back here".

/** Only allow same-site paths, so ?redirect= can't bounce people to another site. */
export function safeRedirect(value: unknown, fallback = '/explore'): string {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')
    ? value
    : fallback
}

export function useAuthRedirect() {
  const route = useRoute()

  /** Send a logged-out user to /login, remembering the current page. */
  function toLogin() {
    return navigateTo({ path: '/login', query: { redirect: route.fullPath } })
  }

  /** After logging in: back to wherever they came from. */
  function back() {
    return navigateTo(safeRedirect(route.query.redirect))
  }

  return { toLogin, back }
}
