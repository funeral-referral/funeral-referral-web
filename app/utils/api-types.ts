export interface Paginated<T> {
  data: T[]
  meta: { current_page: number; last_page: number; total: number; per_page: number }
}

export interface SourceRef {
  key: string
  name: string
  type: string
}

export interface Observation {
  field: string
  value: string | null
  observed_at: string
  source?: SourceRef
}

export interface Change {
  id: number
  type: string
  field: string | null
  old_value: string | null
  new_value: string | null
  occurred_at: string
  home?: { id: number; name: string; city: string | null; state_code: string }
  source?: SourceRef | null
}

export interface Home {
  id: number
  name: string
  address_line1: string | null
  city: string | null
  state_code: string
  county: string | null
  postal_code: string | null
  latitude: number | null
  longitude: number | null
  phone: string | null
  email: string | null
  website: string | null
  license_number: string | null
  license_status: string | null
  licensed_director: string | null
  ownership_type: string
  chain_name: string | null
  offers_burial: boolean | null
  offers_cremation: boolean | null
  offers_preneed: boolean | null
  sells_insurance: boolean | null
  partner_score: number | null
  stage: string
  first_seen_at: string | null
  last_seen_at: string | null
  closed_at: string | null
  observations?: Observation[]
  changes?: Change[]
}

export interface CrawlRun {
  id: number
  status: string
  started_at: string
  finished_at: string | null
  records_seen: number
  records_new: number
  records_changed: number
  record_errors: number
  error: string | null
  source?: { key: string; name: string; type: string; state_code: string | null }
}

export interface Dashboard {
  totals: { homes: number; closed: number }
  by_state: { state_code: string; total: number; closed: number }[]
  by_ownership: { ownership_type: string; total: number }[]
  changes: {
    window_days: number
    baseline_until: string | null
    by_type: { type: string; total: number }[]
  }
  sources: {
    id: number
    key: string
    name: string
    type: string
    state_code: string | null
    records: number
    last_run: {
      status: string
      started_at: string
      finished_at: string | null
      records_seen: number
      records_new: number
      records_changed: number
    } | null
  }[]
}
