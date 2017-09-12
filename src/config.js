export default class Config {
  constructor (p, onChange) {
    const handler = {
      get (obj, key) {
        const value = Reflect.get(obj, key)
        if (_.isPlainObject(value)) {
          return new Proxy(value, handler)
        }
        return value
      },
      set (obj, key, value) {
        if (_.isEqual(Reflect.get(obj, key), value)) return false
        Reflect.set(obj, key, value)
        onChange()
        return true
      },
    }

    return new Proxy(p, handler)
  }
}
