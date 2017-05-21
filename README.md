# JSON Schema Validation

A simple JSON Schema Validation

[![Build Status](https://travis-ci.org/demsking/jsonschemav.svg?branch=master)](https://travis-ci.org/demsking/jsonschemav) [![bitHound Overall Score](https://www.bithound.io/github/demsking/jsonschemav/badges/score.svg)](https://www.bithound.io/github/demsking/jsonschemav) [![bitHound Dependencies](https://www.bithound.io/github/demsking/jsonschemav/badges/dependencies.svg)](https://www.bithound.io/github/demsking/jsonschemav/master/dependencies/npm) [![Coverage Status](https://coveralls.io/repos/github/demsking/jsonschemav/badge.svg?branch=master)](https://coveralls.io/github/demsking/jsonschemav?branch=master) [![Known Vulnerabilities](https://snyk.io/test/github/demsking/jsonschemav/badge.svg)](https://snyk.io/test/github/demsking/jsonschemav)

## Install

```sh
npm install --save jsonschemav
```

## Usage

```javascript
const jsonschemav = require('jsonschemav')
const instance = jsonschemav.instance()

const schema = { type: 'string', minLength: 6 }
const validator = instance.compile(schema)

console.log(validator.validate('Hello, World!'))
// true

console.log(validator.validate('Hello'))
// [ { keyword: 'minLength',
//    size: 5,
//    minLength: 6,
//    message: 'not enough characters. must be greater than, or equal to, 6' } ]

console.log(validator.validate(true)) 
// [ { keyword: 'type', message: 'invalid type input' } ]

console.log(validator.validate(null))
// true
```

## Instance API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### addAlias

Add an alias for a type

**Parameters**

-   `type` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of a defined type
-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The alias name

### clone

Clone a type

**Parameters**

-   `type` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of a defined type
-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The new type name
-   `prototype` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** The overwrite prototype object

**Examples**

```javascript
// Async validation
const axios = require('axios')
const endpoint = 'https://twitter.com/users/username_available'

instance.clone('string', 'twitter', {
  validateSchema (schema, generic) {
    // schema is the user schema to validate
    // generic is the set of current instance defined types
    // use this function to validate the user schema
    // the method must trown any invalid errors
    // no return is require
  },
  validate (data) {
    // use this function to validate the user data
    // the function must return
    // - a true boolean value on success
    // - a false boolean value on invalid type
    // - a Promise for async validation
    return axios.get(`${endpoint}?username=${data}`)
      .then((response) => {
        if (response.data.valid) {
          return {
            keyword: 'notfound',
            message: 'The username does not exists'
          }
        }
        return true
      })
  }
})

const schema = { type: 'twitter' }
const validator = instance.compile(schema)

validator.validate('demsking').then((result) => {
  console.log(result) // true
})

validator.validate('nonexistingac').then((result) => {
  console.log(result)
  // { keyword: 'notfound',
  //   message: 'The username does not exists' }
})
```

### addType

Add a new type to the instance

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the new type
-   `validator` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)?** A validation function for the new type

### removeType

Remove a type from the instance

**Parameters**

-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The nema of the type

### addKeyword

Add a new keyword to a type

**Parameters**

-   `type` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the type
-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the new keyword
-   `validator` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** A validation function for the new keyword

### removeKeyword

Remove a keyword from a type

**Parameters**

-   `type` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the type
-   `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The name of the keyword

### validateSchema

Validate a schema

**Parameters**

-   `schema` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** Schema to validate

### compile

Compile a schema

**Parameters**

-   `schema` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** Schema to compile

**Examples**

```javascript
const schema = { type: 'string' }
const validator = instance.compile(schema)
const data = 'Hello, World!'
const report = validator.validate(data)

console.log(report) // true
```

Returns **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** Returns an interface with the `validate` member

## License

Under the MIT license. See [LICENSE](https://github.com/demsking/jsonschemav/blob/master/LICENSE) file for more details.
