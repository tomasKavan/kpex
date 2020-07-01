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
const attrDef = require('./attribute-definition.js')

/**
 * Expose config parsing
 */
exports = module.exports = validateSchema

/**
 * List of available datastore interrofators. Currently only for
 * mysql is avalable.
 * Once selected based on configuration passed (knex) in init function
 * it's stored in itrgtr module global variable.
 * Variable ds stores knex instance once module is initialized
 */
let itrgtr = null
let ds = null
const InterrogatorClient = {
  mysql: require('./mysql-schema-interrogator.js')
}

/**
 * List of already validated models.
 *
 * List of promises for models. Promise is created for each model
 * when validation is done (is resolved) or when some other model
 * waiting for it (not resolved yet).
 */
const validatedModels = {}
const deferedModelQueue = {}

/**
 * Create promise waiting until schema of datastore is loaded.
 * Schema is stored in model's global variable dsSchema.
 */
let dsSchema = null
const dsSchemaReady = {
  resolve: null,
  reject: null,
  promise: null
}
dsSchemaReady.promise = new Promise((resolve, reject) => {
  dsSchemaReady.resolve = resolve
  dsSchemaReady.reject = reject
})


/**
 * Validates given schema againts datastore's tables and other model's
 * configuration. Validation of relations is defered until related
 * model is defined. Attempt to use unvalidated model leads to exception.
 * Validator checks attributes(columns) types and other contstraints.
 * Validator doesn't check primary or foreign keys.
 *
 * @param Object s Schema describing model, it's params, relations,
 *                      custom methods and callbacks
 * @private
 */
function validateSchema(s) {
  if (!itrgtr) {
    throw modelError(s.name, 'Validator not initialized yet. Cannot validate schema')
  }

  // Wait until schema is loaded from datastore
  whenReady()
  .then(() => {
    // Model's table exists?
    if (!dsSchema[s.tableName]) {
      throw modelError(s.name, `Model table ${s.tableName} doesn't exits`)
    }

    // All attributes:
    const attributes = Object.keys(s.attributes)
    for (let i = 0; i < attributes.length; i++) {
      const name = attributes[i]
      const sattr = s.attributes[name]
      const column = sattr.columName
      const dsattr = dsSchema[s.tableName][column]

      // Attribute has column in datastore
      if (!dsattr) {
        throw modelError(s.name, `Attribute ${name} doesn't exist in datastore`)
      }

      // Attribute and column have equal type
      if (!attrDef.equalOrSmaller(sattr, dsattr)) {
        throw modelError(s.name, `Attribute ${name} definition is not equal `
                                 `to datastore column definition.`)
      }
    }

    // Check if mode primary key is same as in datastore table
    if (!s.primaryKey) {
      throw modelError(s.name, 'model doesn\'t have primary key defined')
    }

    s.primaryKey.forEach(skey => {
      const sattr = s.attributes.find(skey)
      if (!sattr) {
        throw modelError(s.name, `primary key attribute ${skey} desn't exist`)
      }
      const column = dsSchema[s.tableName][sattr.columnName]
      if (!column.primaryKey) {
        throw modelError(s.name, `primary key attribute ${skey} doesn't have `
                                 `corresponding datastore primary key column `
                                 `(${sattr.columName})`)
      }
    })

    // First step (BASIC) of validation is done. Mark it as resolved.
    validatedModels[s.name] = s
    const defered = deferedQueueForModel(s.name, C.SchemaValidationLevel.BASIC)
    defered.resolve()

    // Following can be defered if all modelas are not ready yet
    // Method itself is not async so it's wrapped in nested async
    // function.
    async () => {
      // Check associations
      const assocs = Object.keys(s.associations)
      for (let i = 0; i < assocs.length; i++) {
        const name = assocs[i]
        const assoc = s.associations[name]

        // Wait until associated model is validated (BASIC)
        await deferedQueueForModel(assoc.model, C.SchemaValidationLevel.BASIC)
        const fModel = validatedModels[assoc.model]

        // Check if association key is in attributes
        if (!s.attributes[assoc.key]) {
          throw modelError(s.name, `Association ${name} to ${fModel.name}. `
                                   `Unknow fKey ${assoc.fkey}`)
        }
        // Check if fModel primary Key definition euqals to assoc attribute
        // TODO: composed keys
        const fKeyAttr = fModel.attributes[fModel.primaryKey[0]]
        const myKeyAttr = s.attributes[assoc.key]
        if (!attrDef.equal(fKeyAttr, myKeyAttr)) {
          throw modelError(s.name, `Association ${name}: Keys definition`
                                   ` doesn't match`)
        }
      }

      // Check collections
      const collects = Object.keys(s.collections)
      for (let i = 0; i < collects.length; i++) {
        const name = collects[i]
        const coll = s.collections[i]

        // Wait until associated model is vlaidated
        await deferedQueueForModel(coll.model, C.SchemaValidationLevel.BASIC)
        const fModel = validatedModels[coll.model]

        // It's M:N relation
        if (coll.relatedBy) {
          const rb = coll.relatedBy
          // Check M:N relation table
          const midTable = dsSchema[rb.tableName]
          if (!midTable) {
            throw modelError(s.name, `Collection ${name}: M:N relation table `
                                     `${rb.tableName} is not in the datastore`)
          }
          // TODO: composed keys
          // Check if relation table contains required columns
          const rtfk = midTable[rb.refKey]
          const rtmk = midTable[rb.myKey]
          const fKey = fModel.attributes[fModel.primaryKey[0]]
          const myKey = s.attributes[s.primaryKey[0]]
          if (!rtfk || !rtmk) {
            throw modelError(s.name, `Collection ${name}: One of models (`
                                     `${s.name}, ${fModel.name}) doesn't exist `
                                     `in relation table ${rb.tableName}`)
          }
          // Check if column definition is equal to model and foreign model
          // primary key
          if (!attrDef.equal(rtfk, fKey) || !attrDef.equal(rtmk, myKey)) {
            throw modelError(s.name, `Collection ${name}: Relation table `
                                     `${rb.tableName} key columns definition `
                                     `is not equal to one of models keys`)
          }
        // It's 1:N relation
        } else {
          // Check if fModel key attribute definition equals to this model's
          // primary key
          // TODO: composed keys
          const fKeyAttr = fModel.attributes[coll.fKey]
          const myKeyAttr = s.attributes[s.primaryKey[0]]
          if (!fKeyAttr) {
            throw modelError(s.name, `Collection ${name}: Key ${coll.fKey} at `
                                     `model ${fModel.name} doesn't exist`)
          }
          if (!attrDef.equal(fKeyAttr, myKeyAttr)) {
            throw modelError(s.name, `Collection ${name}: Keys definition`
                                     ` doesn't match`)
          }
        }
      }

      // If there is some custom validator run it!
      if (s.schemaValidator && typeof s.schemaValidator === 'function') {
        await s.schemaValidator({
          ds,
          deferedQueueForModel
        })
      }

      // Second step (RELATIONS) of validation is done. Mark it as resolved.
      const defered = deferedQueueForModel(
        s.name,
        C.SchemaValidationLevel.RELATIONS
      )
      defered.resolve()
    }
  })
}

/**
 * Initialization and configuration of schem validator module.
 * It select interrogator based on knex client*. And starts
 * interrogate datastore's client about it's schema.
 *
 * Method doesn't wait for ds schema but returns. It's usually
 * called in the main script and should be synchronous.
 *
 * When ds schema is loaded dsSchemaReady promise is resolved.
 * All waiting model's validations and external hooks are unblocked.
 *
 * *Knex doesn't have uniform way to get schema informations from
 *  any client.
 *
 * @param Object knex Instance of knex
 * @private
 */
function init(knex) {
  // save knex instance
  ds = knex

  // Select interrogator
  itrgtr = interrogatorClient[datastore.knex.client](datastore.knex)

  // Interrogate datastore client about it's schema
  itrgtr.tables()
  .then(tables => {
    dsSchema = {}
    return Promise.all(tables.map(table => {
      return itrgtr.tableColumns(table)
      .then(columns => {
        dsSchema[table] = columns
      })
    }))
  })
  .then(dsSchemaReady.resolve, dsSchemaReady.reject)
}

/**
 * Returns promise fulfilled when validator is configured and ready to
 * validate models.
 *
 * @return Promise
 * @api public
 */
function whenReady() {
  return dsSchemaReady.promise
}

/**
 * Returns promise fulfilled when validation of model is completely done
 *
 * @param String name Model name
 * @return Promise
 * @api public
 */
function whenModelReady(name) {
  const deferer = deferedQueueForModel(name, C.SchemaValidationLevel.RELATIONS)
  return deferer.promise
}

/**
 * Expose public function to module.exports object
 */
validateSchema.init = init
validateSchema.whenReady = whenReady
validateSchema.whenModelReady = whenModelReady

/**
 * Returns deferer object for given model and level of validation.
 * If such object doesn't exist it's created.
 *
 * @param String name
 * @param String level Level of validation from C.SchemaValidationLevel
 * @return Object
 * @private
 */
function deferedQueueForModel(name, level) {
  if (!deferedModelQueue[name]) {
    deferedModelQueue[name] = {}
  }
  if (!deferedModelQueue[name][level]) {
    let resolve = null
    let reject = null
    const promise = new Promise((res, rej) => {
      resolve = res
      rej = rej
    })
    deferedModelQueue[name][level] = {
      promise: promise,
      resolve: resolve,
      reject: reject
    }
  }

  return deferedModelQueue[name][level]
}

/**
 * Create an error object with given text.
 *
 * @param String text
 * @return Error
 * @private
 */
function error(text) {
  return new Error(`Schmea Validator: ${text}`)
}

/**
 * Create an error object with given text. Text of error is related
 * to model.
 *
 * @param String text
 * @param String model
 * @return Error
 * @private
 */
function modelError(model, text) {
  return error(`Model ${model}: ${text}`)
}
