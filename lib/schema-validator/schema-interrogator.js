'use strict'

exports = module.exports = factory

function factory(knex) {
  return {
    knex,
    tables,
    tableColumns
  }
}

function tables(knex) {
  throw error('tables() method not implemented')
}

function tableColumns(knex, table) {
  throw error('tableColumns() method not implemented')
}

function error(text) {
  return new Error(`Schmea Interrgorator: ${text}`)
}
