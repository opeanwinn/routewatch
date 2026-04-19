import { TagMap, tagRoute, removeTag, filterByTag, listTags, formatTagMap } from './tag'

export interface TagFlags {
  action: 'add' | 'remove' | 'list' | 'filter'
  route?: string
  tags: string[]
  tag?: string
}

export function parseTagFlags(argv: string[]): TagFlags {
  const action = argv[0] as TagFlags['action']
  if (action === 'list') return { action, tags: [] }
  if (action === 'filter') {
    const tag = argv[1]
    if (!tag) throw new Error('filter requires a tag argument')
    return { action, tag, tags: [] }
  }
  const route = argv[1]
  if (!route) throw new Error(`${action} requires a route argument`)
  const tags = argv.slice(2)
  return { action, route, tags }
}

export function runTagCli(flags: TagFlags, current: TagMap): { map: TagMap; output: string } {
  if (flags.action === 'list') {
    const tags = listTags(current)
    return { map: current, output: tags.length ? tags.join('\n') : '(no tags)' }
  }
  if (flags.action === 'filter') {
    const routes = filterByTag(current, flags.tag!)
    return { map: current, output: routes.length ? routes.join('\n') : '(no routes)' }
  }
  if (flags.action === 'add') {
    const map = tagRoute(current, flags.route!, flags.tags)
    return { map, output: formatTagMap(map) }
  }
  if (flags.action === 'remove') {
    const map = removeTag(current, flags.route!, flags.tags[0])
    return { map, output: formatTagMap(map) }
  }
  throw new Error(`Unknown action: ${flags.action}`)
}
