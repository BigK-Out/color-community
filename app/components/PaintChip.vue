<script setup lang="ts">
// A palette as a hardware-store paint chip, hanging from a peg on the board.
import type { Palette } from '~/types'
import { NuxtLink } from '#components'

const props = defineProps<{
  palette: Palette
  tilt?: number // override the hang angle (the hero fans its chips)
  sample?: boolean // a made-up palette: no links and no likes
}>()

const tilt = computed(() => props.tilt ?? tiltFor(props.palette.id))
const number = computed(() => chipNumber(props.palette.id))
</script>

<template>
  <article class="chip" :style="{ '--tilt': `${tilt}deg` }">
    <span class="chip__peg peg" aria-hidden="true" />
    <div class="chip__card">
      <!-- <component :is> renders a link normally, a plain div for samples -->
      <component :is="sample ? 'div' : NuxtLink" :to="sample ? undefined : `/p/${palette.id}`" class="chip__link">
        <ol class="chip__colors">
          <li
            v-for="(c, i) in palette.colors"
            :key="i"
            :style="{ background: c, color: textColorFor(c) }"
          >
            <span class="chip__cname">{{ colorName(c) }}</span>
            <span class="chip__hex">{{ c.slice(1).toUpperCase() }}</span>
          </li>
        </ol>
        <h3 class="chip__name">{{ palette.name }}</h3>
      </component>
      <footer v-if="!sample" class="chip__foot">
        <span class="chip__no">No. {{ number }}</span>
        <NuxtLink v-if="palette.author" :to="`/u/${palette.author.username}`" class="chip__author">
          @{{ palette.author.username }}
        </NuxtLink>
        <LikeButton :palette-id="palette.id" :count="palette.like_count" class="chip__like" />
      </footer>
      <footer v-else-if="palette.author" class="chip__foot">
        <span class="chip__author">@{{ palette.author.username }}</span>
      </footer>
    </div>
  </article>
</template>

<style scoped>
.chip {
  --hole-y: 17px;
  position: relative;
}

/* The peg sits in the chip's punched hole. */
.chip__peg {
  top: calc(var(--hole-y) - 7px);
  left: 50%;
  margin-left: -7px;
}

.chip__card {
  background: var(--card);
  border-radius: var(--radius);
  padding: 34px 10px 10px;
  box-shadow: var(--hang-shadow);
  /* swing from the hole */
  transform-origin: 50% var(--hole-y);
  transform: rotate(var(--tilt));
  transition: transform 0.5s cubic-bezier(0.3, 1.6, 0.5, 1), box-shadow 0.3s ease;
  /* punch the hole so the board shows through */
  mask: radial-gradient(circle 8px at 50% var(--hole-y), transparent 97%, #000 100%);
}

.chip:hover .chip__card,
.chip:focus-within .chip__card {
  transform: rotate(0deg);
  box-shadow: 8px 14px 20px -8px rgb(58 34 10 / 0.6);
}

.chip__link {
  display: block;
  text-decoration: none;
}

.chip__colors {
  list-style: none;
}

.chip__colors li {
  transition: background-color 0.35s ease, color 0.35s ease;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 0.5rem;
  height: 48px;
  padding: 0 8px 6px;
}

.chip__colors li + li {
  border-top: 2px solid var(--card);
}

.chip__cname {
  font-size: 0.86rem;
  font-weight: 600;
  font-stretch: 78%;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chip__hex {
  font-size: 0.72rem;
  font-stretch: 85%;
  opacity: 0.8;
  flex-shrink: 0;
}

.chip__name {
  font-size: 1.15rem;
  font-weight: 800;
  font-stretch: 92%;
  line-height: 1.15;
  margin: 12px 2px 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chip__foot {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0 2px;
  font-size: 0.85rem;
  color: var(--ink-soft);
}

.chip__no {
  font-stretch: 85%;
}

.chip__author {
  text-decoration: none;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chip__author:hover {
  color: var(--ink);
  text-decoration: underline;
}

.chip__like {
  margin-left: auto;
}
</style>
