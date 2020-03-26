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
 * Expose callbac factory function
 */
exports = module.exports = callbackFactory

/**
 * Return method to invoke registered callbacks. Callback are related to
 * the model schema passed in schema param.
 *
 * @param Object schema Model schema
 * @return Function
 * @private
 */
function callbackFactory(schema) {
  /**
   * Method for invoking registered callbacks.
   *
   * @param String type Type of callback.
   * @param Object payload Payload passed to claaback
   * @return
   * @api public
   */
  return async (type, payload) => {
    payload.model = schema.name

    let list = schema[type]
    if (!(list instanceof Array)) {
      list = [list]
    }
    for(let i = 0; i < list.length; i++) {
      list[i](type, payload)
    }
  }
}
