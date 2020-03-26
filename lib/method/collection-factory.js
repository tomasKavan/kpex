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
 * Expose collection factory method
 */
exports = module.exports = collectionFactory

/**
 * Return factory function assembling function to manipulate with
 * model collections.
 *
 * @param Object ctx Context to use by collection factory function and
 *                   methods created by it.
 * @return Function
 * @private
 */
function collectionFactory(ctx) {
  return (collection) => {
    // Check if collection exists on model and if this collection is
    // M:N type
    // TODO: usage on 1:N relations
    const collDef = ctx.schema.collections[collection]
    if (!collDef) {
      throw error(`${collection} is not exist on model ${ctx.schema.name}`)
    }

    if (!collDef.relatedBy) {
      throw error(`${collection} on model ${ctx.schema.name} is not M:N`)
    }

    const collFns = {}

    /**
     * Add one or more instance into the collection.
     *
     * @param String myKey Primary key of model to which collection
     *                     belongs to.
     * @param String|Array fKeys Primary Key(s) of referenced model
     * @param {Function} trx Optional transaction
     * @return Any|Array
     * @api public
     */
    collFns[C.Method.COLLECTION.ADD] = async (myKey, fKeys, trx) => {
      trx = await ctx.ds.getTrx(trx)

      if (!(fKeys instanceof Array)) {
        fKeys = [fKeys]
      }

      const clbPayload = {
        method: C.Method.COLLECTION.ADD,
        key: myKey,
        data: fKeys,
        trx: trx
      }

      // validations and query params
      await ctx.callbackFn(C.Callback.BEFORE_VALIDATIONS, clbPayload)
      data = await ctx.validator
      .collection(collection)
      .validForAdd(myKey, fKeys)
      clbPayload.data = data

      // query
      await ctx.callbackFn(C.Callback.BEFORE_QUERY, clbPayload)
      const res = await trx.table(collDef.relatedBy.tableName).insert(data)

      // end
      clbPayload.insertedId = res[0]
      await ctx.callbackFn(C.Callback.THE_END, clbPayload)
      return res[0]
    }

    /**
     * Set one or more instance into the collection (replces old ones).
     *
     * @param String myKey Primary key of model to which collection
     *                     belongs to.
     * @param String|Array fKeys Primary Key(s) of referenced model
     * @param {Function} trx Optional transaction
     * @return Any|Array
     * @api public
     */
    collFns[C.Method.COLLECTION.SET] = async (myKey, fKeys, trx) => {
      trx = await ctx.ds.getTrx(trx)

      await collFns.reset(myKey, trx)
      return await collFns.add(myKey, fKeys, trx)
    }

    /**
     * Remoes all instances from the collection.
     *
     * @param String myKey Primary key of model to which collection
     *                     belongs to.
     * @param {Function} trx Optional transaction
     * @return Any|Array
     * @api public
     */
    collFns[C.Method.COLLECTION.RESET] = async (myKey, trx) => {
      trx = await ctx.ds.getTrx(trx)

      const clbPayload = {
        model: ctx.schema.name,
        method: C.Method.COLLECTION.RESET,
        key: myKey,
        trx: trx
      }

      // validations and query params
      await ctx.callbackFn(C.Callback.BEFORE_VALIDATIONS, clbPayload)
      await ctx.validator.collection(collection).validForReset(myKey)

      // query
      await ctx.callbackFn(C.Callback.BEFORE_QUERY, clbPayload)
      await trx.table(collDef.relatedBy.tableName)
      .where(collDef.relatedBy.myKey, myKey).delete()

      // end
      await ctx.callbackFn(C.Callback.THE_END, clbPayload)¨return
    }

    /**
     * Removes one or more instance from the collection.
     *
     * @param String myKey Primary key of model to which collection
     *                     belongs to.
     * @param String|Array fKeys Primary Key(s) of referenced model
     * @param {Function} trx Optional transaction
     * @return Any|Array
     * @api public
     */
    collFns[C.Method.COLLECTION.REMOVE] = async (myKey, fKeys, trx) => {
      trx = await ctx.ds.getTrx(trx)

      if (!(fKeys instanceof Array)) {
        fKeys = [fKeys]
      }

      const clbPayload = {
        model: ctx.schema.name,
        method: C.Method.COLLECTION.REMOVE,
        key: myKey,
        data: fKeys,
        trx: trx
      }

      // validations and query params
      await ctx.callbackFn(C.Callback.BEFORE_VALIDATIONS, clbPayload)
      data = await ctx.validator
      .collection(collection)
      .validForRemove(myKey, fKeys)
      clbPayload.data = data

      // query
      await ctx.callbackFn(C.Callback.BEFORE_QUERY, clbPayload)
      await trx.table(collDef.relatedBy.tableName)
      .where(collDef.relatedBy.myKey, myKey)
      .whereIn(collDef.relatedBy.refKey, fKeys)

      // end
      await ctx.callbackFn(C.Callback.THE_END, clbPayload)
      return
    }
  }

  return collFns
}

/**
 * Create an error object with given text.
 *
 * @param String text
 * @return Error
 * @private
 */
function error(text) {
  return new Error(`Collection: ${text}`)
}
