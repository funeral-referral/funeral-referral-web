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
