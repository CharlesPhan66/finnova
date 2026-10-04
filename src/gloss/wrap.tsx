/** @jsxImportSource react */
import { Children, type ReactNode } from 'react'
import { Gloss } from './Gloss'

// Host elements whose plain-text children may hold abbreviations.
const TEXT_TAGS = new Set(['p', 'li', 'td', 'th', 'span', 'h1', 'h2', 'h3', 'h4', 'dt', 'dd', 'label', 'b', 'strong', 'legend', 'button', 'div', 'summary'])

export function wrapProps(type: unknown, props: Record<string, unknown>): Record<string, unknown> {
  if (typeof type !== 'string' || !TEXT_TAGS.has(type) || props.children == null || props.role === 'tooltip') return props
  const kids = props.children as ReactNode
  const mapped = typeof kids === 'string'
    ? <Gloss text={kids} />
    : Array.isArray(kids)
      ? Children.map(kids, (c) => (typeof c === 'string' ? <Gloss text={c} /> : c))
      : kids
  return { ...props, children: mapped }
}
