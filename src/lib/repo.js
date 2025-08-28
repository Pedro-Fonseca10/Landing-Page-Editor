import { load, save } from "./storage"
const clone = (x) => JSON.parse(JSON.stringify(x ?? null))

export const Repo = {
  list(name) { return clone(load(name, [])) },
  get(name, id) {
    const arr = load(name, [])
    return clone(arr.find(x => String(x.id) === String(id)) || null)
  },
  add(name, item) {
    const arr = load(name, [])
    const next = [clone(item), ...arr]
    save(name, next)
    return clone(item)
  },
  update(name, id, patch) {
    const arr = load(name, [])
    const next = arr.map(x => String(x.id) === String(id) ? { ...x, ...clone(patch) } : x)
    save(name, next)
  },
  remove(name, id) {
    const arr = load(name, [])
    const next = arr.filter(x => String(x.id) !== String(id))
    save(name, next)
  }
}
