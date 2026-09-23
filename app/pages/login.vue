<script setup lang="ts">
// definePageMeta sets options for this route — here, run middleware/guest.ts first.
definePageMeta({ middleware: 'guest' })
useHead({ title: 'Log in · COLOR' })

const client = useSupabaseClient()
const route = useRoute()
const { back } = useAuthRedirect()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const busy = ref(false)

async function submit() {
  busy.value = true
  error.value = ''
  const { error: e } = await client.auth.signInWithPassword({ email: email.value, password: password.value })
  busy.value = false
  if (!e) return back()
  error.value = e.message === 'Invalid login credentials'
    ? 'That email and password don’t match an account.'
    : e.message
}
</script>

<template>
  <div class="container auth-page">
    <AuthCard title="Log in" lede="Log in to publish palettes and heart other people’s.">
      <!-- v-model links an input to a ref both ways: typing updates email, and vice versa -->
      <form @submit.prevent="submit">
        <div class="field">
          <label for="email">Email</label>
          <input id="email" v-model="email" class="input" type="email" autocomplete="email" required>
        </div>
        <div class="field">
          <label for="password">Password</label>
          <div class="affix">
            <input
              id="password"
              v-model="password"
              class="input"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              required
            >
            <button type="button" class="affix__after" :aria-pressed="showPassword" @click="showPassword = !showPassword">
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
        </div>
        <p v-if="error" class="form-error" role="alert">{{ error }}</p>
        <button type="submit" class="btn btn--big" :disabled="busy">{{ busy ? 'Logging in…' : 'Log in' }}</button>
      </form>
      <p class="auth-card__switch">
        No account yet? <NuxtLink :to="{ path: '/signup', query: route.query }">Sign up</NuxtLink>
      </p>
    </AuthCard>
  </div>
</template>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  padding-top: 4.5rem;
  padding-bottom: 6rem;
}

@media (max-width: 820px) {
  .auth-page {
    padding-top: 2.5rem;
  }
}
</style>
