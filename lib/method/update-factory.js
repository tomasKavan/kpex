'use strict'

const C = require('../const.js')

exports = module.exports = updateFactory

function updateFactory(ctx) {
  return async (key, data, trx) => {
    trx = await ctx.ds.getTrx(trx)

    const clbPayload = {
      key: key,
      data: data,
      trx: trx
    }

    // validations and query params
    await ctx.callbackFn(C.Callback.BEFORE_VALIDATIONS, clbPayload)
    data = await ctx.validator.validForUpdate(key, data)
    const where = await ctx.validator.whereForKey(key)
    clbPayload.data = data

    // query
    await ctx.callbackFn(C.Callback.BEFORE_QUERY, clbPayload)
    const res = await trx.table(ctx.schema.table).update(data)
    .where(where).limit(1)

    // end
    await ctx.callbackFn(C.Callback.THE_END, clbPayload)
    return
  }
}
