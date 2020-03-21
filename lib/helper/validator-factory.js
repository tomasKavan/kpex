'use strict'

const C = require('../const.js')

exports = module.exports = factory

/**
 *
 */
function factory(schema) {
  const validators = {}

  validators.columnsForSelect = async set => {

  }

  validators.parseFilter = async filterStr => {

  }

  validators.parseLimit = async filter => {

  }

  validators.parseOffset = async filter => {

  }

  validators.whereForKey = async key => {

  }

  validators.validForInsert = async data => {
    // All keys must be in model attributes
    // All atributes needs to go trhru all checks

    // Check if there is any unknonw key
    const dataKeys = Object.keys(data)
    const uKeys = dataKeys.filter(key => schema.attributes.find(key))
    if (uKeys.length) {
      throw error(`Model ${schema.name} hasn't columns ${uKeys} cannot insert`)
    }

    for (let i = 0; i < dataKeys.length; i++) {
      const key = dataKeys[i]
      const attr = schema.attributes[key]
      const val = validateValue(data[key], attr, key, schema.name)
    }
  }

  validators.validForUpdate = async data => {

  }
}

function validateValue(value, attr, column, model) {
  const object = Object.keys(attr)

  // Some validator is prioritized
  const priority = ['deafault', 'nullable', 'type']
  for (let i = priority.lenght-1; i >= 0; i--) {
    const p = priority[i]
    const pIdx = object.indexOf(p)
    if (pIdx < 0) {
      continue
    }
    object.splice(pIdx, 1)
    object.push(p)
  }

  for (let i = 0; i < object.length; i++) {
    const key = object[i]
    value = await typeValidators[key](attr[key], value, column, model)
  }

  return value
}

const typeValidators = {
  type: (type, value, column, model) => {
    const passed = false
    switch (type) {
      case String:
        passed = typeof value === 'string'
        break
      case Number:
        passed = typeof value === 'number'
        break
      case Date:
        passed = value instanceof Date
        break
      case C.Type.BOOLEAN:
        passed = typeof value === 'boolean'
        break
    }

    passed = passed && value === null
    if (!passed) {
      throw validErr()
    }
    return value
  },

  default: (ref, value, column, model) => {
    if (value === undefined) {

    }
  },

  nullable: (bool, value, column, model) => {

  }

  maxLength: (length, value, column, model) => {
    if (value.length > length) {
      throw validErr(model, column, `${value} is longer than ${length}`)
    }
    return value
  },

  minLength: (length, value, column, model) => {
    if (value.length < length) {
      throw validErr(model, column, `${value} is shorter than ${length}`)
    }
    return value
  },

  min: (ref, val, column, model) => {
    if (typeof val !== 'number') {
      throw validErr(`${val} is not a Number consider to change model`)
    }
    if (val < ref) {
      throw validErr(`${val} is lower than ${ref}`)
    }
    return val
  },

  max: (const, val, column, model) => {
    if (typeof val !== 'number') {
      throw validErr(`${val} is not a Number consider to change model`)
    }
    if (val > ref) {
      throw validErr(`${val} is grather than ${ref}`)
    }
    return val
  },

  isInt: (bool, value, column, model) => {
    if (!bool) {
      return
    }

    if (value % 1 !== 0) {
      throw validErr(`${value} is not an Integer`)
    }
    return value
  },

  isUInt: (bool, value, column, model) => {
    if (bool) {
      if (value % 1 !== 0 || value < 0) {
        throw validErr(`${value} is not an Unsigned Integer`)
      }
    }
    return value
  },

  isEmail: (bool, value, column, model) => {
    if (bool) {
      const re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
      if (!value.match(re)) {
        throw validErr(model, column, `${value} is not a valid email.`)
      }
    }
    return value
  },

  isCreateTime: (bool, value, column, model) => {
    if (bool) {
      throw validErr(model, column, 'It\'s create timestamp and cannot be set')
    }

    return value
  },

  isUpdateTime: (bool, value, column, model) => {
    if (bool) {
      throw validErr(model, column, 'It\'s update timestamp and cannot be set')
    }
  },

  custom: (fn, value, column, model) => {
    return fn(value, column, model)
  }

}

function error(text) {
  return new Error(`Kpex Validator: ${text}`)
}

function validErr(model, column, text) {
  return error(`Column ${mode}.${column}: ${text}`)
}
