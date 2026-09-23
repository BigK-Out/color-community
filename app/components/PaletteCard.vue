<script setup lang="ts">
import type { Palette } from '~/types'

defineProps<{ palette: Palette }>()
</script>

<template>
  <article class="card">
    <NuxtLink :to="`/p/${palette.id}`" class="card__link">
      <PaletteStrip :colors="palette.colors" />
      <h3 class="card__name">{{ palette.name }}</h3>
    </NuxtLink>
    <footer class="card__meta">
      <NuxtLink v-if="palette.author" :to="`/u/${palette.author.username}`" class="card__author">
        @{{ palette.author.username }}
      </NuxtLink>
      <LikeButton :palette-id="palette.id" :count="palette.like_count" />
    </footer>
  </article>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
}

.card__link {
  text-decoration: none;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.card__name {
  font-size: 1.1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card__author {
  color: var(--muted);
  text-decoration: none;
  font-size: 0.95rem;
}

.card__author:hover {
  color: #fff;
}
</style>
