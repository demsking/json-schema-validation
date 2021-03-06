# JSON Schema Validator

A basic JSON Schema Validator

[![npm](https://img.shields.io/npm/v/jsonschemav.svg)](https://www.npmjs.com/package/jsonschemav)
[![Build status](https://gitlab.com/demsking/jsonschemav/badges/master/pipeline.svg)](https://gitlab.com/demsking/jsonschemav/pipelines)
[![Test coverage](https://gitlab.com/demsking/jsonschemav/badges/master/coverage.svg)](https://gitlab.com/demsking/jsonschemav/pipelines)

> **DISCLAIMER**: This is a basic JSON Schema validator implementation,
  it dont implement the full JSON Schema spec, so **it's should never used in production**.
  For a faster and powerful JSON Schema validator, please use [AJV](https://www.npmjs.com/package/ajv)

## Install

```sh
npm install --save jsonschemav
```

## Usage

```javascript
const JsonSchemav = require('jsonschemav')
const jsv = new JsonSchemav()

const schema = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 6 },
    date: { type: 'string', format: 'date', default: 'now()' }
  }
}
const data = { title: 'Hello, World!' }
const validator = jsv.compile(schema)

validator
  .then((instance) => instance.validate(datta))
  .then((parsedData) => {
    // use `parsedData` instead `data`
    console.log(parsedData)
    // { title: 'Hello, World!',
    //   date: '2017-06-12T18:49:14.739Z' }
  })

validator
  .then((instance) => instance.validate('Hello'))
  .catch((err) => {
    console.error(err.errors)
    // [ { keyword: 'minLength',
    //    size: 5,
    //    minLength: 6,
    //    message: 'not enough characters. must be greater than, or equal to, 6' } ]
  })

validator
  .then((instance) => instance.validate(true))
  .catch((err) => {
    console.error(err.errors)
    // [ { keyword: 'type', message: 'invalid type input' } ]
  })
```

### Async Validation

```javascript
const axios = require('axios')
const JsonSchemav = require('jsonschemav')

const jsv = new JsonSchemav()
const schema = { type: 'string', isTwitterAccount: true }
const endpoint = 'https://twitter.com/users/username_available'
const validationFn = (value, data) => {
  // value is the keyword value
  // data.value is the user data

  if (value === true) {
    return axios.get(`${endpoint}?username=${data.value}`)
      .then((response) => {
        if (response.data.valid) {
          const message = `The username '${data.value}' does not exists`
          const err = new Error()

          err.props = { message }

          throw err
        }

        return Promise.resolve(data.value)
      })
  }

  return true
}

jsv.addKeyword('string', 'isTwitterAccount', validationFn)

const validator = jsv.compile(schema)

validator
  .then((instance) => instance.validate('nonexistingac'))
  .catch((err) => {
    console.error(err.errors)
    // [ { message: 'The username \'nonexistingac\' does not exists',
    //     keyword: 'isTwitterAccount' } ]

  })

validator
  .then((instance) => instance.validate('demsking'))
  .then((parsedData) => {
    console.log('success')
  })
```

## JSV API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### Table of Contents

- [validateSchema()](#validateschema)
- [compile()](#compile)
- [addCompileStep()](#addcompilestep)
- [addAlias()](#addalias)
- [addType()](#addtype)
- [removeType()](#removetype)
- [addKeyword()](#addkeyword)
- [removeKeyword()](#removekeyword)

### validateSchema()

Validate a schema. Throws an error for invalid schema

#### Parameters

-   `schema` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** Schema to validate

#### Examples

```javascript
const jsv = new JsonSchemav()
const schema = { type: 'string' }

try {
  jsv.validateSchema(schema)
} catch (err) {
  console.error(err)
}
```

### compile()

Compile a schema

#### Parameters

-   `schema` **[object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** Schema to compile

#### Examples

```javascript
const jsv = new JsonSchemav()
const schema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    date: { type: 'string', format: 'date', default: 'now()' }
  }
}
const data = { title: 'Hello, World!' }

jsv.compile(schema)
  .then((instance) => instance.validate(data))
  .then((parsedData) => {
     // use `parsedData` instead `data`
     console.log(parsedData)
     // { title: 'Hello, World!',
     //   date: '2017-06-12T18:49:14.739Z' }
  })
  .catch((err) => {
     console.error(err.errors) // a list of parsing error
  })
```

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)** Returns the validation interface on success and an error otherwise

### addCompileStep()

Add a compile step function to a type

#### Parameters

-   `type` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the type
-   `compileStepFn` **[function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)** A compile function

### addAlias()

Add an alias for a type

#### Parameters

-   `type` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of a defined type
-   `name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The alias name

#### Examples

```javascript
const jsv = new JsonSchemav()
const schema = { type: 'int' }
const data = 123

jsv.addAlias('integer', 'int')
jsv.compile(schema)
  .then((instance) => instance.validate(data))
  .then((parsedData) => {
     // use `parsedData` instead `data`
     console.log(parsedData) // 123
  })
  .catch((err) => {
     // err.errors is a list of parsing error
  })
```

### addType()

Add a new type to the instance

#### Parameters

-   `name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the new type
-   `validateFn` **[function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)?** A validate function for the new type

#### Examples

```javascript
const jsv = new JsonSchemav()
const validateFn = (data) => {
  return Number.isInteger(data.value) && /^[01]+$/.test(data.value.toString())
}

jsv.addType('binary', validateFn)

const schema = { type: 'binary' }
const data = 1111011
const instance = jsv.compile(schema)

jsv.compile(schema)
  .then((instance) => instance.validate(data))
  .then((parsedData) => {
    // use `parsedData` instead `data`
    console.log(parsedData) // 1111011
  })
```

### removeType()

Remove a type from the instance

#### Parameters

-   `name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The nema of the type

#### Examples

```javascript
const schema = { type: 'string' }
const jsv = new JsonSchemav()

jsv.removeType('string')

try {
  jsv.validateSchema(schema)
} catch (err) {
  console.error(err) // Error: Unknown type 'string'
}
```

### addKeyword()

Add a new keyword to a type

#### Parameters

-   `type` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the type
-   `name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the new keyword
-   `validateFn` **[function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)** A validate function for the new keyword

#### Examples

```javascript
const jsv = new JsonSchemav()
const validateFn = function (value, data) {
  // value is the keyword value
  // data.value is the user data
  // the function must returns:
  //   - true: for a success validation
  //   - false: for a faillure validate
  //   - an object { message, errors }
  //   - a Promise for async validation

  return new Promise((resolve, reject) => {
    //...
  })
}

jsv.addKeyword('string', 'provider', validateFn)

// and then
const schema = {
  type: 'object',
  properties: {
    account: { type: 'string', provider: 'twitter' }
  }
}
```

### removeKeyword()

Remove a keyword from a type

#### Parameters

-   `type` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the type
-   `name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the keyword

#### Examples

```javascript
const jsv = new JsonSchemav()

jsv.removeKeyword('string', 'minLength')

const schema = { type: 'string', minLength: 5 }
const instance = jsv.compile(schema)
const data = 'abc'

jsv.compile(schema)
  .then((instance) => instance.validate(data))
  .then((parsedData) => {
     // success
  })
```

## License

Under the MIT license. See [LICENSE](https://gitlab.com/demsking/jsonschemav/blob/master/LICENSE) file for more details.
