<script setup lang="ts">
import type { CrawlRun, Paginated } from '~/utils/api-types'

const { api } = useApi()

const page = ref(1)

const { data, pending, error } = await useAsyncData(
  'crawl-runs',
  () => api<Paginated<CrawlRun>>('/crawl-runs', { query: { page: page.value } }),
  { watch: [page] },
)

function runClass(status: string): string {
  return status === 'completed' ? 'good' : status === 'failed' ? 'bad' : 'warn'
}

function duration(run: CrawlRun): string {
  if (!run.finished_at) {
    return '—'
  }

  const seconds = Math.round((new Date(run.finished_at).getTime() - new Date(run.started_at).getTime()) / 1000)

  return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`
}
</script>

<template>
  <section>
    <h1>Crawl runs</h1>
    <p class="muted">Every crawl of every source, with what it found. The scheduler runs daily at 02:00 UTC.</p>

    <p v-if="error" class="error">Could not load crawl runs.</p>

    <div v-else-if="data" class="panel">
      <p v-if="pending" class="muted">Loading…</p>
      <table class="tbl">
        <thead>
          <tr>
            <th>Started</th><th>Source</th><th>Status</th><th>Duration</th>
            <th class="num">Seen</th><th class="num">New</th><th class="num">Changed</th><th class="num">Errors</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="run in data.data" :key="run.id">
            <td>{{ formatDateTime(run.started_at) }}</td>
            <td>{{ run.source?.name ?? '—' }}</td>
            <td>
              <span class="pill" :class="runClass(run.status)">{{ run.status }}</span>
              <div v-if="run.error" class="error">{{ run.error }}</div>
            </td>
            <td>{{ duration(run) }}</td>
            <td class="num">{{ run.records_seen }}</td>
            <td class="num">{{ run.records_new }}</td>
            <td class="num">{{ run.records_changed }}</td>
            <td class="num">{{ run.record_errors }}</td>
          </tr>
        </tbody>
      </table>

      <div class="pager">
        <button type="button" :disabled="page <= 1" @click="page--">Previous</button>
        <span>Page {{ data.meta.current_page }} of {{ data.meta.last_page }}</span>
        <button type="button" :disabled="page >= data.meta.last_page" @click="page++">Next</button>
      </div>
    </div>
  </section>
</template>
