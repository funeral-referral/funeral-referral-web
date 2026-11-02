<script setup lang="ts">
import type { CampaignMessage, Home } from '~/utils/api-types'

const props = defineProps<{ home: Home }>()
const emit = defineEmits<{ changed: [] }>()

const { api } = useApi()

const campaign = computed(() => props.home.campaign ?? null)
const replies = computed(() => props.home.replies ?? [])
const isDraft = computed(() => campaign.value?.status === 'draft')
const isActive = computed(() => campaign.value?.status === 'active')
const canDraft = computed(() => !campaign.value || !['draft', 'active'].includes(campaign.value.status))

const busy = ref(false)
const error = ref('')
const editingId = ref<number | null>(null)
const editSubject = ref('')
const editBody = ref('')
const replyBody = ref('')

async function run(action: () => Promise<unknown>) {
  busy.value = true
  error.value = ''

  try {
    await action()
    emit('changed')
  } catch (caught) {
    error.value = apiErrorMessage(caught)
  } finally {
    busy.value = false
  }
}

function draft() {
  return run(() => api(`/homes/${props.home.id}/campaigns`, { method: 'POST' }))
}

function approve() {
  const email = props.home.email ?? 'this home'

  if (!confirm(`Approve and schedule? The first email goes to ${email} within 15 minutes, with follow-ups after 4 and 10 days. You can still stop it.`)) {
    return
  }

  return run(() => api(`/campaigns/${campaign.value!.id}/approve`, { method: 'POST' }))
}

function stop() {
  if (!confirm('Stop this campaign? Emails not yet sent will be cancelled.')) {
    return
  }

  return run(() => api(`/campaigns/${campaign.value!.id}/stop`, { method: 'POST' }))
}

function discard() {
  if (!confirm('Delete this draft?')) {
    return
  }

  return run(() => api(`/campaigns/${campaign.value!.id}`, { method: 'DELETE' }))
}

function startEdit(message: CampaignMessage) {
  editingId.value = message.id
  editSubject.value = message.subject ?? ''
  editBody.value = message.body
}

function saveEdit() {
  return run(async () => {
    await api(`/campaign-messages/${editingId.value}`, {
      method: 'PATCH',
      body: { subject: editSubject.value, body: editBody.value },
    })
    editingId.value = null
  })
}

function logReply() {
  return run(async () => {
    await api(`/homes/${props.home.id}/replies`, { method: 'POST', body: { body: replyBody.value } })
    replyBody.value = ''
  })
}

function when(message: CampaignMessage): string {
  if (message.sent_at) {
    return `Sent ${formatDateTime(message.sent_at)}`
  }

  return message.status === 'scheduled' && message.scheduled_for ? `Goes out ${formatDateTime(message.scheduled_for)}` : ''
}
</script>

<template>
  <div class="panel">
    <h2>Outreach</h2>
    <p v-if="error" class="error">{{ error }}</p>

    <template v-if="campaign">
      <p>
        <span class="pill" :class="campaignClass(campaign.status)">{{ campaign.status }}</span>
        <span v-if="campaign.stopped_reason" class="pill">{{ stopReasonLabel(campaign.stopped_reason) }}</span>
        <span class="muted">
          {{ campaign.variant === 'chain' ? 'Chain version' : 'Independent version' }}
          · drafted {{ campaign.generated_by === 'claude' ? 'by Claude' : 'from a template' }}
          <template v-if="campaign.approved_at">
            · approved {{ formatDateTime(campaign.approved_at) }}<template v-if="campaign.approved_by"> by {{ campaign.approved_by }}</template>
          </template>
        </span>
      </p>

      <p v-if="isDraft" class="muted">
        Nothing is sent until you approve. Every email gets an unsubscribe link and our postal address added automatically.
        <template v-if="!home.email"> This home has no email on record, so it cannot be approved. The call script still works.</template>
      </p>

      <div class="actions">
        <button v-if="isDraft" type="button" class="btn primary" :disabled="busy || !home.email" @click="approve">Approve and schedule</button>
        <button v-if="isDraft" type="button" class="btn danger" :disabled="busy" @click="discard">Delete draft</button>
        <button v-if="isActive" type="button" class="btn danger" :disabled="busy" @click="stop">Stop campaign</button>
        <button v-if="canDraft" type="button" class="btn" :disabled="busy" @click="draft">Draft new outreach</button>
      </div>

      <div v-for="message in campaign.messages" :key="message.id" class="msg">
        <div>
          <strong>{{ messageTypeLabel(message.type) }}</strong>
          <span class="pill">{{ messageStatusLabel(message.status) }}</span>
          <span v-if="message.edited" class="pill warn">Edited</span>
          <span class="muted"> {{ when(message) }}</span>
        </div>

        <template v-if="editingId === message.id">
          <label v-if="message.type !== 'call_script'" class="field">
            Subject
            <input v-model="editSubject" type="text" maxlength="150" />
          </label>
          <label class="field">
            Text
            <textarea v-model="editBody" rows="10" maxlength="5000" />
          </label>
          <div class="actions">
            <button type="button" class="btn primary" :disabled="busy" @click="saveEdit">Save</button>
            <button type="button" class="btn" :disabled="busy" @click="editingId = null">Cancel</button>
          </div>
        </template>
        <template v-else>
          <div v-if="message.subject" class="muted">Subject: {{ message.subject }}</div>
          <pre>{{ message.body }}</pre>
          <div v-if="isDraft" class="actions">
            <button type="button" class="btn" :disabled="busy" @click="startEdit(message)">Edit</button>
          </div>
        </template>
      </div>
    </template>

    <template v-else>
      <p class="muted">
        No outreach yet. Drafting writes a first email, two follow-ups and a call script. You read and edit them before anything is sent.
      </p>
    </template>

    <div v-if="canDraft && !campaign" class="actions">
      <button type="button" class="btn primary" :disabled="busy" @click="draft">Draft outreach</button>
    </div>

    <h2>Replies</h2>
    <table v-if="replies.length" class="tbl">
      <thead>
        <tr><th>Received</th><th>From</th><th>Message</th></tr>
      </thead>
      <tbody>
        <tr v-for="reply in replies" :key="reply.id">
          <td>{{ formatDateTime(reply.received_at) }}</td>
          <td>{{ reply.from_email }}</td>
          <td>
            <div v-if="reply.subject" class="muted">{{ reply.subject }}</div>
            {{ reply.body }}
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else class="muted">No replies yet. Replies sent to the outreach address are logged here and stop the sequence.</p>

    <label class="field">
      Log a reply you received another way (for example by phone)
      <textarea v-model="replyBody" rows="3" maxlength="10000" />
    </label>
    <button type="button" class="btn" :disabled="busy || !replyBody.trim()" @click="logReply">Log reply</button>
  </div>
</template>
