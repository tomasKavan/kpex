'use strict'

const C = require('../const.js')

exports = module.exports = findOneFactory

function findOneFactory(ctx) {
  return async (key, populate, trx) => {
    trx = await ctx.ds.getTrx(trx)

    const clbPayload = {
      method: C.Method.FIND_ONE,
      key: key,
      populate: populate,
      trx: trx
    }

    // validations and query params
    await ctx.callbackFn(C.Callback.BEFORE_VALIDATIONS, clbPayload)
    const columns = await ctx.validator.columnsForSelect(C.Enum.DETAIL)
    const where = await ctx.validator.whereForKey(key)

    // query
    await ctx.callbackFn(C.Callback.BEFORE_QUERY, clbPayload)
    const res = await trx.table(ctx.schema.table).select(columns)
    .where(where)

    if (!res || !res.length) {
      throw C.NotFound
    }

    clbPayload.res = res[0]

    // populate
    await ctx.callbackFn(C.Callback.BEFORE_POPULATE, clbPayload)
    await ctx.populateFn(populate, res, trx)

    // end
    await ctx.callbackFn(C.Callback.THE_END, clbPayload)
    return res[0]
  }
}
