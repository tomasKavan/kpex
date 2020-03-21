'use strict'

exports = module.exports = factory

function factory(schema, getModel, getKnex, getTrx) {
  return async (relations, data, trx) => {
    trx = getTrx(trx)

    const toPopulate = parseRelations(relations)
    const columns = Object.keys(toPopulate)

    for (let i = 0; i < columns; i++) {
      const column = columns[i]

      
    }
  }
}

function parseRelations(input) {

}
