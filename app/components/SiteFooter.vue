<template>
  <footer class="footer">
    <div class="container footer__inner">
      <div class="footer__brand">
        <NuxtLink to="/" class="footer__mark">COLOR</NuxtLink>
        <p>A paint counter for palettes.</p>
      </div>
      <nav class="footer__nav" aria-label="Footer">
        <NuxtLink to="/explore">The rack</NuxtLink>
        <NuxtLink to="/generate">Mix a palette</NuxtLink>
        <NuxtLink to="/signup">Sign up</NuxtLink>
      </nav>
      <p class="footer__credit">
        Colour names from <a href="https://github.com/meodai/color-name-list" rel="noopener">color-name-list</a>.
        Built with Nuxt and Supabase.
      </p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--brand);
  color: #fff;
  border-top: 4px solid var(--brand-deep);
}

.footer__inner {
  display: grid;
  grid-template-columns: 1.2fr auto 1fr;
  align-items: start;
  gap: 2rem 3rem;
  padding-top: 3rem;
  padding-bottom: 3.5rem;
}

.footer__mark {
  font-size: 2.4rem;
  font-weight: 900;
  font-stretch: 125%;
  text-decoration: none;
  line-height: 1;
}

.footer__brand p {
  margin-top: 0.5rem;
  opacity: 0.85;
}

.footer__nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-weight: 700;
}

.footer__nav a {
  text-decoration: none;
  text-underline-offset: 5px;
  text-decoration-thickness: 2px;
}

.footer__nav a:hover {
  text-decoration-line: underline;
}

.footer__credit {
  font-size: 0.92rem;
  opacity: 0.85;
  max-width: 36ch;
}

@media (max-width: 760px) {
  .footer__inner {
    grid-template-columns: 1fr;
  }
}
</style>
