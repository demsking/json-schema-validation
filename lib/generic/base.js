'use strict'

const ValidationError = require('../error')

const globalKeywords = {
  default (value, data) {
    if (typeof data.value === 'undefined') {
      data.value = value
    }

    return true
  },
  required (value, data) {
    if (value === true) {
      return typeof data.value !== 'undefined'
    }
    return true
  }
}

const validateKeywords = function (data) {
  const errors = []
  const exclude = ['type', 'default']
  const filterSchemaKeywords = (item) =>
    exclude.indexOf(item) === -1 && this._keywords.hasOwnProperty(item)

  const validateKeyword = (entry) => {
    const keyword = entry.keyword
    const result = entry.validate.apply(this, [ entry.value, data ])

    if (result === true) {
      return
    }

    if (result === false) {
      return errors.push({ keyword, message: 'invalid input data' })
    }

    if (result instanceof Array) {
      return errors.push({ keyword, errors: result })
    }

    errors.push(Object.assign({ keyword }, result))
  }

  Object.keys(this.schema)
    .filter(filterSchemaKeywords)
    .map((keyword) => ({
      keyword: keyword,
      value: this.schema[keyword],
      validate: this._keywords[keyword] }))
    .forEach(validateKeyword)

  return errors
}

const asyncValidate = function (data) {
  data = { value: data }

  const result = this._validate(data)

  if (result === false) {
    return new Promise((resolve, reject) => {
      const message = 'Invalid type input'
      const report = { keyword: 'type' }

      reject(new ValidationError(message, report))
    })
  }

  const next = (resolve, reject) => {
    const errors = validateKeywords.apply(this, [ data ])

    if (errors.length === 0) {
      if (typeof resolve === 'function') {
        return resolve(true)
      }

      return true
    }

    return reject(errors)
  }

  if (result instanceof Promise) {
    return result.then(next)
  } else if (result !== true) {
    return new Promise((resolve, reject) => {
      reject(new ValidationError('Invalid type input', result))
    })
  }

  return new Promise(next)
}

const validate = function (data) {
  data = { value: data }

  if (this.schema.hasOwnProperty('default')) {
    if (this._keywords.hasOwnProperty('default')) {
      this._keywords.default.apply(this, [this.schema.default, data])
    }
  }

  const result = this._validate(data)

  if (result === false) {
    return [{
      keyword: 'type',
      message: 'invalid type input'
    }]
  }

  if (result !== true) {
    if (!Array.isArray(result)) {
      return [ result ]
    }

    return result
  }

  const errors = validateKeywords.apply(this, [ data ])

  if (errors.length === 0) {
    return true
  }

  return errors
}

module.exports = class Base {
  constructor (schema, options) {
    const compileSteps = options.compileSteps[schema.type] || []

    Object.defineProperty(this, '_schema', { value: schema })
    Object.defineProperty(this, '_options', { value: options || {} })
    Object.defineProperty(this, '_keywords', { value: {} })
    Object.defineProperty(this, '_validate', { value: this.validate })
    Object.defineProperty(this, '_compileSteps', { value: compileSteps })

    this.keywords = globalKeywords

    if (options.keywords.hasOwnProperty(schema.type)) {
      this.keywords = options.keywords[schema.type]
    }

    this.validate = this._options.async ? asyncValidate : validate
  }

  validateDefaultValue () {
    if (this.schema.hasOwnProperty('default')) {
      const result = this.validate(this.schema.default)

      if (this._options.async) {
        return result
      }

      if (result !== true) {
        const value = JSON.stringify(this.schema.default)
        const message = `Invalid default value ${value}`

        throw new ValidationError(message, result)
      }

      return result
    }

    return false
  }

  compile () {
    const result = this.validateDefaultValue()

    if (result) {
      return result
    }

    this._compileSteps.forEach((fn) => fn.apply(this))

    if (this._options.async) {
      return new Promise((resolve) => resolve(this))
    }
  }

  get options () {
    return this._options
  }

  get compileSteps () {
    return this._compileSteps
  }

  get generic () {
    return this._options.generic
  }

  get schema () {
    return this._schema
  }

  get keywords () {
    return this._keywords
  }

  set keywords (values) {
    for (let name in values) {
      this._keywords[name] = values[name]
    }
  }
}