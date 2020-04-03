/*!
 * derouter
 * Copyright(c) 2020 Tomas Kavan
 * BSD 2-Clause Licensed
 */
'use strict'

/**
 * Import local dependencies
 */
const C = require('../const.js')

/**
 * Expose factory function
 */
exports = module.exports = factory

/**
 * Return functions to validate data and metadata input of
 * model methods
 *
 * @param Object schema
 * @return Object
 * @private
 */
function factory(schema) {
  const validators = {}

  /**
   * Return list of attributes returned when listing one or more
   * model instances
   *
   * @param String set Not used yet. In future it defines if it's
   *                   find or findOne.
   * @return Array
   * @private
   */
  validators.columnsForSelect = async set => {
    const attrs = Object.keys(schema.attributes)
    return attrs.map(attr => {
      schema.attributes[attr].columnName
    })
  }

  /**
   * Returns where function of knex assembled based on given filter
   * object structure.
   * TODO
   *
   * @param Object filter
   * @return Function
   * @private
   */
  validators.parseFilter = async filter => {
    return parseFilterEntry('_and', filter)
  {

  /**
   * Returns limit if defined or null
   *
   * @param Object range
   * @return Number|null
   * @private
   */
  validators.parseLimit = async range => {
    return range.limit || null
  }

  /**
   * Returns offset if defined or null
   *
   * @param Object range
   * @return Number|null
   * @private
   */
  validators.parseOffset = async reange => {
    return range.offset || null
  }

  /**
   * Returns offset if defined or null
   *
   * @param Object range
   * @return Number|null
   * @private
   */
  validators.whereForKey = async key => {
    if (!(key instanceof Array)) {
      key = [key]
    }
    const obj = {}
    for (let i = 0; i < schema.primaryKey.length; i++) {
      obj[schema.primaryKey[i]] = key[i]
    }
    return b => {
      b.where(obj)
    }
  }

  /**
   * Validates data if it's passible to create a new intance
   * with it. All keys of given object must be an attribute of
   * model. All values must passed all attribute restrictions.
   * If any validation fails it throws an exception.
   *
   * @param Object data
   * @private
   */
  validators.validForInsert = async data => {
    // All keys must be in model attributes
    // All atributes needs to go trhru all checks

    // Check if there is any unknonw key
    const dataKeys = Object.keys(data)
    const uKeys = dataKeys.filter(key => schema.attributes.find(key))
    if (uKeys.length) {
      throw error(`Model ${schema.name} hasn't columns ${uKeys} cannot insert`)
    }

    const attrKeys = Object.keys(schema.attributes)
    for (let i = 0; i < attrKeys.length; i++) {
      const key = attrKeys[i]
      const attr = schema.attributes[key]
      const val = validateValue(data[key], attr, key, schema.name)
    }
  }

  /**
   * Validates data if it's passible to update en existing instance
   * of model with it. All keys of given object must be an attribute of
   * model. All values must passed all attribute restrictions.
   * It's not filling missing attributes with defaults. Missing
   * attributes will stay unchanged. If any validation fails it
   * throws an exception.
   *
   * @param Object data
   * @private
   */
  validators.validForUpdate = async data => {
    // Check if there is any unknonw key
    const dataKeys = Object.keys(data)
    const uKeys = dataKeys.filter(key => schema.attributes.find(key))
    if (uKeys.length) {
      throw error(`Model ${schema.name} hasn't columns ${uKeys} cannot update`)
    }

    for (let i = 0; i < dataKeys.length; i++) {
      const key = dataKeys[i]
      const attr = schema.attributes[key]
      const val = validateValue(data[key], attr, key, schema.name)
    }
  }

  collection = (collection) => {
    const collVal = {}

    collVal.validForAdd = async (key, fKeys) => {

    }

    collVal.validForReset = async (key) => {

    }

    collVal.validForRemovec = async (key, fKeys) => {

    }
  }
}

/**
 * Validate value of one attribute when inserting or updating. If
 * value is missing default value is returned if there is any.
 * Or null is returned if attribute is nullable. Or undefined is
 * is returned and any other validations are not performed. Type
 * is checked as first (after default and nullable).
 *
 * @param Any value Validated value
 * @param Any attr Attribute definition in schema (list of validators)
 * @param Any column Name of column
 * @param Any model Name of model
 * @return Any
 * @private
 */
function validateValue(value, attr, column, model) {
  const object = Object.keys(attr)

  // Nullable needs to allways be present
  if (!object.find('nullable')) {
    attr.nullable = false
    object.push('nullable')
  }

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

    // Exception - if key is nullable and value is after still undefined
    // validation is ended here and undefined value is returend.
    if (key === 'nullable' && value === undefined) {
      break
    }
  }

  return value
}

/**
 * Set of function for type validation. Each check if given data
 * is conform for particular type restriction
 * Each validater has same set of input params. Validator can
 * modify given value, leave it as is or throw en aexception if
 * validation fails.
 *
 * @param String key Parameter for validator
 * @param Any value Validated value
 * @param String column Name of column/attribute
 * @param String model Name of model
 * @return Any
 * @private
 */
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
    if (value === undefined && ref !== undefined) {
      return ref
    }
    return value
  },

  nullable: (bool, value, column, model) => {
    if (!bool && value === null) {
      throw validErr(`model, column,${column} cannot be null`)
    }

    if (bool && value === undefined) {
      return null
    }

    return value
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
      throw validErr(model, column, `${val} is not a Number consider to change model`)
    }
    if (val < ref) {
      throw validErr(model, column, `${val} is lower than ${ref}`)
    }
    return val
  },

  max: (const, val, column, model) => {
    if (typeof val !== 'number') {
      throw validErr(model, column, `${val} is not a Number consider to change model`)
    }
    if (val > ref) {
      throw validErr(model, column, `${val} is grather than ${ref}`)
    }
    return val
  },

  isInt: (bool, value, column, model) => {
    if (!bool) {
      return
    }

    if (value % 1 !== 0) {
      throw validErr(model, column, `${value} is not an Integer`)
    }
    return value
  },

  isUInt: (bool, value, column, model) => {
    if (bool) {
      if (value % 1 !== 0 || value < 0) {
        throw validErr(model, column, `${value} is not an Unsigned Integer`)
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

/**
 * Parse one level of filter object. This function is called
 * recursively. Cravles thru the filter object and return Knex
 * where function chain.
 *
 * @param String key Attribute name or boolean operator
 * @param Object|String value parsed content
 * @return Promise
 * @private
 */
function parseFilterEntry(key, value) {
  // Be sure value is an arry
  if (!(value instanceof Array)) {
    value = [value]
  }

  // If it's a bool operator (AND|OR|NOT)
  const keyOp = operatorWithValue(key)
  if (isBoolOperator(keyOp)) {
    const firstOp = key === '_not' ? boolOperatorFn(keyOp) : 'where'
    const nextOpFn = boolOperatorFn(keyOp)
    return (b) => {
      const promise = b
      for (let i = 0; i < value.length; i++) {
        const item = value[i]
        const keys = Object.keys(item)
        let fn = null

        // if there is more than one expression we split it into
        // andWhere sections
        if (keys.length > 1) {
          fn = parseFilterEntry('_and', keys.map(key => {
            return { key: item[key] }
          }))
        } else {
          fn = parseFilterEntry(keys[0], item[keys[0]])
        }
        if (i == 0) {
          promise[firstOp](fn)
        } else {
          promise[nextOpFn](fn)
        }
      }
    }
  }

  // It's final filter get operator from first item
  // get operator Function ad call it inside returned function
  const opFn = fnFromArrayExpr(value)
  const args = argsFromArrayExpr(value)
  return (b) => {
    b[opFn](key, ...args)
  }
}

/**
 * List of operators considered as bool. In filter object standing
 * as keys.
 */
const BoolOperator = [
  C.FilterOperator.AND,
  C.FilterOperator.OR,
  C.FilterOperator.NOT
]

/**
 * Name of knex Where function used with each operator
 */
const OperatorFn = {
  [C.FilterOperator.AND]: 'andWhere',
  [C.FilterOperator.OR]: 'orWhere',
  [C.FilterOperator.NOT]: 'whereNot',
  [C.FilterOperator.EQUAL]: 'where',
  [C.FilterOperator.LOWER_THEN]: 'where',
  [C.FilterOperator.GREATHER_THEN]: 'where',
  [C.FilterOperator.EQUAL_LOWER_THEN]: 'where',
  [C.FilterOperator.EQUAL_GREATHER_THEN]: 'where',
  [C.FilterOperator.IN]: 'whereIn',
  [C.FilterOperator.NOT_IN]: 'whereNotIn'
  [C.FilterOperator.LIKE]: 'where'
}

/**
 * SQL sign used as operator
 */
const OperatorSign = {
  [C.FilterOperator.AND]: 'AND',
  [C.FilterOperator.OR]: 'OR',
  [C.FilterOperator.NOT]: 'NOT',
  [C.FilterOperator.EQUAL]: '=',
  [C.FilterOperator.NOT_EQUAL]: '<>',
  [C.FilterOperator.LOWER_THEN]: '<',
  [C.FilterOperator.GREATHER_THEN]: '>',
  [C.FilterOperator.EQUAL_LOWER_THEN]: '<=',
  [C.FilterOperator.EQUAL_GREATHER_THEN]: '>=',
  [C.FilterOperator.IN]: 'IN',
  [C.FilterOperator.NOT_IN]: 'NOT IN'
  [C.FilterOperator.LIKE]: 'LIKE'
}

/**
 * Number of operands for operator. Unlisted operators are unrestricted.
 * Frist operand is not counted (=> EQUAL has 2 operands, etc.)
 */
const OperatorOperands = {
  [C.FilterOperator.NOT]: 1,
  [C.FilterOperator.EQUAL]: 1,
  [C.FilterOperator.NOT_EQUAL]: 1,
  [C.FilterOperator.LOWER_THEN]: 1,
  [C.FilterOperator.GREATHER_THEN]: 1,
  [C.FilterOperator.EQUAL_LOWER_THEN]: 1,
  [C.FilterOperator.EQUAL_GREATHER_THEN]: 1,
  [C.FilterOperator.LIKE]: 1
}

/**
 * Returns operator symbol with given value.
 *
 * @param String value
 * @return String
 * @private
 */
function operatorWithValue(value) {
  return Object.keys(C.FilterOperator)
  .find(key => C.FilterOperator[key] === value)
}

/**
 * Returns knex where function name for boolean operator.
 *
 * @param String value
 * @return String
 * @private
 */
function boolOperatorFn(key) {
  return OperatorFn[key]
}

/**
 * Checks if given operator is bool type.
 *
 * @param String operator
 * @return Boolean
 * @private
 */
function isBoolOperator(operator) {
  return BoolOperator.search(operator)
}

/**
 * Returns knex where function name based on operator in the
 * given expression.
 *
 * @param Array arr Array with expression. Operator is first
 * @return String
 * @private
 */
function fnFromArrayExpr(arr) {
  let op = operatorWithValue(arr[0])

  if (!op) {
    op = C.FilterOperator.EQUAL
  }

  return OperatorFn[op]
}

/**
 * Extract argument list from expression in array. Based on operator.
 *
 * @param Array arr
 * @return Array
 * @private
 */
function argsFromArrayExpr(arr) {
  let op = operatorWithValue(arr[0])

  if (OperatorOperands[op] === 1 && arr.length === 2) {
    return [OperatorSign[op], arr[1]]
  } else {
    return arr
  }
}

/**
 * Create an error object with given text.
 *
 * @param String text
 * @return Error
 * @private
 */
function error(text) {
  return new Error(`Kpex Validator: ${text}`)
}

/**
 * Create an error specific to model and column (attribute).
 *
 * @param String model
 * @param String column
 * @param String text
 * @return Error
 * @private
 */
function validErr(model, column, text) {
  return error(`Column ${mode}.${column}: ${text}`)
}
