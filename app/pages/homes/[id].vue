<script setup lang="ts">
import type { Home, Observation } from '~/utils/api-types'

const route = useRoute()
const { api } = useApi()

const { data, error } = await useAsyncData(
  () => `home-${route.params.id}`,
  () => api<{ data: Home }>(`/homes/${route.params.id}`),
)

const home = computed(() => data.value?.data)

const fields: { key: keyof Home; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'address_line1', label: 'Street address' },
  { key: 'city', label: 'City' },
  { key: 'county', label: 'County' },
  { key: 'state_code', label: 'State' },
  { key: 'postal_code', label: 'ZIP code' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'website', label: 'Website' },
  { key: 'license_number', label: 'Licence number' },
  { key: 'license_status', label: 'Licence status' },
  { key: 'licensed_director', label: 'Licensed director' },
  { key: 'offers_preneed', label: 'Offers pre-need' },
  { key: 'offers_burial', label: 'Offers burial' },
  { key: 'offers_cremation', label: 'Offers cremation' },
]

function observationsFor(field: string): Observation[] {
  return home.value?.observations?.filter((observation) => observation.field === field) ?? []
}
</script>

<template>
  <section>
    <p class="muted"><NuxtLink to="/homes">← All homes</NuxtLink></p>

    <p v-if="error" class="error">Could not load this home.</p>

    <template v-else-if="home">
      <h1>
        {{ home.name }}
        <span v-if="home.closed_at" class="pill bad">Closed {{ formatDate(home.closed_at) }}</span>
        <span v-else class="pill good">Open</span>
      </h1>
      <p class="muted">
        {{ [home.address_line1, home.city, home.state_code, home.postal_code].filter(Boolean).join(', ') }}
      </p>

      <div class="stats">
        <div class="stat">
          <span class="num">{{ home.partner_score ?? '—' }}</span>
          <span class="muted">Partner score{{ home.partner_score === null ? ' (not scored yet)' : '' }}</span>
        </div>
        <div class="stat">
          <span class="num">{{ home.ownership_type }}</span>
          <span class="muted">Ownership</span>
        </div>
        <div class="stat">
          <span class="num">{{ home.stage }}</span>
          <span class="muted">Pipeline stage</span>
        </div>
        <div class="stat">
          <span class="num">{{ formatDate(home.first_seen_at) }}</span>
          <span class="muted">First seen</span>
        </div>
      </div>

      <div class="panel">
        <h2>Details and where each value comes from</h2>
        <table class="tbl">
          <thead>
            <tr><th>Field</th><th>Current value</th><th>Observed by</th></tr>
          </thead>
          <tbody>
            <tr v-for="field in fields" :key="field.key">
              <td>{{ field.label }}</td>
              <td>{{ formatValue(home[field.key] as string | boolean | null) }}</td>
              <td>
                <div v-for="(observation, index) in observationsFor(field.key)" :key="index" class="muted">
                  {{ observation.source?.name ?? 'Unknown source' }}
                  · {{ formatDate(observation.observed_at) }}
                  <template v-if="observation.value !== String(home[field.key])">
                    · saw “{{ observation.value }}”
                  </template>
                </div>
                <span v-if="!observationsFor(field.key).length" class="muted">No source recorded</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="panel">
        <h2>Change history</h2>
        <table v-if="home.changes?.length" class="tbl">
          <thead>
            <tr><th>When</th><th>Change</th><th>Detail</th><th>Source</th></tr>
          </thead>
          <tbody>
            <tr v-for="change in home.changes" :key="change.id">
              <td>{{ formatDateTime(change.occurred_at) }}</td>
              <td><span class="pill">{{ changeLabel(change.type) }}</span></td>
              <td>
                <template v-if="change.field">
                  {{ fieldLabel(change.field) }}:
                  {{ formatValue(change.old_value) }} → {{ formatValue(change.new_value) }}
                </template>
              </td>
              <td>{{ change.source?.name ?? '—' }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="muted">No changes recorded.</p>
      </div>
    </template>
  </section>
</template>
