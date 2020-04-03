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
 * Expose create factory method
 */
exports = module.exports = createFactory

/**
 * Return method to create new instance of model in datastore.
 * Method is related to one specific model.
 *
 * @param Object ctx Context to use by create method.
 * @return Function
 * @private
 */
function createFactory(ctx) {
  /**
   * Method for create new instance of model in datastore. Returns
   * primary key of inserted instance.
   *
   * @param Object data Data inserted to datastore.
   * @param {Function} trx Optional transaction
   * @return Any
   * @api public
   */
  return async (data, trx) => {
    trx = await ctx.ds.getTrx(trx)

    const clbPayload = {
      method: C.Method.CREATE,
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
    clbPayload.insertedId = res[0]
    await ctx.callbackFn(C.Callback.THE_END, clbPayload)
    return res[0]
  }
}
