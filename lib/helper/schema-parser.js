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
 * Expose parser function
 */
exports = module.exports = schemaParser

/**
 * Parse model schema. Mainly expanding shortcuts and check syntax.
 *
 * @param Object schema Input schema
 * @return Object
 * @private
 */
function schemaParser(schema) {
  // Expand attribute definition
  // attribute_name: Object –> attribute_name: { type: Object }
  const attrKeys = Object.keys(schema.attributes)
  const typeKeys = Object.keys(C.Type)
  attrKeys.forEach(attr => {
    const def = schema.attributes[attr]
    if (def === String || def === Number || def === Date ||
    typeKeys.indexOf(def) >= 0) {
      schema.attributes[attr] = { type: def }
    }
  })

  // Expand associations
  // assoc_name: String -> assoc_name: { key: assoc_name, model: String }
  // assoc_name: key:model -> assoc_name: { key: key, model: model }
  // TODO: work with composite keys (key1|key2|...:model)
  const assocKeys = Object.keys(schema.associations)
  assocKeys.forEach(assoc => {
    const def = schema.associations[assoc]
    if (typeof def === 'string') {
      schema.associations[assoc] = {
        model: def,
        key: assoc
      }

      const splits = def.split(':')
      if (splits.length > 1) {
        schema.associations[assoc].model = splits[1]
        schema.associations[assoc].key = splits[0]
      }
    }
  })

  // Expand collections
  // coll_name: model:foreign_key -> coll_name: { model: model,
  // foreign_key: foreign_key}
  // TODO: expand composite keys (model:fkey1|fkey2|...)
  const collKeys = Object.keys(schema.collections)
  collKeys.forEach(coll => {
    const def = schema.collections[coll]
    if (typeof def === 'string') {
      const splits = def.split(':')
      if (split.length !== 2) {
        throw error(`Collection definition ${def} is not in model:fkey format`)
      }
      schema.collections[coll] = {
        model: splits[0],
        fkey: splits[1]
      }
    }
  })
}

/**
 * Create an error object with given text.
 *
 * @param String text
 * @return Error
 * @private
 */
function error(text) {
  return new Error(`Schema Parser: ${text}`)
}
