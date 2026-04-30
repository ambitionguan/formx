import type { FormSchema } from './Types'

export interface PathNodeMeta {
  id: string
  type?: string
  path: string            // concrete or pattern path (pattern when under field-group)
  parentPath: string      // pattern path of parent container
  containerType?: 'form-object' | 'field-group' | 'root'
  flatten?: boolean
  role?: 'layout' | 'data'
  schema?: any
}

export interface PathRegistry {
  nodes: PathNodeMeta[]
  // All pattern paths (includes containers and leafs). Example: rules[].items[].name
  patterns: string[]
  // Map from exact/pattern path to meta
  pathToMeta: Map<string, PathNodeMeta>
  // id → pattern paths（可能重复出现在不同容器作用域）
  idIndex: Map<string, string[]>
}

/**
 * Build a rich path registry from schema, emitting pattern paths that respect containers:
 * - form-object children: base.child
 * - field-group children: base[].child
 * - containers themselves are included as nodes（便于定位 parentPath）
 */
export function buildPathRegistry(schema: FormSchema): PathRegistry {
  const nodes: PathNodeMeta[] = []
  const pathToMeta = new Map<string, PathNodeMeta>()
  const idIndex = new Map<string, string[]>()

  const add = (meta: PathNodeMeta) => {
    nodes.push(meta)
    pathToMeta.set(meta.path, meta)
    const list = idIndex.get(meta.id) || []
    list.push(meta.path)
    idIndex.set(meta.id, list)
  }

  const walk = (fields: any[], base: string, containerType: PathNodeMeta['containerType']) => {
    for (const f of fields || []) {
      const id = String(f.id)
      const type = f.type
      const isFormObject = type === 'form-object'
      const isFieldGroup = type === 'field-group'
      const current = base ? `${base}.${id}` : id

      if (isFormObject) {
        // container node
        add({ id, type, path: current, parentPath: base, containerType, flatten: !!f.flatten, role: f.role, schema: f })
        if (Array.isArray(f.children) && f.children.length) {
          const nextBase = f.flatten ? base : current
          walk(f.children, nextBase, 'form-object')
        }
        continue
      }

      if (isFieldGroup) {
        const pat = `${current}[]`
        add({ id, type, path: pat, parentPath: base, containerType, role: f.role, schema: f })
        if (Array.isArray(f.template) && f.template.length) {
          walk(f.template, pat, 'field-group')
        }
        continue
      }

      // leaf field
      add({ id, type, path: current, parentPath: base, containerType, schema: f })
    }
  }

  walk((schema as any).fields || [], '', 'root')
  const patterns = Array.from(new Set(nodes.map((n) => n.path)))
  return { nodes, patterns, pathToMeta, idIndex }
}

/**
 * Resolve a bare field id to nearest pattern path under a scope.
 * - scope can be a concrete path (rules[0].items[1]) or a pattern (rules[].items[])
 * - It searches current scope → ancestors → root and returns the first match
 */
export function resolveNearestPath(
  registry: PathRegistry,
  fieldId: string,
  scopePath: string
): string | null {
  const candidates = registry.idIndex.get(fieldId) || []
  if (candidates.length === 0) return null

  // Collect scope prefixes from most specific to root
  const prefixes = scopePrefixes(scopePath)
  for (const pre of prefixes) {
    // prefer exact prefix match
    const hit = candidates.find((p) => p.startsWith(pre ? pre + '.' : ''))
    if (hit) return hit
  }
  // fallback: any candidate
  return candidates[0] || null
}

function scopePrefixes(scope: string): string[] {
  if (!scope) return ['']
  // normalize concrete index to [] pattern for matching
  const norm = scope.replace(/\[(\d+)\]/g, '[]')
  const segs = norm.split('.')
  const out: string[] = []
  for (let i = segs.length; i >= 0; i--) {
    const pre = segs.slice(0, i).join('.')
    out.push(pre)
  }
  return out
}
