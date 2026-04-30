// Lightweight watch index for exact and prefix candidates (container strip)

export class WatchIndex {
  private map: Map<string, number[]> = new Map()

  clear() { this.map.clear() }

  add(path: string, ruleIdx: number) {
    const arr = this.map.get(path) || []
    if (!arr.includes(ruleIdx)) arr.push(ruleIdx)
    this.map.set(path, arr)
  }

  removeRule(ruleIdx: number) {
    this.map.forEach((arr, key) => {
      const i = arr.indexOf(ruleIdx)
      if (i >= 0) {
        arr.splice(i, 1)
        if (arr.length === 0) this.map.delete(key)
        else this.map.set(key, arr)
      }
    })
  }

  getExact(path: string): number[] {
    return (this.map.get(path) || []).slice()
  }

  // collect exact + parent prefixes + container-level (strip index brackets)
  candidatesForPath(path: string): number[] {
    const set = new Set<number>()
    const segs = path.split('.')
    for (let i = segs.length; i >= 1; i--) {
      const p = segs.slice(0, i).join('.')
      const hit1 = this.map.get(p)
      if (hit1) hit1.forEach((j) => set.add(j))
      const p2 = p.replace(/\[\d+\]/g, '')
      if (p2 !== p) {
        const hit2 = this.map.get(p2)
        if (hit2) hit2.forEach((j) => set.add(j))
      }
    }
    return Array.from(set)
  }

  dumpEntries(): Array<[string, number[]]> {
    return Array.from(this.map.entries()).map(([k, v]) => [k, v.slice()])
  }
}

