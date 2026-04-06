import { dub } from '@/lib/dub'
import { db } from '@/lib/db'
import type {
  TimeRange,
  LinkAnalytics,
  WorkspaceAnalytics,
  GeoRow,
  ReferrerRow,
  DeviceRow,
  TimeseriesPoint
} from './types'

// Map our TimeRange to Dub's Interval enum values
function toDubInterval(range: TimeRange): '24h' | '7d' | '30d' | '90d' {
  const map: Record<TimeRange, '24h' | '7d' | '30d' | '90d'> = {
    '1d': '24h',
    '7d': '7d',
    '30d': '30d',
    '90d': '90d'
  }
  return map[range]
}

function toPercent(value: number, total: number) {
  if (total === 0) return 0
  return Math.round((value / total) * 100 * 10) / 10
}

// ─── Per-link analytics ───────────────────────────────────
export async function getLinkAnalytics(
  dubLinkId: string,
  range: TimeRange = '30d'
): Promise<LinkAnalytics> {
  const interval = toDubInterval(range)

  const [
    clicksTotal,
    clicksTimeseries,
    clicksGeo,
    clicksReferrers,
    clicksDevices,
    clicksBrowsers,
    clicksOs
  ] = await Promise.all([
    dub.analytics.retrieve({ linkId: dubLinkId, event: 'clicks', interval }),
    dub.analytics.retrieve({ linkId: dubLinkId, event: 'clicks', interval, groupBy: 'timeseries' }),
    dub.analytics.retrieve({ linkId: dubLinkId, event: 'clicks', interval, groupBy: 'countries' }),
    dub.analytics.retrieve({ linkId: dubLinkId, event: 'clicks', interval, groupBy: 'referers' }),
    dub.analytics.retrieve({ linkId: dubLinkId, event: 'clicks', interval, groupBy: 'devices' }),
    dub.analytics.retrieve({ linkId: dubLinkId, event: 'clicks', interval, groupBy: 'browsers' }),
    dub.analytics.retrieve({ linkId: dubLinkId, event: 'clicks', interval, groupBy: 'os' })
  ])

  const total = (clicksTotal as { clicks: number }).clicks ?? 0

  const timeseries: TimeseriesPoint[] = Array.isArray(clicksTimeseries)
    ? (clicksTimeseries as Array<{ start: string; clicks: number }>).map((p) => ({
        date: p.start,
        clicks: p.clicks
      }))
    : []

  const geo: GeoRow[] = Array.isArray(clicksGeo)
    ? (clicksGeo as Array<{ country: string; clicks: number }>).map((r) => ({
        country: r.country,
        clicks: r.clicks,
        percentage: toPercent(r.clicks, total)
      }))
    : []

  const referrers: ReferrerRow[] = Array.isArray(clicksReferrers)
    ? (clicksReferrers as Array<{ referer: string; clicks: number }>).map((r) => ({
        referrer: r.referer || '(direct)',
        clicks: r.clicks,
        percentage: toPercent(r.clicks, total)
      }))
    : []

  const devices: DeviceRow[] = Array.isArray(clicksDevices)
    ? (clicksDevices as Array<{ device: string; clicks: number }>).map((r) => ({
        label: r.device,
        clicks: r.clicks,
        percentage: toPercent(r.clicks, total)
      }))
    : []

  const browsers: DeviceRow[] = Array.isArray(clicksBrowsers)
    ? (clicksBrowsers as Array<{ browser: string; clicks: number }>).map((r) => ({
        label: r.browser,
        clicks: r.clicks,
        percentage: toPercent(r.clicks, total)
      }))
    : []

  const os: DeviceRow[] = Array.isArray(clicksOs)
    ? (clicksOs as Array<{ os: string; clicks: number }>).map((r) => ({
        label: r.os,
        clicks: r.clicks,
        percentage: toPercent(r.clicks, total)
      }))
    : []

  return {
    overview: {
      totalClicks: total,
      uniqueClicks: total,
      topCountry: geo[0]?.country ?? null,
      topReferrer: referrers[0]?.referrer ?? null
    },
    timeseries,
    geo,
    referrers,
    devices,
    browsers,
    os
  }
}

// ─── Workspace-level analytics ────────────────────────────
export async function getWorkspaceAnalytics(
  workspaceId: string,
  range: TimeRange = '30d'
): Promise<WorkspaceAnalytics> {
  const interval = toDubInterval(range)

  const [
    clicksTotal,
    clicksTimeseries,
    clicksGeo,
    clicksReferrers,
    clicksDevices,
    clicksBrowsers,
    clicksOs
  ] = await Promise.all([
    dub.analytics.retrieve({ event: 'clicks', interval }),
    dub.analytics.retrieve({ event: 'clicks', interval, groupBy: 'timeseries' }),
    dub.analytics.retrieve({ event: 'clicks', interval, groupBy: 'countries' }),
    dub.analytics.retrieve({ event: 'clicks', interval, groupBy: 'referers' }),
    dub.analytics.retrieve({ event: 'clicks', interval, groupBy: 'devices' }),
    dub.analytics.retrieve({ event: 'clicks', interval, groupBy: 'browsers' }),
    dub.analytics.retrieve({ event: 'clicks', interval, groupBy: 'os' })
  ])

  const total = (clicksTotal as { clicks: number }).clicks ?? 0

  // Top links from DB — fetch click counts from Dub
  const dbLinks = await db.link.findMany({
    where: { workspaceId, dubLinkId: { not: null } },
    select: { id: true, slug: true, shortUrl: true, destinationUrl: true, dubLinkId: true },
    take: 20,
    orderBy: { createdAt: 'desc' }
  })

  const topLinks = await Promise.all(
    dbLinks.map(async (link) => {
      try {
        const stats = await dub.analytics.retrieve({
          linkId: link.dubLinkId!,
          event: 'clicks',
          interval
        })
        return {
          id: link.id,
          shortUrl: link.shortUrl ?? '',
          destinationUrl: link.destinationUrl,
          slug: link.slug,
          clicks: (stats as { clicks: number }).clicks ?? 0
        }
      } catch {
        return { id: link.id, shortUrl: link.shortUrl ?? '', destinationUrl: link.destinationUrl, slug: link.slug, clicks: 0 }
      }
    })
  )

  const timeseries: TimeseriesPoint[] = Array.isArray(clicksTimeseries)
    ? (clicksTimeseries as Array<{ start: string; clicks: number }>).map((p) => ({
        date: p.start,
        clicks: p.clicks
      }))
    : []

  const geo: GeoRow[] = Array.isArray(clicksGeo)
    ? (clicksGeo as Array<{ country: string; clicks: number }>).map((r) => ({
        country: r.country,
        clicks: r.clicks,
        percentage: toPercent(r.clicks, total)
      }))
    : []

  const referrers: ReferrerRow[] = Array.isArray(clicksReferrers)
    ? (clicksReferrers as Array<{ referer: string; clicks: number }>).map((r) => ({
        referrer: r.referer || '(direct)',
        clicks: r.clicks,
        percentage: toPercent(r.clicks, total)
      }))
    : []

  const devices: DeviceRow[] = Array.isArray(clicksDevices)
    ? (clicksDevices as Array<{ device: string; clicks: number }>).map((r) => ({
        label: r.device,
        clicks: r.clicks,
        percentage: toPercent(r.clicks, total)
      }))
    : []

  const browsers: DeviceRow[] = Array.isArray(clicksBrowsers)
    ? (clicksBrowsers as Array<{ browser: string; clicks: number }>).map((r) => ({
        label: r.browser,
        clicks: r.clicks,
        percentage: toPercent(r.clicks, total)
      }))
    : []

  const os: DeviceRow[] = Array.isArray(clicksOs)
    ? (clicksOs as Array<{ os: string; clicks: number }>).map((r) => ({
        label: r.os,
        clicks: r.clicks,
        percentage: toPercent(r.clicks, total)
      }))
    : []

  return {
    overview: {
      totalClicks: total,
      uniqueClicks: total,
      topCountry: geo[0]?.country ?? null,
      topReferrer: referrers[0]?.referrer ?? null
    },
    timeseries,
    geo,
    referrers,
    devices,
    browsers,
    os,
    topLinks: topLinks.sort((a, b) => b.clicks - a.clicks).slice(0, 5)
  }
}
