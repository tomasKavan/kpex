/*!
 * derouter
 * Copyright(c) 2020 Tomas Kavan
 * BSD 2-Clause Licensed
 */
'use strict'

/**
 * Expose factory function
 */
exports = module.exports = factory

/**
 * Returns function to populate relations
 *
 * TODO: composed keys
 * TODO: nested population
 * TODO: optimalization: when populating collection of data, target
 *       models should be queried only once using IN operator. To
 *       restrict amount of DB queries.
 *
 * @param Object schema
 * @param Function getModel
 * @param Object ds
 * @return Function
 * @private
 */
function factory(schema, getModel, ds) {
  return async (relations, dataList, trx) => {
    // Nothing to populate?
    if (!dataList) {
      return
    }

    if (!(dataList instanceof Array)) {
      dataList = [dataList]
    }
    trx = ds.getTrx(trx)

    const toPopulate = parseRelations(relations)

    // Iterate over input list
    for (let j = 0; j < dataList.length; j++) {
      const data = dataList[j]

      // Iterate over all relations to populate
      for (let i = 0; i < toPopulate.length; i++) {
        const key = toPopulate[i]

        const rel = schema.associations[key]
        || schema.collections[key]

        if (!rel) {
          throw error(`Unknown relation ${key} on model ${schema.name}`)
        }

        const model = getModel(rel.model)

        if (rel.relatedBy) {
          // M:N relation
          const refList = await trx(rel.relatedBy.tableName)
          .where(rel.relatedBy.myKey, data[schema.primaryKey])

          const filter = {
            model.schema.primaryKey: [
              'IN',
              refList.map(item => item[rel.relatedBy.refKey])
            ]
          }
          data[key] = await model.find({ filter: filter }, null, trx)
        } else if (rel.fKey) {
          // N:1 relation
          data[key] = await model.findOne(data[key], null, trx)

        } else {
          const filter = {
            model.schema.primaryKey: ['=', rel.myKey]
          }
          // 1:N relation
          data[key = await model.find({ filter: filter}, null, trx)]
        }
      }
    }
  }
}

/**
 * Parse string with list of attributes to populate and return an array.
 *
 * @param String|Array input
 * @return Array
 * @private
 */
function parseRelations(input) {
  if (typeof input === 'string') {
    input = input.split(',')
  }
  return input
}

/**
 * Create an error object with given text.
 *
 * @param String text
 * @return Error
 * @private
 */
function error(text) {
  return new Error(`Kpex Populate: ${text}`)
}
