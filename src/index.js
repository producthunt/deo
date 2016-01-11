import val from 'pathval'
import immu from 'immu'

/**
 * Check if `obj` is an object.
 *
 * @returns {Boolean}
 * @private
 */

function isObject (obj) {
  return typeof obj === 'object' && obj !== null
}

/**
 * Merge the default values and the enviornment values.
 *
 * @param {Object} spec - the default values
 * @param {Object} env - the environment object
 * @param {String} [previous] - the previous path
 * @returns {Object}
 * @private
 */

function merge (spec, env, previous) {
  let ret = Object.create({})

  Object.keys(spec).forEach((key) => {
    const val = spec[key]
    const path = previous ? `${previous}_${key}` : key

    ret[key] = isObject(val)
      ? merge(val, env, path)
      : env[path.toUpperCase()] || spec[key]

    if (ret[key] == null) {
      const configKey = path.replace(/_/g, '.')
      throw new TypeError(`'${configKey}' must be set!`)
    }
  })

  return ret
}

/**
 * Create a config getter.
 *
 * @param {Object} values - default values
 * @param {Object} [env] - environment variables
 * @returns {Function}
 * @public
 */

export default function createConfig (values, env = process.env) {
  const data = immu(merge(values, env))

  return function config (key) {
    const value = val.get(data, key)

    if (value == null) {
      throw new TypeError(`'${key}' is not set!`)
    }

    return value
  }
}
