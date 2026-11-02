export function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return '—'
  }

  return new Date(value).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return '—'
  }

  return new Date(value).toLocaleDateString('en-US', { dateStyle: 'medium' })
}

export const changeTypeLabels: Record<string, string> = {
  new_home: 'New home',
  new_license: 'New licence',
  license_status_changed: 'Licence status changed',
  closure: 'Closure',
  name_changed: 'Name changed',
  new_website: 'New website',
  website_changed: 'Website changed',
  new_phone: 'New phone',
  phone_changed: 'Phone changed',
  email_changed: 'Email changed',
  address_changed: 'Address changed',
  owner_changed: 'Owner changed',
}

export const ownershipLabels: Record<string, string> = {
  independent: 'Independent',
  family_owned: 'Family-owned',
  chain: 'Chain',
  unknown: 'Unknown',
}

export function ownershipLabel(type: string): string {
  return ownershipLabels[type] ?? type
}

export const messageTypeLabels: Record<string, string> = {
  first_email: 'First email',
  follow_up_1: 'Follow-up 1',
  follow_up_2: 'Follow-up 2',
  call_script: 'Call script (never sent)',
}

export const messageStatusLabels: Record<string, string> = {
  draft: 'Draft',
  ready: 'Ready to use',
  scheduled: 'Scheduled',
  sending: 'Sending',
  sent: 'Sent',
  skipped: 'Cancelled',
  failed: 'Failed',
}

export const stopReasonLabels: Record<string, string> = {
  replied: 'They replied',
  opted_out: 'Asked to stop',
  unsubscribed: 'Unsubscribed',
  manual: 'Stopped by hand',
  suppressed: 'Address suppressed',
  no_email: 'No email address',
  send_failed: 'Send failed',
}

export function messageTypeLabel(type: string): string {
  return messageTypeLabels[type] ?? type
}

export function messageStatusLabel(status: string): string {
  return messageStatusLabels[status] ?? status
}

export function stopReasonLabel(reason: string | null): string {
  return reason === null ? '' : (stopReasonLabels[reason] ?? reason)
}

export function campaignClass(status: string): string {
  return status === 'active' ? 'good' : status === 'stopped' ? 'bad' : status === 'draft' ? 'warn' : ''
}

export function apiErrorMessage(error: unknown): string {
  const data = (error as { data?: { message?: string; errors?: Record<string, string[]> } }).data

  return Object.values(data?.errors ?? {}).flat()[0] ?? data?.message ?? 'Something went wrong. Please try again.'
}

export const stageOrder = ['found', 'contacted', 'replied', 'meeting', 'active_partner', 'not_interested']

export const stageLabels: Record<string, string> = {
  found: 'Found',
  contacted: 'Contacted',
  replied: 'Replied',
  meeting: 'Meeting',
  active_partner: 'Active partner',
  not_interested: 'Not interested',
}

export function stageLabel(stage: string | null): string {
  return stage === null ? '—' : (stageLabels[stage] ?? stage)
}

export function formatMoney(cents: number | null | undefined): string {
  return cents === null || cents === undefined
    ? '—'
    : (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

export function changeLabel(type: string): string {
  return changeTypeLabels[type] ?? type
}

export const fieldLabels: Record<string, string> = {
  name: 'Name',
  address_line1: 'Street address',
  city: 'City',
  county: 'County',
  state_code: 'State',
  postal_code: 'ZIP code',
  phone: 'Phone',
  email: 'Email',
  website: 'Website',
  license_number: 'Licence number',
  license_status: 'Licence status',
  licensed_director: 'Licensed director',
  owner_name: 'Owner',
  latitude: 'Latitude',
  longitude: 'Longitude',
  offers_burial: 'Offers burial',
  offers_cremation: 'Offers cremation',
  offers_preneed: 'Offers pre-need',
}

export function fieldLabel(field: string | null): string {
  return field === null ? '' : (fieldLabels[field] ?? field)
}

export function formatValue(value: string | boolean | number | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  return String(value)
}
