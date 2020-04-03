/*!
 * derouter
 * Copyright(c) 2020 Tomas Kavan
 * BSD 2-Clause Licensed
 */
'use strict'

/**
 * Import local dependencies
 */
const C = require('../const.js')

/**
 * Expose find factory method
 */
exports = module.exports = findFactory

/**
 * Return method to find list of model instances in datastore.
 * Method is related to one specific model.
 *
 * @param Object ctx Context to use by create method.
 * @return Function
 * @private
 */
function findFactory(ctx) {
  /**
   * Method to find list of instances of model in datastore. Filtered
   * and constrained by given params.
   *
   * @param Object modulate Data inserted to datastore.
   * @param String|Array populate List of collections/associations to
   *                     populate.
   * @param {Function} trx Optional transaction
   * @return Array
   * @api public
   */
  return async (modulate, populate, trx) => {
    trx = await ctx.ds.getTrx(trx)

    const clbPayload = {
      method: C.Method.FIND,
      modulator: modulate,
      populate: populate,
      trx: trx
    }

    // validations and query params
    await ctx.callbackFn(C.Callback.BEFORE_VALIDATIONS, clbPayload)
    const columns = await ctx.validator.columnsForSelect(C.Enum.LIST)
    const filterFn = await ctx.validator.parseFilter(modulate.filter)
    const limit = await ctx.validator.parseLimit(modulate.range)
    const offset = await ctx.validator.parseOffset(modulate.range)
    const order = await ctx.validator.parseOrder(modulate.order)

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
