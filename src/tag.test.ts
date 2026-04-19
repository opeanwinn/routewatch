import { tagRoute, removeTag, filterByTag, listTags, formatTagMap } from './tag'
import { parseTagFlags, runTagCli } from './tag-cli'

const base = (): Record<string, string[]> => ({
  '/': ['public'],
  '/admin': ['private', 'auth'],
  '/blog': ['public', 'content'],
})

test('tagRoute adds new tags', () => {
  const m = tagRoute({}, '/foo', ['a', 'b'])
  expect(m['/foo']).toEqual(['a', 'b'])
})

test('tagRoute merges without duplicates', () => {
  const m = tagRoute({ '/foo': ['a'] }, '/foo', ['a', 'b'])
  expect(m['/foo']).toEqual(['a', 'b'])
})

test('removeTag removes a tag', () => {
  const m = removeTag(base(), '/admin', 'auth')
  expect(m['/admin']).toEqual(['private'])
})

test('removeTag removes key when empty', () => {
  const m = removeTag({ '/x': ['only'] }, '/x', 'only')
  expect(m['/x']).toBeUndefined()
})

test('filterByTag returns matching routes', () => {
  const routes = filterByTag(base(), 'public')
  expect(routes.sort()).toEqual(['/', '/blog'])
})

test('listTags returns sorted unique tags', () => {
  const tags = listTags(base())
  expect(tags).toEqual(['auth', 'content', 'private', 'public'])
})

test('formatTagMap formats correctly', () => {
  const out = formatTagMap({ '/a': ['x'], '/b': ['y', 'z'] })
  expect(out).toContain('/a: x')
  expect(out).toContain('/b: y, z')
})

test('parseTagFlags parses add', () => {
  const f = parseTagFlags(['add', '/foo', 'api', 'public'])
  expect(f).toEqual({ action: 'add', route: '/foo', tags: ['api', 'public'] })
})

test('parseTagFlags parses filter', () => {
  const f = parseTagFlags(['filter', 'public'])
  expect(f).toEqual({ action: 'filter', tag: 'public', tags: [] })
})

test('runTagCli list action', () => {
  const { output } = runTagCli({ action: 'list', tags: [] }, base())
  expect(output).toContain('public')
})

test('runTagCli filter action', () => {
  const { output } = runTagCli({ action: 'filter', tag: 'auth', tags: [] }, base())
  expect(output).toContain('/admin')
})
