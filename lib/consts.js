'use strict'

const Callback = {
  BEFORE_VALIDATIONS: 'onBeforeValidations',
  BEFORE_QUERY: 'onBeforeQuery',
  BEFORE_POPULATE: 'onBeforePopulate',
  THE_END: 'onTheEnd'
}

const NotFound = new Error('Not Found')
NotFound.code = 404
NotFound.status = 'E_NOT_FOUND'

exports = module.exports = {
  Callback,
  NotFound
}
