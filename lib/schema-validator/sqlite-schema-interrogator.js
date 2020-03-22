/*!
 * derouter
 * Copyright(c) 2020 Tomas Kavan
 * BSD 2-Clause Licensed
 */
 'use strict'

 /**
  * Import local dependencies
  */
const dflt = require('./schema-interrogator.js')

/**
 * Expose config parsing
 */
exports = module.exports = factory

/**
 * Returns set of functions to obtain datastore schema
 *
 * @param Object knex A Knex instance
 * @return Object
 * @private
 */
function factory(knex) {
  // TODO
  return dflt(knex)
}
