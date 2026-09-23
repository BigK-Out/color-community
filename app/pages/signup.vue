<script setup lang="ts">
definePageMeta({ middleware: 'guest' })
useHead({ title: 'Sign up · COLOR' })

const client = useSupabaseClient()
const route = useRoute()
const api = usePalettes()
const { back } = useAuthRedirect()

const USERNAME = /^[a-z0-9_]{3,20}$/

const username = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const busy = ref(false)
const checkInbox = ref(false)

async function submit() {
  const name = username.value.trim().toLowerCase()
  error.value = ''
  if (!USERNAME.test(name)) {
    error.value = 'Usernames are 3–20 characters: lowercase letters, numbers and _.'
    return
  }

  busy.value = true
  try {
    if (await api.usernameTaken(name)) {
      error.value = 'That username is taken. Try another.'
      return
    }

    // The username rides along as metadata; a database trigger turns it
    // into a row in the profiles table (see supabase/migrations/).
    const { data, error: e } = await client.auth.signUp({
      email: email.value,
      password: password.value,
      options: { data: { username: name } },
    })

    if (e) {
      // The trigger failing (someone grabbed the name a moment ago) surfaces as this.
      error.value = e.message.includes('Database error saving new user')
        ? 'Someone took that username a moment ago. Try another.'
        : e.message
      return
    }

    // With "Confirm email" on in Supabase there's no session until they click the link.
    if (!data.session) checkInbox.value = true
    else await back()
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : 'Something went wrong.'
  }
  finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="container auth">
    <h1 class="page-title">Sign up</h1>

    <p v-if="checkInbox" class="auth__inbox card-stock">
      Almost there — we sent a link to <strong>{{ email }}</strong>. Click it, then
      <NuxtLink :to="{ path: '/login', query: route.query }">log in</NuxtLink>.
    </p>

    <template v-else>
      <form class="auth__form card-stock" @submit.prevent="submit">
        <div class="field">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="username"
            class="input"
            autocomplete="username"
            maxlength="20"
            placeholder="lowercase, 3–20 characters"
            required
          >
        </div>
        <div class="field">
          <label for="email">Email</label>
          <input id="email" v-model="email" class="input" type="email" autocomplete="email" required>
        </div>
        <div class="field">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            class="input"
            type="password"
            autocomplete="new-password"
            minlength="6"
            placeholder="at least 6 characters"
            required
          >
        </div>
        <p v-if="error" class="form-error">{{ error }}</p>
        <button class="btn" :disabled="busy">{{ busy ? 'Creating account…' : 'Sign up' }}</button>
      </form>
      <p class="auth__switch">
        Have an account? <NuxtLink :to="{ path: '/login', query: route.query }">Log in</NuxtLink>
      </p>
    </template>
  </div>
</template>

<style scoped>
.auth__inbox {
  font-size: 1.15rem;
  padding: 1.75rem;
}
</style>
