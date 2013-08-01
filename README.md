# validator.js

Powerful objects and strings validation in javascript for Node and the browser

## Version

0.3.2

## Status

[![Build Status](https://travis-ci.org/guillaumepotier/validator.js.png?branch=master)](https://travis-ci.org/guillaumepotier/validator.js)

## Licence

MIT - See LICENCE.md


## Run Tests

- On node:
  - `npm install mocha`
  - `npm install expect.js`
  - `mocha tests/server.js`

- On browser:
  - open tests/browser.html in your browser

# Summary

  - [General usage](#general-usage)
  - [Validate string](#validate-a-string)
  - [Validate object](#validate-an-object)
  - [Validation groups](#validation-groups)
  - [Bind constraint to an object](#bind-a-constraint-to-an-object)
  - [Assert definition](#assert-definition)
  - [Constraint definition](#constraint-definition)
  - [Available asserts](#available-asserts)
  - [Collection Assert](#collection-assert)
  - [Callback Assert](#callback-assert)

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

## Validate a string

```js
var Assert = Validator.Assert;

Validator.Validator().validate( 'foo', new Assert().Length( { min: 4 } ) );
Validator.Validator().validate( 'foo', [ new Assert().Length( { min: 4 } ), new Assert().Email() ] );

```
will return `[]` if validation passes, a `Violation` array otherwise.


## Validate an object

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


## Validation groups

With same objects than above, just by adding validation groups:

```js
  constraint = {
    name:      [ new Assert().NotBlank(), new Assert( 'edit' ).Length( { min: 4, max: 25 } ) ],
    email:     new Assert().Email(),
    firstname: new Assert( [ 'edit', 'register'] ).NotBlank(),
    phone:     new Assert( 'edit' ).NotBlank()
  };

Validator.validate( object, constraint, 'edit' );
```
will return `{}` in this case `{ firstname: [ Violation ], phone: [ Violation ] }`.


## Bind a constraint to an object

```js
Validator.bind( object, constraint );
Validator.validate( object, groups );
```

# Documentation

## Assert definition

An assert implements Assert Interface, and is an assertion that your string or object
property must pass during validation process. There are several Asserts built in
Validator.js (see below), but you can implement yours for your needs using the
`Callback()` assert (see below).

```js
var length = new Validator.Assert().Length( { min: 10 } );
try {
  length.check( 'foo' );
} catch ( violation ) {}
```

## Constraint definition

A Constraint is a set of asserts nodes that would be used to validate an object.

```js
var length = new Validator.Assert().Length( { min: 10 } );
var notBlank = new Validator.Assert().NotBlank();
var constraint = new Constraint( { foo: length, bar: notBlank } );

constraint.check( { foo: 'foo', bar: 'bar' } );
```

## Available asserts

```js
new Assert().Blank();
new Assert().Callback( fn ( value ) {} );
new Assert().Choice( [] );
new Assert().Choice( fn () {} );
new Assert().Collection ( Constraint );
new Assert().Count( value );
new Assert().Count( fn ( [] ) {} );
new Assert().Email();
new Assert().Eql( object );
new Assert().Eql( fn ( value ) {} );
new Assert().EqualTo( value );
new Assert().EqualTo( fn ( value ) {} );
new Assert().GreaterThan( threshold );
new Assert().GreaterThanOrEqual( threshold );
new Assert().InstanceOf
new Assert().IPv4();
new Assert().Length( { min: value, max: value } );
new Assert().LessThan( threshold );
new Assert().LessThanOrEqual( threshold );
new Assert().EqualTo( value );
new Assert().EqualTo( fn ( value ) {} );
new Assert().Mac();
new Assert().NotBlank();
new Assert().NotNull();
new Assert().Null();
new Assert().Range( min, max );
new Assert().Regexp( value );
new Assert().Required();
new Assert().Unique();
new Assert().Unique( { key: value } );
```

### Collection Assert

Collection Assert is quite special yet powerful. It allows you to validate
an object's array by checking each one of them against a constraint.

Here is an example of test suite test showing how this assert works:

```js
it( 'Collection', function () {
  var itemConstraint = new Constraint( { foobar: new Assert().NotNull(), foobaz: new Assert().NotNull() } ),
    object = {
      foo: null,
      items: [
        { foobar: null, foobaz: 'foo', fooqux: null },
        { foobar: 'bar', foobaz: 'baz' },
        { foobar: null, foobaz: null }
      ]
    },
    constraint = {
      foo: new Assert().NotNull(),
      items: [ new Assert().Collection( itemConstraint ), new Assert().Count( 2 ) ]
    };

  var result = validator.validate( object, constraint );
  expect( result ).to.have.key( 'foo' );
  expect( result ).to.have.key( 'items' );
  expect( result.items[ 0 ] ).to.have.key( '0' );
  expect( result.items[ 0 ] ).to.have.key( '2' );
  expect( result.items[ 0 ][ 0 ] ).to.have.key( 'foobar' );
  expect( result.items[ 0 ][ 0 ] ).not.to.have.key( 'foobaz' );
  expect( result.items[ 0 ][ 2 ] ).to.have.key( 'foobar' );
  expect( result.items[ 0 ][ 2 ] ).to.have.key( 'foobaz' );
  expect( result.items[ 1 ] ).to.be.a( Violation );
  expect( result.items[ 1 ].assert ).to.be( 'Count' );
} )
```

### Callback Assert

This assert allows you to all the custom rules / assert you want. Just give a
callback function that will be called with the value to be tested against.
Return true for validation success, everything else if there is an error.

Here is an example of test suite test showing how this assert works:

```js
it( 'Callback', function () {
  assert = new Assert().Callback( function ( value ) {
    var calc = ( 42 / value ) % 2;

    return calc ? true : calc;
  } );

  expect( validate( 3, assert ) ).not.to.be( true );
  expect( validate( 3, assert ).show() ).to.eql( { assert: 'Callback', value: 3, violation: { result: 0 } } );
  expect( validate( 42, assert ) ).to.be( true );
} )
```