<script setup lang="ts">
// definePageMeta sets options for this route — here, run middleware/guest.ts first.
definePageMeta({ middleware: 'guest' })
useHead({ title: 'Log in · COLOR' })

const client = useSupabaseClient()
const route = useRoute()
const { back } = useAuthRedirect()

const email = ref('')
const password = ref('')
const error = ref('')
const busy = ref(false)

async function submit() {
  busy.value = true
  error.value = ''
  const { error: e } = await client.auth.signInWithPassword({ email: email.value, password: password.value })
  busy.value = false
  if (e) error.value = e.message
  else await back()
}
</script>

<template>
  <div class="container auth">
    <h1 class="page-title">Log in</h1>
    <!-- v-model links an input to a ref both ways: typing updates email, and vice versa -->
    <form class="auth__form card-stock" @submit.prevent="submit">
      <div class="field">
        <label for="email">Email</label>
        <input id="email" v-model="email" class="input" type="email" autocomplete="email" required>
      </div>
      <div class="field">
        <label for="password">Password</label>
        <input id="password" v-model="password" class="input" type="password" autocomplete="current-password" required>
      </div>
      <p v-if="error" class="form-error">{{ error }}</p>
      <button class="btn" :disabled="busy">{{ busy ? 'Logging in…' : 'Log in' }}</button>
    </form>
    <p class="auth__switch">
      No account yet? <NuxtLink :to="{ path: '/signup', query: route.query }">Sign up</NuxtLink>
    </p>
  </div>
</template>

<style>
/* Shared with signup.vue */
.auth {
  max-width: 420px;
  padding-bottom: 5rem;
}

.auth__form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.75rem;
}

.auth__switch {
  margin-top: 1.5rem;
  color: var(--on-board-soft);
}

.auth__switch a {
  color: var(--ink);
  font-weight: 700;
}
</style>
