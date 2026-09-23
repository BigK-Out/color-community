// Route middleware runs before a page loads. Pages opt in with
// definePageMeta({ middleware: 'guest' }). This one keeps logged-in
// users away from /login and /signup.
export default defineNuxtRouteMiddleware(() => {
  const user = useSupabaseUser()
  if (user.value) return navigateTo('/explore')
})
