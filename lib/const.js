'use strict'

const Callback = {
  BEFORE_VALIDATIONS: 'onBeforeValidations',
  BEFORE_QUERY: 'onBeforeQuery',
  BEFORE_POPULATE: 'onBeforePopulate',
  THE_END: 'onTheEnd'
}

const Method = {
  FIND: 'find',
  FIND_ONE: 'findOne',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  COLLECTION: {
    ADD: 'add',
    SET: 'set',
    RESET: 'reset',
    REMOVE: 'remove'
  }
}

const Type = {
  BOOLEAN : 'BOOLEAN',
  JSON : 'JSON',
  BINARY : 'BINARY'
}

const SchemaValidationLevel = {
  BASIC : 'BASIC',
  RELATIONS : 'RELATIONS'
}

const FilterOperator = {
  AND: '_and',
  OR: '_or',
  NOT: '_not',
  EQUAL: '_eq',
  NOT_EQUAL: '_neq',
  LOWER_THEN: '_lt',
  GREATHER_THEN: '_gt',
  EQUAL_LOWER_THEN: '_elt',
  EQUAL_GREATHER_THEN: '_egt',
  IN: '_in',
  NOT_IN: '_nin',
  LIKE: '_like'
}

const NotFound = new Error('Not Found')
NotFound.code = 404
NotFound.status = 'E_NOT_FOUND'

exports = module.exports = {
  Callback,
  Method,
  NotFound,
  Type,
  SchemaValidationLevel
}
