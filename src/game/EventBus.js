const events = new Map()

export function on(eventName, callback) {
  if (!events.has(eventName)) events.set(eventName, [])
  events.get(eventName).push(callback)
}

export function off(eventName, callback) {
  if (!events.has(eventName)) return
  const list = events.get(eventName)
  const index = list.indexOf(callback)
  if (index !== -1) list.splice(index, 1)
}

export function emit(eventName, payload) {
  if (!events.has(eventName)) return
  events.get(eventName).forEach((callback) => callback(payload))
}
