'use strict'

const C = require('../const.js')

exports = module.exports = deleteFactory

function deleteFactory(ctx) {
  return async (key, trx) => {
    trx = await ctx.ds.getTrx(trx)

    const clbPayload = {
      method: C.Method.DELETE
      key: key,
      trx: trx
    }

    // validations and query params
    await ctx.callbackFn(C.Callback.BEFORE_VALIDATIONS, clbPayload)
    const where = await ctx.validator.whereForKey(key)

    // query
    await ctx.callbackFn(C.Callback.BEFORE_QUERY, clbPayload)
    const res = await trx.table(ctx.schema.table).delete(data)
    .where(where).limit(1)

    // end
    await ctx.callbackFn(C.Callback.THE_END, clbPayload)
    return
  }
}
