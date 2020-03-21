'use strict'

const C = require('../const.js')

exports = module.exports = createFactory

function createFactory(ctx) {
  return async (data<, trx) => {
    trx = await ctx.ds.getTrx(trx)

    const clbPayload = {
      data: data,
      trx: trx
    }

    // validations and query params
    await ctx.callbackFn(C.Callback.BEFORE_VALIDATIONS, clbPayload)
    data = await ctx.validator.validForInsert(data)
    clbPayload.data = data

    // query
    await ctx.callbackFn(C.Callback.BEFORE_QUERY, clbPayload)
    const res = await trx.table(ctx.schema.table).insert(data)

    // end
    await ctx.callbackFn(C.Callback.THE_END, clbPayload)
    return res[0]
  }
}
