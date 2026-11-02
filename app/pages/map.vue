<script setup lang="ts">
import type { MapData, MapRegion } from '~/utils/api-types'
import { mapSize, usCounties, usStates } from '~/utils/us-geo'

type Metric = 'total' | 'avg_score' | 'contacted' | 'partners'

const route = useRoute()
const { api } = useApi()

const metric = ref<Metric>('total')
const ownership = ref('')
const minScore = ref('')
const selectedState = ref<string | null>(typeof route.query.state === 'string' ? route.query.state : null)
const selectedCounty = ref<string | null>(null)

const metricLabels: Record<Metric, string> = {
  total: 'Open homes',
  avg_score: 'Average partner score',
  contacted: 'Contacted or further',
  partners: 'Active partners',
}

const { data, error, pending } = await useAsyncData(
  'map',
  () => api<{ data: MapData }>('/map', { query: { ownership_type: ownership.value || undefined, min_score: minScore.value || undefined } }),
  { watch: [ownership, minScore] },
)

const states = computed(() => new Map((data.value?.data.states ?? []).map((row) => [row.state_code, row])))
const counties = computed(() => new Map((data.value?.data.counties ?? []).map((row) => [row.fips, row])))

const visibleCounties = computed(() => usCounties.filter((shape) => shape.state === selectedState.value))
const selectedShape = computed(() => usStates.find((shape) => shape.code === selectedState.value) ?? null)

const viewBox = computed(() => {
  if (!selectedShape.value) {
    return `0 0 ${mapSize.width} ${mapSize.height}`
  }

  const [x0, y0, x1, y1] = selectedShape.value.box
  const pad = Math.max(x1 - x0, y1 - y0) * 0.06

  return `${x0 - pad} ${y0 - pad} ${x1 - x0 + pad * 2} ${y1 - y0 + pad * 2}`
})

function valueOf(row: MapRegion | undefined): number | null {
  return row === undefined ? null : row[metric.value]
}

const maxValue = computed(() => {
  const rows = selectedState.value
    ? visibleCounties.value.map((shape) => counties.value.get(shape.id))
    : [...states.value.values()]

  return Math.max(1, metric.value === 'avg_score' ? 100 : 0, ...rows.map((row) => valueOf(row) ?? 0))
})

function fill(row: MapRegion | undefined): string {
  const value = valueOf(row)

  return value === null || value === 0 ? '#f3f4f6' : `rgba(29, 78, 216, ${0.15 + 0.85 * (value / maxValue.value)})`
}

function pickState(code: string) {
  if (selectedState.value || !states.value.has(code)) {
    return
  }

  selectedState.value = code
  selectedCounty.value = null
}

function pickCounty(fips: string) {
  selectedCounty.value = fips
}

function back() {
  selectedState.value = null
  selectedCounty.value = null
}

const selectedRow = computed(() => {
  if (selectedCounty.value) {
    return counties.value.get(selectedCounty.value)
  }

  return selectedState.value ? states.value.get(selectedState.value) : undefined
})

const selectedName = computed(() => {
  if (selectedCounty.value) {
    return `${usCounties.find((shape) => shape.id === selectedCounty.value)?.name ?? 'County'}, ${selectedState.value}`
  }

  return selectedShape.value?.name ?? 'All states with data'
})

const unplaced = computed(() =>
  selectedState.value && !selectedCounty.value ? (states.value.get(selectedState.value)?.unplaced ?? 0) : 0,
)

const listRows = computed(() => {
  if (selectedState.value) {
    return visibleCounties.value
      .map((shape) => ({ id: shape.id, name: shape.name, row: counties.value.get(shape.id) }))
      .filter((item) => item.row)
      .sort((a, b) => (b.row?.total ?? 0) - (a.row?.total ?? 0))
  }

  return [...states.value.values()]
    .map((row) => ({ id: row.state_code, name: usStates.find((shape) => shape.code === row.state_code)?.name ?? row.state_code, row }))
    .sort((a, b) => b.row.total - a.row.total)
})

const homesLink = computed(() => {
  const query: Record<string, string> = {}

  if (selectedState.value) {
    query.state = selectedState.value
  }

  if (selectedCounty.value) {
    query.county = selectedCounty.value
  }

  return { path: '/homes', query }
})

function pickListItem(id: string) {
  return selectedState.value ? pickCounty(id) : pickState(id)
}
</script>

<template>
  <section>
    <h1>Map</h1>

    <div class="filters">
      <label>
        Colour by
        <select v-model="metric">
          <option v-for="(label, key) in metricLabels" :key="key" :value="key">{{ label }}</option>
        </select>
      </label>
      <label>
        Ownership
        <select v-model="ownership">
          <option value="">Any</option>
          <option value="independent">Independent</option>
          <option value="family_owned">Family-owned</option>
          <option value="chain">Chain</option>
          <option value="unknown">Unknown</option>
        </select>
      </label>
      <label>
        Minimum score
        <select v-model="minScore">
          <option value="">Any</option>
          <option value="30">30 or more</option>
          <option value="50">50 or more</option>
          <option value="70">70 or more</option>
        </select>
      </label>
      <button v-if="selectedState" type="button" class="btn" @click="back">← All states</button>
    </div>

    <p v-if="error" class="error">Could not load the map.</p>

    <div v-else class="cols">
      <div class="panel">
        <svg
          :viewBox="viewBox"
          role="img"
          :aria-label="`Map of ${selectedName}, coloured by ${metricLabels[metric].toLowerCase()}`"
          class="map"
        >
          <path
            v-for="shape in usStates"
            :key="shape.id"
            :d="shape.d"
            :fill="selectedState ? '#f9fafb' : fill(states.get(shape.code))"
            :class="{ live: !selectedState && states.has(shape.code) }"
            stroke="#fff"
            stroke-width="0.6"
            :tabindex="!selectedState && states.has(shape.code) ? 0 : -1"
            @click="pickState(shape.code)"
            @keydown.enter="pickState(shape.code)"
          >
            <title>{{ shape.name }}{{ states.get(shape.code) ? `: ${states.get(shape.code)!.total} homes` : '' }}</title>
          </path>
          <path
            v-for="shape in visibleCounties"
            :key="shape.id"
            :d="shape.d"
            :fill="fill(counties.get(shape.id))"
            :class="{ live: counties.has(shape.id), chosen: shape.id === selectedCounty }"
            stroke="#fff"
            stroke-width="0.8"
            vector-effect="non-scaling-stroke"
            tabindex="0"
            @click="pickCounty(shape.id)"
            @keydown.enter="pickCounty(shape.id)"
          >
            <title>{{ shape.name }}: {{ counties.get(shape.id)?.total ?? 0 }} homes</title>
          </path>
        </svg>
        <p class="muted">
          Darker means more
          {{ metric === 'avg_score' ? 'highly scored homes' : metricLabels[metric].toLowerCase() }}
          (scale 0 to {{ maxValue }}).
          {{ pending ? 'Loading…' : '' }}
          {{ selectedState ? 'Click a county for details.' : 'Click a state to see its counties.' }}
        </p>
      </div>

      <div>
        <div class="panel">
          <h2>{{ selectedName }}</h2>
          <template v-if="selectedRow">
            <table class="tbl">
              <tbody>
                <tr><td>Open homes</td><td class="num">{{ selectedRow.total }}</td></tr>
                <tr><td>Average partner score</td><td class="num">{{ selectedRow.avg_score ?? '—' }}</td></tr>
                <tr><td>Contacted or further</td><td class="num">{{ selectedRow.contacted }}</td></tr>
                <tr><td>Active partners</td><td class="num">{{ selectedRow.partners }}</td></tr>
              </tbody>
            </table>
            <p v-if="unplaced" class="muted">
              {{ unplaced }} homes here have no county on record and appear in the state total only.
            </p>
            <p><NuxtLink :to="homesLink">See these homes</NuxtLink></p>
          </template>
          <p v-else class="muted">Pick a state or county on the map, or from the list below.</p>
        </div>

        <div class="panel">
          <h2>{{ selectedState ? 'Counties' : 'States' }} by open homes</h2>
          <table class="tbl">
            <thead>
              <tr><th>{{ selectedState ? 'County' : 'State' }}</th><th class="num">Homes</th><th class="num">Avg score</th></tr>
            </thead>
            <tbody>
              <tr v-for="item in listRows" :key="item.id">
                <td><a href="#" @click.prevent="pickListItem(item.id)">{{ item.name }}</a></td>
                <td class="num">{{ item.row?.total }}</td>
                <td class="num">{{ item.row?.avg_score ?? '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.map {
  width: 100%;
  height: auto;
  max-height: 34rem;
}
.map path.live {
  cursor: pointer;
}
.map path.live:hover,
.map path.live:focus {
  stroke: #1f2937;
  stroke-width: 1.2;
  outline: none;
}
.map path.chosen {
  stroke: #111827;
  stroke-width: 2;
}
</style>
