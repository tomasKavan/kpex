/*!
 * derouter
 * Copyright(c) 2020 Tomas Kavan
 * BSD 2-Clause Licensed
 */

'use strict'

/**
 * Import 3rd party module dependencies
 */
const knex = require('knex')

/**
 * Import local dependencies
 */
const schemaParser = require('./helper/schema-parser.js')
const schemaValidator = require('./schema-validator/schema-validator.js')
const C = require('./const.js')

const models = {}
const ds = {
  knex: null,
  schmeaValidator: null,
  getTrx
}
let configured = false

/**
 * Expose config parsing
 */
exports = module.exports = createModel

/**
 * Creates new model with given schema. Model object is created with
 * default CRUD methods (find, findOne, create, update, delete). Custom
 * methods and callbacks can be added in schema.
 *
 * @param Object schema Schema describing model, it's params, relations,
 *                      custom methods and callbacks
 * @return Object
 * @api public
 */
async function createModel(schema) {
  // if model already exists, return it
  let model = null
  try {
    model = getModel(schema.name)
  } catch(e) {}

  if (model) {
    return model
  }

  // Parse schema and create new model
  schemaParser(schema)
  schemaValidator(schema)
  model = modelFacotry(schema, getModel, getKnex)

  // Save created model
  models[schema.name] = model

  return model
}

/**
 * Returns registered model with given name.
 *
 * @param String name
 * @return Object
 * @api public
 */
function getModel(name) {
  if (!models[name]) {
    throw error(`Model ${name} doesn't exist`)
  }
  return models[name]
}

/**
 * Configure module connection to dataset. Create knex instance.
 * Can be called only once. Need's to be called before model any
 * model was registered.
 *
 * @param Object config
 * @api public
 */
function async configure(config) {
  if (configured) {
    throw error('Already configured. Cannot configure a second time.')
  }

  // TODO configure

  // create schema validator
  await schemaValidator.init(ds.knex)

  configured = true
}

/**
 * Return an instance of knex. Can be called after model was configured
 *
 * @return Object Knex instance
 * @api public
 */
function getKnex() {
  return ds.knex
}

/**
 * Creates new datastore transaction.
 *
 * @return Promise
 * @api public
 */
async function getTrx(trx) {
  if (trx) {
    return trx
  }

  return await ds.knex.transaction()
}

/**
 * Bind API to exported object (function)
 */
createModel.model = getModel
createModel.configure = configure
createModel.ds = ds
createModel.getTrx = getTrx
createModel.Type = C.Type
createModel.whenReady = schmeaValidator.whenReady

/**
 * Create an error object with given text.
 *
 * @param String text
 * @return Error
 * @private
 */
function error(text) {
  return new Error(`Kpex: ${text}`)
}
