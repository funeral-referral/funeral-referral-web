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

export interface ScoreItem {
  key: string
  label: string
  points: number
  max: number
  detail: string
}

export interface CampaignMessage {
  id: number
  type: string
  position: number
  subject: string | null
  body: string
  edited: boolean
  status: string
  scheduled_for: string | null
  sent_at: string | null
  sent_to: string | null
}

export interface Reply {
  id: number
  from_email: string
  subject: string | null
  body: string | null
  received_at: string
  campaign_id: number | null
  home?: { id: number; name: string; city: string | null; state_code: string } | null
}

export interface Campaign {
  id: number
  status: string
  variant: string
  generated_by: string
  approved_at: string | null
  approved_by?: string | null
  stopped_reason: string | null
  stopped_at: string | null
  created_at: string
  home?: {
    id: number
    name: string
    city: string | null
    state_code: string
    email: string | null
    ownership_type: string
    stage: string
  }
  messages?: CampaignMessage[]
  replies?: Reply[]
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
  owner_name: string | null
  ownership_type: string
  chain_name: string | null
  offers_burial: boolean | null
  offers_cremation: boolean | null
  offers_preneed: boolean | null
  sells_insurance: boolean | null
  partner_score: number | null
  partner_score_breakdown: ScoreItem[] | null
  stage: string
  first_seen_at: string | null
  last_seen_at: string | null
  closed_at: string | null
  observations?: Observation[]
  changes?: Change[]
  campaign?: Campaign | null
  replies?: Reply[]
  assigned_to: number | null
  assignee?: string | null
  notes?: Note[]
  referrals?: Referral[]
  stage_history?: StageChange[]
}

export interface Note {
  id: number
  body: string
  author: string | null
  created_at: string
}

export interface Referral {
  id: number
  referred_on: string
  reference: string | null
  value_cents: number | null
  notes: string | null
  logged_by: string | null
}

export interface StageChange {
  id: number
  from_stage: string | null
  to_stage: string
  by: string | null
  created_at: string
}

export interface MapRegion {
  total: number
  avg_score: number | null
  contacted: number
  partners: number
}

export interface MapData {
  states: (MapRegion & { state_code: string; unplaced: number })[]
  counties: (MapRegion & { fips: string; state_code: string })[]
}

export interface UserRef {
  id: number
  name: string
  email: string
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
  by_stage: Record<string, number>
  referrals: { total: number; value_cents: number }
  top_prospects: {
    id: number
    name: string
    city: string | null
    state_code: string
    partner_score: number
    ownership_type: string
  }[]
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
