'use strict'

const C = require('../const.js')

exports = module.exports = findFactory

function findFactory(ctx) {
  return async (filter, populate, trx) => {
    trx = await ctx.ds.getTrx(trx)

    const clbPayload = {
      filter: filter,
      populate: populate,
      trx: trx
    }

    // validations and query params
    await ctx.callbackFn(C.Callback.BEFORE_VALIDATIONS, clbPayload)
    const columns = await ctx.validator.columnsForSelect(C.Enum.LIST)
    const filterFn = await ctx.validator.parseFilter(filter)
    const limit = await ctx.validator.parseLimit(filter)
    const offset = await ctx.validator.parseOffset(filter)

    // query
    await ctx.callbackFn(C.Callback.BEFORE_QUERY, clbPayload)
    const res = await trx.table(ctx.schema.table).select(columns)
    .where(filterFn).limit(limit).offset(offset)

    clbPayload.res = res[0]

    // populate
    await ctx.callbackFn(C.Callback.BEFORE_POPULATE, clbPayload)
    ctx.populateFn(populate, res, trx)

    // end
    await ctx.callbackFn(C.Callback.THE_END, clbPayload)
    return res[0]
  }
}
