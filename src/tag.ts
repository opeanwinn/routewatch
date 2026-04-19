export interface TagMap { [route: string]: string[] }

export interface RouteNode {
  path: string
  children?: RouteNode[]
}

export function tagRoute(tags: TagMap, route: string, newTags: string[]): TagMap {
  const existing = tags[route] ?? []
  const merged = Array.from(new Set([...existing, ...newTags]))
  return { ...tags, [route]: merged }
}

export function removeTag(tags: TagMap, route: string, tag: string): TagMap {
  const existing = tags[route] ?? []
  const filtered = existing.filter(t => t !== tag)
  const next = { ...tags }
  if (filtered.length === 0) {
    delete next[route]
  } else {
    next[route] = filtered
  }
  return next
}

export function filterByTag(tags: TagMap, tag: string): string[] {
  return Object.entries(tags)
    .filter(([, t]) => t.includes(tag))
    .map(([route]) => route)
}

export function listTags(tags: TagMap): string[] {
  const all = Object.values(tags).flat()
  return Array.from(new Set(all)).sort()
}

export function formatTagMap(tags: TagMap): string {
  const lines: string[] = []
  for (const [route, ts] of Object.entries(tags).sort()) {
    lines.push(`${route}: ${ts.join(', ')}`)
  }
  return lines.join('\n')
}
