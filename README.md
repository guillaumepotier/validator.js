# validator.js

Powerful object and string validation in Javascript.

## Version

0.2.1

## Status

[![Build Status](https://travis-ci.org/guillaumepotier/validator.js.png?branch=master)](https://travis-ci.org/guillaumepotier/validator.js)

## Licence

MIT - See LICENCE.md


## Run Tests

  - `npm install mocha`
  - `npm install expect.js`
  - `mocha tests/server.js`

# Documentation


## General usage

- On node:

```
$ npm install -g validator.js
```

Then

```js
Validator = require( 'validator.js' );
```

- On browser:

```js
<script src="../validator.js"></script>
<script>
    console.log(Validator);
</script>
```


# Validate Strings

```js
var Assert = Validator.Assert;

Validator.Validator().validate( 'foo', new Assert().Length( { min: 4 } ) );
Validator.Validator().validate( 'foo', [ new Assert().Length( { min: 4 } ), new Assert().Email() ] );

```
will return `[]` if validation passes, a `Violation` array otherwise.


# Validate Objects

```js
var Validator = Validator.Validator,
    Assert = Validator.Assert,
    Constraint = Validator.Constraint;

var object = {
    name: 'john doe',
    email: 'wrong@email',
    firstname: null,
    phone: null
  },
  constraint = {
    name:      [ new Assert().NotBlank(), new Assert().Length( { min: 4, max: 25 } ) ],
    email:     new Assert().Email(),
    firstname: new Assert().NotBlank(),
    phone:     new Assert().NotBlank()
  };

Validator.validate( object, constraint );
```
will return `{}` if validation passes,
`{ email: [ Violation ], firstname: [ Violation ] }` in this case.


# Validation Groups

With same objects than above, just by adding validation groups:

```js
  collection = {
    name:      [ new Assert().NotBlank(), new Assert().Length( { min: 4, max: 25 } ) ],
    email:     new Assert().Email(),
    firstname: new Assert().NotBlank().addGroups( [ 'edit', 'register'] ),
    phone:     new Assert().NotBlank().addGroup( 'edit' )
  };

Validator.validate( object, collection, 'edit' );
```
will return `{}` in this case `{ firstname: [ Violation ], phone: [ Violation ] }`.


# Documentation

# Assert

An assert implements Assert Interface, and is an assertion that your string or object
property must pass during validation process. There are several Asserts built in
Validator.js (see below), but you can implement yourself for your needs as well.

```js
var length = new Validator.Assert().Length( { min: 10 } );
try {
  length.check( 'foo' );
} catch ( violation ) {}
```

# Constraint

A Constraint is a set of asserts nodes that would be used to validate an object.

```js
var length = new Validator.Assert().Length( { min: 10 } );
var notBlank = new Validator.Assert().NotBlank();
var constraint = new Constraint( { foo: length, bar: notBlank } );

constraint.check( { foo: 'foo', bar: 'bar' } );
```