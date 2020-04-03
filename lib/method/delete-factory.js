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
 * Expose delete factory method
 */
exports = module.exports = deleteFactory

/**
 * Return method to delte one instance of model in datastore.
 * Method is related to one specific model.
 *
 * @param Object ctx Context to use by create method.
 * @return Function
 * @private
 */
function deleteFactory(ctx) {
  /**
   * Method to delete an instance of model in datastore.
   *
   * @param Number|String|Array key Primary key of deleted instance.
   * @param {Function} trx Optional transaction
   * @return Any
   * @api public
   */
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
