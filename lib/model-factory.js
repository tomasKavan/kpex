/*!
 * derouter
 * Copyright(c) 2020 Tomas Kavan
 * BSD 2-Clause Licensed
 */
'use strict'

/**
* Import local dependencies
*/
const C = require('./const.js')
const validatorFactory = require('./helper/validator-factory.js')
const callbackFactory = require('./helper/callback-factory.js')
const populateFactory = require('./helper/populate-factory.js')
const schemaValidator = require('./schema-validator/schema-validator.js')

/**
* Import model methods factory functions
*/
const findFactory = require('./method/find-factory.js')
const findOneFactory = require('./method/find-one-factory.js')
const createFactory = require('./method/create-factory.js')
const updateFactory = require('./method/update-factory.js')
const deleteFactory = require('./method/delete-factory.js')

/**
 * Expose factory function
 */
exports = module.exports = factory

/**
 * Creates a model with given schema. Schema must be already validated or
 * pending validation. All standard methods are manufactured.
 *
 * @param Object schema
 * @param Function getModel get model funciton to pass into populateFn
 * @param Object ds Datastore
 * @return Object
 * @private
 */
function factory(schema, getModel, ds) {

  // Helpers customised for this model
  const populateFn = populateFactory(schema, getModel, ds)
  const callbackFn = callbackFactory(schema)
  const validator = validatorFactory(schema)

  // Assembly context for method factory functions
  const methodCtx = {
    populateFn: populateFn,
    callbackFn: callbackFn,
    validator: validator,
    getModel: getModel,
    schema: schema,
    ds: ds
  }

  // Create model with basic methods and params
  const model = {
    schema: schema,
    ds: ds,
    ready: modelReadyFactory(name),
    [C.Method.FIND]: findFactory(methodCtx),
    [C.Method.FIND_ONE]: findOneFactory(methodCtx),
    [C.Method.CREATE]: createFactory(methodCtx),
    [C.Method.UPDATE]: updateFactory(methodCtx),
    [C.Method.DELETE]: deleteFactory(methodCtx),
    collection: collectionFactory(methodCtx)
  }

  // Register custom actions
  if (schema.actions && typeof schema.actions === 'Object') {
    const keys = Object.keys(schema.actions)
    keys.forEach(key => {
      if (typeof schema.actions[key] === 'function') {
        // Binding method context (reachable thru this in custom
        // function)
        model[key] = schema.actions[key].bind(methodCtx)
      }
    })
  }

  // return assembled model
  return model
}

/**
 * Returns async funciton waiting until model is ready to use.
 *
 * @param String name Name of the model
 * @return Function
 */
function modelReadyFactory(name) {
  return async () => {
    await schemaValidator.whenModelReady(name)
  }
}
