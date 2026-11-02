<script setup lang="ts">
import type { Home, UserRef } from '~/utils/api-types'

const props = defineProps<{ home: Home }>()
const emit = defineEmits<{ changed: [] }>()

const { api } = useApi()

const { data: users } = useLazyAsyncData('assignable-users', () => api<{ data: UserRef[] }>('/users'))

const busy = ref(false)
const error = ref('')
const noteBody = ref('')
const referral = reactive({ referred_on: new Date().toISOString().slice(0, 10), reference: '', value_dollars: '', notes: '' })

const referralTotal = computed(() => (props.home.referrals ?? []).reduce((sum, item) => sum + (item.value_cents ?? 0), 0))

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

function setStage(event: Event) {
  const stage = (event.target as HTMLSelectElement).value

  return run(() => api(`/homes/${props.home.id}/stage`, { method: 'PUT', body: { stage } }))
}

function setAssignee(event: Event) {
  const value = (event.target as HTMLSelectElement).value

  return run(() => api(`/homes/${props.home.id}/assignee`, { method: 'PUT', body: { assigned_to: value === '' ? null : Number(value) } }))
}

function addNote() {
  return run(async () => {
    await api(`/homes/${props.home.id}/notes`, { method: 'POST', body: { body: noteBody.value } })
    noteBody.value = ''
  })
}

function addReferral() {
  return run(async () => {
    await api(`/homes/${props.home.id}/referrals`, {
      method: 'POST',
      body: {
        referred_on: referral.referred_on,
        reference: referral.reference || null,
        value_dollars: referral.value_dollars === '' ? null : Number(referral.value_dollars),
        notes: referral.notes || null,
      },
    })
    referral.reference = ''
    referral.value_dollars = ''
    referral.notes = ''
  })
}
</script>

<template>
  <div class="panel">
    <h2>Pipeline</h2>
    <p v-if="error" class="error">{{ error }}</p>

    <div class="filters">
      <label>
        Stage
        <select :value="home.stage" :disabled="busy" @change="setStage">
          <option v-for="stage in stageOrder" :key="stage" :value="stage">{{ stageLabel(stage) }}</option>
        </select>
      </label>
      <label>
        Assigned to
        <select :value="home.assigned_to ?? ''" :disabled="busy" @change="setAssignee">
          <option value="">Unassigned</option>
          <option v-for="user in users?.data ?? []" :key="user.id" :value="user.id">{{ user.name }}</option>
        </select>
      </label>
    </div>

    <h2>Notes</h2>
    <div v-for="note in home.notes" :key="note.id" class="msg">
      <div class="muted">{{ note.author ?? 'Someone' }} · {{ formatDateTime(note.created_at) }}</div>
      <pre>{{ note.body }}</pre>
    </div>
    <p v-if="!home.notes?.length" class="muted">No notes yet.</p>
    <label class="field">
      Add a note
      <textarea v-model="noteBody" rows="3" maxlength="5000" />
    </label>
    <button type="button" class="btn" :disabled="busy || !noteBody.trim()" @click="addNote">Add note</button>

    <h2 style="margin-top: 1.5rem">Referrals received</h2>
    <table v-if="home.referrals?.length" class="tbl">
      <thead>
        <tr><th>Date</th><th>Reference</th><th class="num">Value</th><th>Notes</th><th>Logged by</th></tr>
      </thead>
      <tbody>
        <tr v-for="item in home.referrals" :key="item.id">
          <td>{{ formatDate(item.referred_on) }}</td>
          <td>{{ item.reference ?? '—' }}</td>
          <td class="num">{{ formatMoney(item.value_cents) }}</td>
          <td>{{ item.notes ?? '' }}</td>
          <td>{{ item.logged_by ?? '—' }}</td>
        </tr>
      </tbody>
    </table>
    <p v-if="home.referrals?.length" class="muted">{{ home.referrals.length }} referrals · {{ formatMoney(referralTotal) }} total</p>
    <p v-else class="muted">No referrals logged yet.</p>

    <div class="filters">
      <label>
        Date
        <input v-model="referral.referred_on" type="text" placeholder="YYYY-MM-DD" />
      </label>
      <label>
        Reference
        <input v-model="referral.reference" type="text" placeholder="Family or case" maxlength="200" />
      </label>
      <label>
        Value ($)
        <input v-model="referral.value_dollars" type="text" inputmode="decimal" placeholder="Optional" />
      </label>
      <label>
        Notes
        <input v-model="referral.notes" type="text" maxlength="2000" />
      </label>
      <button type="button" class="btn" :disabled="busy || !referral.referred_on" @click="addReferral">Log referral</button>
    </div>

    <h2 style="margin-top: 1.5rem">Stage history</h2>
    <table v-if="home.stage_history?.length" class="tbl">
      <tbody>
        <tr v-for="change in home.stage_history" :key="change.id">
          <td>{{ formatDateTime(change.created_at) }}</td>
          <td>{{ stageLabel(change.from_stage) }} → {{ stageLabel(change.to_stage) }}</td>
          <td class="muted">{{ change.by ?? 'Automatic' }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else class="muted">No stage changes yet.</p>
  </div>
</template>
