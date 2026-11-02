<script setup lang="ts">
import type { Campaign, Paginated, Reply } from '~/utils/api-types'

const { api } = useApi()

const status = ref('')
const page = ref(1)

watch(status, () => {
  page.value = 1
})

const params = computed(() => ({
  status: status.value || undefined,
  page: page.value,
  per_page: 25,
}))

const { data, pending, error } = await useAsyncData(
  'campaigns',
  () => api<Paginated<Campaign>>('/campaigns', { query: params.value }),
  { watch: [params] },
)
const { data: replies } = await useAsyncData('replies', () => api<Paginated<Reply>>('/replies', { query: { per_page: 10 } }))

function sentCount(campaign: Campaign): string {
  const emails = campaign.messages?.filter((message) => message.type !== 'call_script') ?? []

  return `${emails.filter((message) => message.status === 'sent').length} of ${emails.length}`
}

function nextSend(campaign: Campaign): string {
  const due = campaign.messages
    ?.filter((message) => message.status === 'scheduled' && message.scheduled_for)
    .map((message) => message.scheduled_for as string)
    .sort()

  return due?.length ? formatDateTime(due[0]) : '—'
}
</script>

<template>
  <section>
    <h1>Outreach</h1>

    <div class="filters">
      <label>
        Status
        <select v-model="status">
          <option value="">Any</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="stopped">Stopped</option>
          <option value="completed">Completed</option>
        </select>
      </label>
    </div>

    <p v-if="error" class="error">Could not load campaigns.</p>

    <div v-else-if="data" class="panel">
      <p class="muted">{{ data.meta.total }} campaigns{{ pending ? ' · loading…' : '' }}</p>
      <table class="tbl">
        <thead>
          <tr><th>Home</th><th>Version</th><th>Status</th><th class="num">Emails sent</th><th>Next send</th><th>Drafted by</th></tr>
        </thead>
        <tbody>
          <tr v-for="campaign in data.data" :key="campaign.id">
            <td>
              <NuxtLink v-if="campaign.home" :to="`/homes/${campaign.home.id}`">{{ campaign.home.name }}</NuxtLink>
              <div v-if="campaign.home" class="muted">{{ [campaign.home.city, campaign.home.state_code].filter(Boolean).join(', ') }}</div>
            </td>
            <td>{{ campaign.variant === 'chain' ? 'Chain' : 'Independent' }}</td>
            <td>
              <span class="pill" :class="campaignClass(campaign.status)">{{ campaign.status }}</span>
              <span v-if="campaign.stopped_reason" class="pill">{{ stopReasonLabel(campaign.stopped_reason) }}</span>
            </td>
            <td class="num">{{ sentCount(campaign) }}</td>
            <td>{{ nextSend(campaign) }}</td>
            <td>{{ campaign.generated_by === 'claude' ? 'Claude' : 'Template' }}</td>
          </tr>
          <tr v-if="!data.data.length">
            <td colspan="6" class="muted">No campaigns yet. Open a home and choose “Draft outreach”.</td>
          </tr>
        </tbody>
      </table>

      <div class="pager">
        <button type="button" :disabled="page <= 1" @click="page--">Previous</button>
        <span>Page {{ data.meta.current_page }} of {{ data.meta.last_page }}</span>
        <button type="button" :disabled="page >= data.meta.last_page" @click="page++">Next</button>
      </div>
    </div>

    <div v-if="replies" class="panel">
      <h2>Latest replies</h2>
      <table v-if="replies.data.length" class="tbl">
        <thead>
          <tr><th>Received</th><th>Home</th><th>From</th><th>Message</th></tr>
        </thead>
        <tbody>
          <tr v-for="reply in replies.data" :key="reply.id">
            <td>{{ formatDateTime(reply.received_at) }}</td>
            <td>
              <NuxtLink v-if="reply.home" :to="`/homes/${reply.home.id}`">{{ reply.home.name }}</NuxtLink>
              <span v-else class="muted">Unknown sender</span>
            </td>
            <td>{{ reply.from_email }}</td>
            <td>
              <div v-if="reply.subject" class="muted">{{ reply.subject }}</div>
              {{ reply.body }}
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="muted">No replies yet.</p>
    </div>
  </section>
</template>
