<script setup lang="ts">
// The navbar from the first site, as a Vue component.
// Files in app/components/ are auto-imported: <NavBar /> just works.

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
  <nav class="navbar">
    <div class="navbar__container container">
      <NuxtLink to="/" class="navbar__logo gradient-text gradient-text--logo">COLOR</NuxtLink>

      <button
        class="navbar__toggle"
        :class="{ 'is-active': menuOpen }"
        :aria-expanded="menuOpen"
        aria-label="Menu"
        @click="menuOpen = !menuOpen"
      >
        <span class="bar" /><span class="bar" /><span class="bar" />
      </button>

      <ul class="navbar__menu" :class="{ active: menuOpen }">
        <li><NuxtLink to="/explore" class="navbar__link">Explore</NuxtLink></li>
        <li><NuxtLink to="/generate" class="navbar__link">Generate</NuxtLink></li>

        <!-- v-if / v-else: render one block or the other -->
        <template v-if="user">
          <li>
            <NuxtLink v-if="username" :to="`/u/${username}`" class="navbar__link">@{{ username }}</NuxtLink>
          </li>
          <li class="navbar__btn">
            <button class="btn btn--ghost" @click="logOut">Log out</button>
          </li>
        </template>
        <template v-else>
          <li><NuxtLink to="/login" class="navbar__link">Log in</NuxtLink></li>
          <li class="navbar__btn">
            <NuxtLink to="/signup" class="btn">Sign up</NuxtLink>
          </li>
        </template>
      </ul>
    </div>
  </nav>
</template>

<!-- "scoped" styles only apply to this component's own HTML -->
<style scoped>
.navbar {
  background: var(--bg);
  height: var(--nav-height);
  position: sticky;
  top: 0;
  z-index: 100;
  font-size: 1.1rem;
}

.navbar__container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.navbar__logo {
  font-size: 2rem;
  font-weight: 700;
  text-decoration: none;
}

.navbar__menu {
  display: flex;
  align-items: center;
  list-style: none;
  height: 100%;
}

.navbar__menu > li {
  height: 100%;
  display: flex;
  align-items: center;
}

.navbar__link {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 1.25rem;
  text-decoration: none;
  border-bottom: 4px solid transparent;
  transition: color 0.3s ease;
}

.navbar__link:hover {
  color: #9518fc;
}

/* NuxtLink adds this class to the link for the current page */
.navbar__link.router-link-active {
  border-bottom-color: var(--accent);
}

.navbar__btn {
  padding-left: 1rem;
}

.navbar__toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
}

.bar {
  display: block;
  width: 25px;
  height: 3px;
  margin: 5px auto;
  background: #fff;
  transition: all 0.3s ease-in-out;
}

@media (max-width: 960px) {
  .navbar__toggle {
    display: block;
  }

  .navbar__toggle.is-active .bar:nth-child(1) { transform: translateY(8px) rotate(45deg); }
  .navbar__toggle.is-active .bar:nth-child(2) { opacity: 0; }
  .navbar__toggle.is-active .bar:nth-child(3) { transform: translateY(-8px) rotate(-45deg); }

  .navbar__menu {
    position: absolute;
    top: var(--nav-height);
    left: 0;
    right: 0;
    height: auto;
    flex-direction: column;
    background: var(--bg);
    padding: 1rem 0 2rem;
    font-size: 1.4rem;
    transform: translateY(-120%);
    opacity: 0;
    pointer-events: none;
    transition: transform 0.4s ease, opacity 0.3s ease;
    z-index: -1;
  }

  .navbar__menu.active {
    transform: translateY(0);
    opacity: 1;
    pointer-events: auto;
  }

  .navbar__menu > li {
    width: 100%;
    justify-content: center;
    height: auto;
  }

  .navbar__link {
    padding: 1.25rem;
  }

  .navbar__btn {
    padding: 1rem 0 0;
  }
}
</style>
