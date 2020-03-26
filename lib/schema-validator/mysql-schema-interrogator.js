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

const typeBinding = {
  VARCHAR : String,
  CHAR : String,
  TEXT : String,
  TINYTEXT : String,
  MEDIUMTEXT : String,
  LONGTEXTTEXT : String,
  BOLB : C.Type.BINARY,
  MEDIUMBOLB : C.Type.BINARY,
  LONGBOLB : C.Type.BINARY,
  TINYINT : Number,
  SMALLINT : Number,
  MEDIUMINT : Number,
  INT : Number,
  BIGINT : Number,
  FLOAT : Number,
  DOUBLE : Number,
  DECIMAL : Number,
  BOOLEAN : C.Type.BOOLEAN,
  DATE : Date,
  TIME : Date,
  DATETIME : Date,
  TIMESTAMP : Date,
  ENUM : String,
  SET : String,
  JSON : C.Type.JSON
}

const mysqlTypeBounds = {
  TINYINT : [-128, 127],
  SMALLINT : [-32768, 32767],
  MEDIUMINT : [-8388608, 8388607],
  INT : [-2147483648, 2147483647],
  BIGINT : [-9223372036854775808, 9223372036854775807], // ... bigger than javascript int
  VARCHAR : [1, 65535],
  CHAR : [1, 255]
}

function mysqlTypeToKpex(mysqlType) {
  mysqlType = mysqlType.toUpperCase()
  const type = typeBinding(mysqlType.split('(')[0])
  if (!type) {
    throw error(`Unknown MySQL type ${mysqlType}`)
  }
  return type
}

function mysqlTypeContraintsToKpex(mysqlColumn, kpexColumn) {
  const mysqlTypeParts = mysqlColumn[1].toUpperCase().split('(')
  const mysqlType = mysqlTypeParts[0]
  const mysqlSize = mysqlTypeParts.length > 1
    ? parseInt(mysqlTypeParts[1].splite(')')[0]) : null

  if (kpexColumn.type === String) {
    kpexColumn.maxLength = mysqlTypeBounds[mysqlType][1]
  } else if (kpexColumn.type === Number) {
    if (isInt(mysqlType)) {
      kpexColumn.min = mysqlTypeBounds[mysqlType][0]
      kpexColumn.max = mysqlTypeBounds[mysqlType][1]
    }
  }
}

function isIntType(mysqlType) {
  return !!['TINYINT','SMALLINT','MEDIUMINT','INT','BIGINT'].find(mysqlType)
}

function error(text) {
  return new Error(`MySQL Schema Interrogator: ${text}`)
}
