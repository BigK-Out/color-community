<script setup lang="ts">
import type { Palette } from '~/types'

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
const showPassword = ref(false)
const error = ref('')
const busy = ref(false)
const checkInbox = ref(false)

// Usernames are lowercase with no spaces, so fix them as they're typed.
function onUsernameInput(e: Event) {
  const input = e.target as HTMLInputElement
  username.value = input.value.toLowerCase().replace(/\s+/g, '')
  input.value = username.value
}

// ─── Live "is this name free?" check ───
type NameStatus = 'idle' | 'short' | 'bad-chars' | 'checking' | 'free' | 'taken' | 'unknown'
const nameStatus = ref<NameStatus>('idle')
let checkTimer: ReturnType<typeof setTimeout> | undefined

watch(username, (name) => {
  clearTimeout(checkTimer)
  if (!name) return (nameStatus.value = 'idle')
  if (/[^a-z0-9_]/.test(name)) return (nameStatus.value = 'bad-chars')
  if (!USERNAME.test(name)) return (nameStatus.value = 'short')
  nameStatus.value = 'checking'
  // Wait until typing pauses, so we don't query on every keystroke.
  checkTimer = setTimeout(async () => {
    try {
      const taken = await api.usernameTaken(name)
      if (username.value === name) nameStatus.value = taken ? 'taken' : 'free'
    }
    catch {
      nameStatus.value = 'unknown'
    }
  }, 350)
})
onBeforeUnmount(() => clearTimeout(checkTimer))

const nameHint = computed(() => {
  const name = username.value
  switch (nameStatus.value) {
    case 'bad-chars': return { text: 'Only lowercase letters, numbers and _.', tone: 'bad' }
    case 'short': return { text: name.length < 3 ? 'At least 3 characters.' : 'At most 20 characters.', tone: '' }
    case 'checking': return { text: 'Checking…', tone: '' }
    case 'free': return { text: `@${name} is free.`, tone: 'good' }
    case 'taken': return { text: `@${name} is taken. Try another.`, tone: 'bad' }
    case 'unknown': return { text: 'Couldn’t check that name. You can still try it.', tone: '' }
    default: return { text: 'Lowercase letters, numbers and _. 3–20 characters.', tone: '' }
  }
})

// ─── The preview chip: its colours come from the username ───
const previewName = computed(() => username.value || 'you')
const preview = computed<Palette>(() => ({
  id: 'preview',
  author_id: '',
  name: 'Your first palette',
  colors: paletteFromText(previewName.value),
  like_count: 0,
  created_at: '',
  author: { username: previewName.value },
}))

async function submit() {
  const name = username.value
  error.value = ''
  if (!USERNAME.test(name)) {
    error.value = 'Usernames are 3–20 characters: lowercase letters, numbers and _.'
    return
  }

  busy.value = true
  try {
    if (await api.usernameTaken(name)) {
      nameStatus.value = 'taken'
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
    error.value = e instanceof Error ? e.message : 'Signing up failed. Check your connection and try again.'
  }
  finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="container auth-page">
    <AuthCard
      v-if="checkInbox"
      title="Check your inbox"
      :lede="`We sent a link to ${email}. Click it to finish signing up, then log in.`"
    >
      <NuxtLink :to="{ path: '/login', query: route.query }" class="btn btn--big inbox-btn">Log in</NuxtLink>
    </AuthCard>

    <AuthCard v-else title="Sign up" lede="Pick a username. It’s printed on every palette you publish.">
      <form @submit.prevent="submit">
        <div class="field">
          <label for="username">Username</label>
          <div class="affix">
            <span class="affix__before" aria-hidden="true">@</span>
            <input
              id="username"
              :value="username"
              class="input"
              autocomplete="username"
              autocapitalize="none"
              spellcheck="false"
              maxlength="20"
              required
              aria-describedby="username-hint"
              @input="onUsernameInput"
            >
          </div>
          <p id="username-hint" class="field__hint" :class="nameHint.tone && `is-${nameHint.tone}`" aria-live="polite">
            {{ nameHint.text }}
          </p>
        </div>

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
              autocomplete="new-password"
              minlength="6"
              required
              aria-describedby="password-hint"
            >
            <button
              type="button"
              class="affix__after"
              :aria-pressed="showPassword"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
          <p id="password-hint" class="field__hint">At least 6 characters.</p>
        </div>

        <p v-if="error" class="form-error" role="alert">{{ error }}</p>
        <button type="submit" class="btn btn--big" :disabled="busy || nameStatus === 'taken'">
          {{ busy ? 'Creating your account…' : 'Sign up' }}
        </button>
      </form>

      <p class="auth-card__switch">
        Already have an account? <NuxtLink :to="{ path: '/login', query: route.query }">Log in</NuxtLink>
      </p>
    </AuthCard>

    <aside v-if="!checkInbox" class="auth-page__preview" aria-label="Preview of your palettes">
      <PaintChip :palette="preview" sample :tilt="4" />
      <p>Your name goes on every chip you hang. These colors come from your username, so try a few.</p>
    </aside>
  </div>
</template>

<style scoped>
.auth-page {
  display: grid;
  grid-template-columns: minmax(0, 460px) 250px;
  justify-content: center;
  align-items: start;
  gap: 5rem;
  padding-top: 4.5rem;
  padding-bottom: 6rem;
}

.auth-page__preview {
  padding-top: 3rem;
}

.auth-page__preview p {
  margin-top: 2rem;
  padding: 14px 16px;
  color: var(--ink-soft);
  background: var(--card);
  border-radius: var(--radius);
  box-shadow: var(--hang-shadow);
}

.inbox-btn {
  margin-top: 2rem;
}

@media (max-width: 820px) {
  .auth-page {
    grid-template-columns: minmax(0, 460px);
    gap: 3rem;
    padding-top: 2.5rem;
  }

  .auth-page__preview {
    padding-top: 0;
    width: 230px;
  }
}
</style>
