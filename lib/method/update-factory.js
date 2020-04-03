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
 * Expose update factory method
 */
exports = module.exports = updateFactory

/**
 * Return method to update an instance of model in datastore.
 * Method is related to one specific model.
 *
 * @param Object ctx Context to use by create method.
 * @return Function
 * @private
 */
function updateFactory(ctx) {
  /**
   * Method to update an instance of model in datastore.
   *
   * @param Number|String|Array key Primary key of required instance.
   * @param Object data Updated data of instance in datastore.
   * @param {Function} trx Optional transaction
   * @return Any
   * @api public
   */
  return async (key, data, trx) => {
    trx = await ctx.ds.getTrx(trx)

    const clbPayload = {
      method: C.Method.UPDATE,
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
