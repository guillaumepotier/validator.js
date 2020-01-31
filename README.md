# validator.js

Powerful objects and strings validation in javascript for Node and modern browsers (evergreen browsers).

## Version

2.0.4

## Status

[![Build Status](https://travis-ci.org/guillaumepotier/validator.js.png?branch=master)](https://travis-ci.org/guillaumepotier/validator.js)
[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/guillaumepotier/validator.js/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

## License

MIT - See LICENSE.md

## Install

`bower install validator.js`

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
var Validator = require( 'validator.js' );
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
var is = require( 'validator.js' ).Assert;
var validator = require( 'validator.js' ).validator();

validator.validate( 'foo', is.ofLength( { min: 4 } ) );
validator.validate( 'foo', [ is.ofLength( { min: 4 } ), is.email() ] );
```

will return `true` if validation passes, a `Violation`'s array otherwise.

## Validate an object

```js
var is = require( 'validator.js' ).Assert;
var validator = require( 'validator.js' ).validator();

var object = {
    name: 'john doe',
    email: 'wrong@email',
    firstName: null,
    phone: null
  },
  constraint = {
    name: [ is.notBlank(), is.ofLength( { min: 4, max: 25 } ) ],
    email: is.email(),
    firstName: is.notBlank(),
    phone: is.notBlank()
  };

validator.validate( object, constraint );
```

will return `true` if validation passes, `{ email: [ Violation ], firstname: [ Violation ] }` in this case.

## Validation groups

With same objects than above, just by adding validation groups:

```js
  constraint = {
    name:      [ is.notBlank(), is( 'edit' ).ofLength( { min: 4, max: 25 } ) ],
    email:     is.email(),
    firstname: is( [ 'edit', 'register'] ).notBlank(),
    phone:     is( 'edit' ).notBlank()
  };

validator.validate( object, constraint, 'edit' );
```

will return `true` in this case `{ firstname: [ Violation ], phone: [ Violation ] }`.

There are two special groups: "Any" and "Default". Validating against `"Any"` group will validate
against all Asserts, regardless their groups. Validating against `"Default"` group will only
validate against Asserts that do not have a validation group.

## Bind a constraint to an object

```js
validator.bind( object, constraint );
validator.validate( object, groups );
```

Under the hood, by default, a `_validatorjsConstraint` key will be created in object
in order to store here the constraint. You could override this default key name by
passing an option to Validator constructor.

# Documentation

## Assert definition

An assert implements Assert Interface, and is an assertion that your string or object
property must pass during validation process. There are several Asserts built in
Validator.js (see below), but you can implement yours for your needs using the
`Callback()` assert (see below).

```js
var length = is.ofLength( { min: 10 } );
try {
  length.check( 'foo' );
} catch ( violation ) {
}
```

## Constraint definition

A Constraint is a set of asserts nodes that would be used to validate an object.

```js
var length = is.ofLength( { min: 10 } );
var notBlank = is.notBlank();
var constraint = validator.constraint( { foo: length, bar: notBlank } );

constraint.check( { foo: 'foo', bar: 'bar' } );
```

### Strict Constraint validation

By default, Validator.js checks properties that are defined in the Constraint object
and exists on the validated object unless the constraint is `Required`. If you want a
strict validation (ie ensure that **every**) Constraint node is valid, you'll have to pass
an optional parameter to your Constraint:

```js
var object = {
  foo: 'foo',
  bar: 'bar'
};

var constraint = validator.constraint( {
  foo: is.notBlank(),
  bar: is.notBlank(),
  baz: is.notBlank()
}, { strict: true });

constraint.check( object );
```
will return a `HaveProperty` Violation, saying that `baz` property does not exist
in validated object. Without `{ strict: true }` this check would return `true`.

### Deep required validation

By default, a `Required` constraint fails if the parent property exists in the validated
object and the property doesn't. To force Validator.js to take into account all `Required`
constraints, no matter the validated object, you have to enable the `deepRequired` option:

```js
var object = { };

var constraint = validator.constraint({
  foo: {
    bar: is.required()
  }
}, { deepRequired: true });

constraint.check(object);
```

will return a `HaveProperty` Violation, saying that `foo` property does not exist.

This option also works when `Collection` is used, but doesn't enforce a non empty array
on the validated object.

## Available asserts

- Blank() (alias: `blank`)
- Callback( fn ( value ) {} [, arg1 ...] ) (alias: `callback`)
- Choice( [] ) (alias: `choice`)
- Choice( fn () {} ) (alias: `choice`)
- Collection ( Assert ) (alias: `collection`)
- Collection ( Constraint ) (alias: `collection`)
- Count( value ) (alias: `count`)
- Count( fn ( [] ) {} ) (alias: `count`)
- Email() (alias: `email`)
- EqualTo( value ) (alias: `equalTo`)
- EqualTo( fn ( value ) {} ) (alias: `equalTo`)
- GreaterThan( threshold ) (alias: `greaterThan`)
- GreaterThanOrEqual( threshold ) (alias: `greaterThanOrEqual`)
- InstanceOf( classRef ) (alias: `instanceOf`)
- IsString() (alias: `isString`)
- Length( { min: value, max: value } ) (alias: `length`)
- HaveProperty( propertyName ) (alias: `haveProperty`)
- LessThan( threshold ) (alias: `lessThan`)
- LessThanOrEqual( threshold ) (alias: `lessThanOrEqual`)
- EqualTo( value ) (alias: `equalTo`)
- EqualTo( fn ( value ) {} ) (alias: `equalTo`)
- NotBlank() (alias: `notBlank`)
- NotEqualTo( value ) (alias: `notEqualTo`)
- NotNull() (alias: `notNull`)
- Null() (alias: `null`)
- Range( min, max ) (alias: `range`)
- Regexp( value ) (alias: `regexp`)
- Required() (alias: `required`)
- Unique() (alias: `unique`)
- Unique( { key: value } ) (alias: `unique`)
- When( 'field', { is: Assert, then: Assert, otherwise: Assert } );

### Additional asserts via extras.js

- Eql( object ) (alias: `eql`)
- Eql( fn ( value ) {} ) (alias: `eql`)
- IPv4() (alias: `ipv4`)
- Mac() (alias: `mac`)

### Community-driven asserts

You can extend validator.js with more asserts should you need them. There are several extra asserts built by the community that seamlessly integrate with this package.
See the [Extending](#extending) section for more information.

* [validator.js-asserts](https://github.com/seegno/validator.js-asserts): a set of extra asserts for `validator.js`.

### Collection Assert

Collection Assert is quite special yet powerful. It allows you to validate
an object's array by checking each one of them against a constraint.

Here is an example of test suite test showing how this assert works:

```js
it( 'Collection', function () {
  var itemConstraint = validator.constraint( { foobar: is.notNull(), foobaz: is.notNull() } ),
    object = {
      foo: null,
      items: [
        { foobar: null, foobaz: 'foo', fooqux: null },
        { foobar: 'bar', foobaz: 'baz' },
        { foobar: null, foobaz: null }
      ]
    },
    constraint = {
      foo: is.notNull(),
      items: [ is.collection( itemConstraint ), is.count( 2 ) ]
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

This assert allows you to add the custom rules / assert you want. Just give a
callback function that will be called with the value to be tested against.
Return true for validation success, everything else if there is an error.

Here is an example from test suite test showing how this assert works:

```js
it( 'Callback', function () {
  assert = is.callback( function ( value ) {
    var calc = ( 42 / value ) % 2;

    return calc ? true : calc;
  } );

  expect( validate( 3, assert ) ).not.to.be( true );
  expect( validate( 3, assert ).show() ).to.eql( { assert: 'Callback', value: 3, violation: { result: 0 } } );
  expect( validate( 42, assert ) ).to.be( true );

  // improved Callback
  assert = is.callback( function ( value, string1, string2 ) {
    return value + string1 + string2 === 'foobarbaz';
  }, 'bar', 'baz' );
  expect( validate( 'foo', assert ) ).to.be( true );
  expect( validate( 'bar', assert ) ).to.be( false );
} )
```

### When Assert

This assert adds conditional asserts to the schema based on another key.

Here is an example showing how this assert works:

```js
it( 'When', function () {
  // Using `is` and `otherwise`.
  assert = {
    foo: is.when( 'bar', {
      is: is.ofLength( { min: 4 } ) ],
      otherwise: is.Length( { min: 5 } )
    } )
  };

  expect( validator.validate( { foo: 'foo' }, assert ) ).to.be( true );
  expect( validator.validate( { foo: 'foo', bar: 'bar' }, assert ) ).to.not.be( true );
  expect( validator.validate( { foo: 'foobar', bar: 'bar' }, assert ) ).to.be( true );
  expect( validator.validate( { foo: 'foo', bar: 'foobar' }, assert ) ).to.be( true );

  // Using `is` and `then`.
  assert = {
    foo: is.when( 'bar', {
      is: is.ofLength( { min: 4 } ),
      then: is.ofLength( { min: 5 } )
    } )
  };

  expect( validator.validate( { foo: 'foo' }, assert ) ).to.be( true );
  expect( validator.validate( { foo: 'foo', bar: 'bar' }, assert ) ).to.not.be( true );
  expect( validator.validate( { foo: 'foo', bar: 'foobar' }, assert ) ).to.not.be( true );
  expect( validator.validate( { foo: 'foobar', bar: 'foobar' }, assert ) ).to.be( true );

  // Using `is`, `then` and `otherwise`.
  assert = {
    foo: is.when( 'bar', {
      is: is.ofLength( { min: 4 } ),
      then: is.ofLength( { min: 5 } ),
      otherwise: is.ofLength( { min: 4 } )
    } )
  };

  expect( validator.validate( { foo: 'foo' }, assert ) ).to.be( true );
  expect( validator.validate( { foo: 'foo', bar: 'bar' }, assert ) ).to.not.be( true );
  expect( validator.validate( { foo: 'foobar', bar: 'bar' }, assert ) ).to.be( true );
  expect( validator.validate( { foo: 'foo', bar: 'foobar' }, assert ) ).to.not.be( true );
  expect( validator.validate( { foo: 'foobar', bar: 'foobar' }, assert ) ).to.be( true );
} )
```

### A note on type checking
Note that `Length` assertion works for both String and Array type, so if you want to validate only strings, you should write an additional assertion:

```js
validator.validate( 'foo', [
  is.ofLength( { min: 4, max: 100 } ),
  is.string()
] );
```

## Extending

If you want to extend the library with your own asserts, you can use `Assert.extend()` which will return a copy of `validator.Assert` plus your custom asserts. This means that the original `validator.Assert` is always pristine.

Example:

```js
var Assert = Validator.Assert;
var isExtended = Assert.extend({
  integer: Number.isInteger,
  NaN: Number.isNaN
});

expect( validate( 10, isExtended.integer() ).to.be( true );
```

## Browser support

Run on modern browsers (IE10+). Please open an issue or a PR if you find a bug.


## Run Tests

- On node:
  - `mocha tests/server.js`

- On browser:
  - open tests/browser.html in your browser
