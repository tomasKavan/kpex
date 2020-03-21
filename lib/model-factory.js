'use strict'

const C = require('./const.js')
const validatorFactory = require('./helper/validator-factory.js')
const callbackFactory = require('./helper/callback-factory.js')
const populateFactory = require('./helper/populate-factory.js')

const findFactory = rewuire('./method/find-factory.js')
const findOneFactory = rewuire('./method/find-one-factory.js')
const createFactory = rewuire('./method/create-factory.js')
const updateFactory = rewuire('./method/update-factory.js')
const deleteFactory = rewuire('./method/delete-factory.js')

exports = module.exports = factory

const deferedChecks = {}

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
    getModel: getMoedl,
    schema: schema,
    ds: ds
  }

  // Create model with basic methods and params
  const model = {
    schema: schema,
    ds: ds,
    find: findFactory(methodCtx),
    findOne: findOneFactory(methodCtx),
    create: createFactory(methodCtx),
    update: updateFactory(methodCtx),
    delete: deleteFactory(methodCtx),
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

  // save or/and resolve defered checks
  

  // return assembled model
  return model
}
