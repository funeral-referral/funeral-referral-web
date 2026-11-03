<script setup lang="ts">
import type { ThemeChoice } from '~/composables/useTheme'

const { choice, set } = useTheme()

const options: { value: ThemeChoice; label: string; path: string }[] = [
  { value: 'light', label: 'Light', path: 'M12 4V2m0 20v-2M4 12H2m20 0h-2M5.6 5.6 4.2 4.2m15.6 15.6-1.4-1.4M5.6 18.4l-1.4 1.4M19.8 4.2l-1.4 1.4M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z' },
  { value: 'system', label: 'Match system', path: 'M4 5h16v11H4zM8 20h8M12 16v4' },
  { value: 'dark', label: 'Dark', path: 'M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z' },
]
</script>

<template>
  <div class="toggle" role="group" aria-label="Colour theme">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      :class="{ on: choice === option.value }"
      :aria-pressed="choice === option.value"
      :title="option.label"
      @click="set(option.value)"
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path :d="option.path" />
      </svg>
      <span class="sr">{{ option.label }}</span>
    </button>
  </div>
</template>

<style scoped>
.toggle {
  display: inline-flex;
  padding: 3px;
  gap: 2px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface-2);
}
.toggle button {
  display: grid;
  place-items: center;
  width: 1.8rem;
  height: 1.8rem;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
}
.toggle button:hover {
  color: var(--text);
}
.toggle button.on {
  background: var(--surface);
  color: var(--accent);
  box-shadow: var(--shadow);
}
.sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
</style>
