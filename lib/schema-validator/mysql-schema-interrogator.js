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
  const itrgtr = dflt(knex)

  itrgtr.tables = async () => {
    return await knex.raw('SHOW TABLES')
  }

  itrgtr.tableColumns = async (table) => {
    const columns = await knex.raw(`SHOW COLUMNS FROM ${table}`)
    const dict = {}
    columns.forEach(column => {
      const name = column[0]
      const kpexColumn = {
        type: mysqlTypeToKpex(column[1]),
        nullable: column[2],
        primaryKey: column[3],
        default: column[4]
      }
      const extra = column[5]
      // TODO parse extra column

      mysqlTypeContraintsToKpex(column, kpexColumn])
    })

    return dict
  }

  return itrgtr
}

function mysqlTypeToKpex(mysqlType) {
  // TODO
}

function mysqlTypeContraintsToKpex(mysqlColumn, kpexColumn) {
  // TODO
}
