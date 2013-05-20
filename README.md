# validator.js

Powerful object and string validation in Javascript.


## Licence

MIT - See LICENCE.md


## Run Tests

  - `npm install mocha`
  - `npm install expect.js`
  - `mocha tests/server.js`

# Documentation


## General use

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


## Validate Strings

```js
var Assert      = Validator.Assert,
    Constraint  = new Validator.Constraint( new Assert().Lenght( 4 ) );

Validator.Validator().validate( 'foo', Constraint );
```
will return `[]` if validation passes, `[ Violation ]` in this case.


## Validate Objects

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
  Collection = new Validator.Collection({
    name:      [ new Assert().NotBlank(), new Assert().Length( 4, 25 ) ],
    email:     new Assert().Email(),
    firstname: new Assert().NotBlank(),
    phone:     new Assert().NotBlank()
  });

Validator.validate( object, Collection );
```
will return `{}` if validation passes,
`{ email: [ Violation ], firstname: [ Violation ] }` in this case.


## Validation Groups

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
  Collection = new Validator.Collection({
    name:      [ new Assert().NotBlank(), new Assert().Length( 4, 25 ) ],
    email:     new Assert().Email(),
    firstname: new Assert().NotBlank().addGroup( 'edit' ),
    phone:     new Assert().NotBlank().addGroup( 'edit' )
  });

Validator.validate( object, Collection, 'edit' );
```
will return `{}` in this case `{ firstname: [ Violation ], phone: [ Violation ] }`.