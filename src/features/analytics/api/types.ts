export type TimeRange = '1d' | '7d' | '30d' | '90d'

export type TimeseriesPoint = {
  date: string
  clicks: number
}

export type GeoRow = {
  country: string
  city?: string
  clicks: number
  percentage: number
}

export type ReferrerRow = {
  referrer: string
  clicks: number
  percentage: number
}

export type DeviceRow = {
  label: string
  clicks: number
  percentage: number
}

export type AnalyticsOverview = {
  totalClicks: number
  uniqueClicks: number
  topCountry: string | null
  topReferrer: string | null
}

export type LinkAnalytics = {
  overview: AnalyticsOverview
  timeseries: TimeseriesPoint[]
  geo: GeoRow[]
  referrers: ReferrerRow[]
  devices: DeviceRow[]
  browsers: DeviceRow[]
  os: DeviceRow[]
}

export type WorkspaceAnalytics = LinkAnalytics & {
  topLinks: Array<{
    id: string
    shortUrl: string
    destinationUrl: string
    slug: string
    clicks: number
  }>
}
