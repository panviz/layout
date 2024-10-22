/**
 * Config which triggers callback on any property change
 */
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
        if (!_.isEqual(Reflect.get(obj, key), value)) {
          Reflect.set(obj, key, value)
          onChange()
        }
        return true
      },
    }

    return new Proxy(p, handler)
  }
}
