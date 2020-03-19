'use strict'

const C = require('./const.js')
const validatorFactory = require('./helper/validator-factory.js')
const callbackFactory = require('./helper/callback-factory.js')
const populateFactory = require('./helper/populate-factory.js')

exports = module.exports = factory

const deferedChecks = {}

function factory(schema, getModel, getKnex, getTrx) {

  // Helpers customised for this model
  const populate = populateFactory(schema, getModel, getKnex, getTrx)
  const callback = callbackFactory(schema)
  const validator = validatorFactory(schema)

  const model = {}

  model.find = (filter, populate, trx) => {
    trx = getTrx(trx)

    const clbPayload = {
      filter: filter,
      populate: populate,
      trx: trx
    }

    // validations and query params
    callback(C.Callback.BEFORE_VALIDATIONS, clbPayload)
    const columns = validator.columnsForSelect(C.Enum.LIST)
    const filterFn = validator.parseFilter(filter)
    const limit = validator.parseLimit(filter)
    const offset = validator.parseOffset(filter)

    // query
    callback(C.Callback.BEFORE_QUERY, clbPayload)
    return trx.table(schema.table)
    .select(columns).where(filterFn)
    .limit(limit).offset(offset)
    .then(res => {
      clbPayload.res = res[0]

      // populate
      callback(C.Callback.BEFORE_POPULATE, clbPayload)
      populate(populate, res)

      // end
      callback(C.Callback.THE_END, clbPayload)
      return res[0]
    })
  }

  model.findOne = (key, populate, trx) => {
    trx = getTrx(trx)

    const clbPayload = {
      key: key,
      populate: populate,
      trx: trx
    }

    // validations and query params
    callback(C.Callback.BEFORE_VALIDATIONS, clbPayload)
    const columns = validator.columnsForSelect(C.Enum.DETAIL)
    const where = validator.whereForKey(key)

    // query
    callback(C.Callback.BEFORE_QUERY, clbPayload)
    return trx.table(schema.table).select(columns).where(where)
    .then(res => {
      if (!res || !res.length) {
        throw C.NotFound
      }

      clbPayload.res = res[0]

      // populate
      callback(C.Callback.BEFORE_POPULATE, clbPayload)
      populate(populate, res)

      // end
      callback(C.Callback.THE_END, clbPayload)
      return res[0]
    })
  }

  model.create = (data, trx) => {
    trx = getTrx(trx)

    const clbPayload = {
      data: data,
      trx: trx
    }

    // validations and query params
    callback(C.Callback.BEFORE_VALIDATIONS, clbPayload)
    data = validator.validForInsert(data)
    clbPayload.data = data

    // query
    callback(C.Callback.BEFORE_QUERY, clbPayload)
    return trx.table(schema.table).insert(data)
    .then(res => {
      // end
      callback(C.Callback.THE_END, clbPayload)
      return res[0]
    })
  }

  model.update = (key, data, trx) => {
    trx = getTrx(trx)

    const clbPayload = {
      key: key,
      data: data,
      trx: trx
    }

    // validations and query params
    callback(C.Callback.BEFORE_VALIDATIONS, clbPayload)
    data = validator.validForUpdate(key, data)
    const where = validator.whereForKey(key)
    clbPayload.data = data

    // query
    callback(C.Callback.BEFORE_QUERY, clbPayload)
    return trx.table(schema.table).update(data).where(where).limit(1)
    .then(res => {
      // end
      callback(C.Callback.THE_END, clbPayload)
      return
    })
  }

  model.delete = (key, trx) => {
    trx = getTrx(trx)

    const clbPayload = {
      key: key,
      trx: trx
    }

    // validations and query params
    callback(C.Callback.BEFORE_VALIDATIONS, clbPayload)
    const where = validator.whereForKey(key)

    // query
    callback(C.Callback.BEFORE_QUERY, clbPayload)
    return trx.table(schema.table).delete(data).where(where).limit(1)
    .then(res => {
      // end
      callback(C.Callback.THE_END, clbPayload)
      return
    })
  }

  // register custom actions
  if (schema.actions && typeof schema.actions === 'Object') {
    const keys = Object.keys(schema.actions)
    keys.forEach(key => {
      if (typeof schema.actions[key] === 'function') {
        model[key] = schema.actions[key]
      }
    })
  }

  // save or/and resolve defered checks


  // return assembled model
  return model
}
