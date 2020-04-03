/*!
 * kpex
 * Copyright(c) 2020 Tomas Kavan
 * BSD 2-Clause Licensed
 */
'use strict'

/**
* Import local dependencies
*/
const C = require('../const.js')

/**
 * Expose "find one" factory method
 */
exports = module.exports = findOneFactory

/**
 * Return method to find one instance of model in datastore.
 * Method is related to one specific model.
 *
 * @param Object ctx Context to use by create method.
 * @return Function
 * @private
 */
function findOneFactory(ctx) {
  /**
   * Method to find instance of model in datastore.
   *
   * @param Number|String|Array key Primary key of required instance.
   * @param String|Array populate List of collections/associations to
   *                     populate.
   * @param {Function} trx Optional transaction
   * @return Any
   * @api public
   */
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
