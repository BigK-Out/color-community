<script setup lang="ts">
// The shop sign across the top. Files in app/components/ are auto-imported:
// <NavBar /> works anywhere without an import.

const user = useSupabaseUser()
const client = useSupabaseClient()
const route = useRoute()

// ref() makes a reactive value; the template re-renders when it changes.
const menuOpen = ref(false)

// The username was stored in the account's metadata at sign-up.
const username = computed(() => (user.value?.user_metadata as { username?: string } | undefined)?.username)

// Close the mobile menu whenever the page changes.
watch(() => route.fullPath, () => (menuOpen.value = false))

async function logOut() {
  await client.auth.signOut()
  await navigateTo('/')
}
</script>

<template>
  <header class="sign">
    <nav class="sign__inner container" aria-label="Main">
      <NuxtLink to="/" class="sign__mark">COLOR</NuxtLink>

      <button
        class="sign__toggle"
        :class="{ 'is-open': menuOpen }"
        :aria-expanded="menuOpen"
        aria-controls="main-menu"
        aria-label="Menu"
        @click="menuOpen = !menuOpen"
      >
        <span /><span /><span />
      </button>

      <ul id="main-menu" class="sign__menu" :class="{ 'is-open': menuOpen }">
        <li><NuxtLink to="/explore" class="sign__link">The rack</NuxtLink></li>
        <li><NuxtLink to="/generate" class="sign__link">Mix a palette</NuxtLink></li>

        <!-- v-if / v-else: render one block or the other -->
        <template v-if="user">
          <li v-if="username">
            <NuxtLink :to="`/u/${username}`" class="sign__link">@{{ username }}</NuxtLink>
          </li>
          <li><button class="sign__link sign__logout" @click="logOut">Log out</button></li>
        </template>
        <template v-else>
          <li><NuxtLink to="/login" class="sign__link">Log in</NuxtLink></li>
          <li><NuxtLink to="/signup" class="sign__cta">Sign up</NuxtLink></li>
        </template>
      </ul>
    </nav>
  </header>
</template>

<!-- "scoped" styles only apply to this component's own HTML -->
<style scoped>
.sign {
  position: sticky;
  top: 0;
  z-index: 100;
  height: var(--nav-height);
  background: var(--brand);
  color: #fff;
  box-shadow: 0 4px 0 var(--brand-deep), 0 10px 18px -8px rgb(40 20 0 / 0.5);
}

.sign__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.sign__mark {
  font-size: 2rem;
  font-weight: 900;
  font-stretch: 125%;
  letter-spacing: 0.02em;
  text-decoration: none;
}

.sign__menu {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  list-style: none;
}

.sign__link {
  display: inline-block;
  padding: 8px 14px;
  font-weight: 600;
  text-decoration: none;
  text-underline-offset: 6px;
  text-decoration-thickness: 3px;
  background: none;
  border: none;
  cursor: pointer;
}

.sign__link:hover,
.sign__link.router-link-active {
  text-decoration-line: underline;
}

.sign__logout {
  opacity: 0.8;
}

.sign__cta {
  margin-left: 0.5rem;
  display: inline-flex;
  align-items: center;
  min-height: 42px;
  padding: 0 18px;
  background: #fff;
  color: var(--brand);
  font-weight: 800;
  border-radius: var(--radius);
  text-decoration: none;
  box-shadow: inset 0 -3px 0 #c9d2f2;
}

.sign__toggle {
  display: none;
  width: 44px;
  height: 44px;
  background: none;
  border: none;
  cursor: pointer;
}

.sign__toggle span {
  display: block;
  width: 24px;
  height: 3px;
  margin: 5px auto;
  background: #fff;
  transition: transform 0.25s ease, opacity 0.2s ease;
}

@media (max-width: 860px) {
  .sign__toggle {
    display: block;
  }

  .sign__toggle.is-open span:nth-child(1) { transform: translateY(8px) rotate(45deg); }
  .sign__toggle.is-open span:nth-child(2) { opacity: 0; }
  .sign__toggle.is-open span:nth-child(3) { transform: translateY(-8px) rotate(-45deg); }

  .sign__menu {
    position: absolute;
    top: calc(var(--nav-height) + 4px);
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    padding: 0.5rem 24px 1.5rem;
    background: var(--brand);
    box-shadow: 0 4px 0 var(--brand-deep);
    font-size: 1.3rem;
    display: none;
  }

  .sign__menu.is-open {
    display: flex;
  }

  .sign__link {
    display: block;
    width: 100%;
    text-align: left;
    padding: 14px 0;
  }

  .sign__cta {
    margin: 0.75rem 0 0;
    justify-content: center;
    width: 100%;
    min-height: 52px;
  }
}
</style>
