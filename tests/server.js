var expect = require( 'expect.js' ),
    Validator = require( '../validator.js' );

describe( 'Validator', function () {
  var validator = new Validator.Validator(),
    Violation = Validator.Violation,
    Assert = Validator.Assert,
    Constraint = Validator.Constraint;

  describe( 'Assert', function () {
    var assert = new Validator.Assert();

    it( 'should be an object', function () {
      expect( assert ).to.be.an( 'object' );
    } )

    it( 'should have "Assert" __class__', function () {
      expect( assert.__class__ ).to.be( 'Assert' );
    } )

    it( 'should have "Assert" __parentClass__', function () {
      expect( assert.__parentClass__ ).to.be( 'Assert' );
    } )

    it( 'should instanciate an assertion', function () {
      var Length = new Validator.Assert().Length( 10 );
      expect( Length ).to.be.an( 'object' );
      expect( Length.__class__ ).to.be( 'Length' );
      expect( assert.__parentClass__ ).to.be( 'Assert' );
    } )

    it( 'should return true if validate success', function () {
      var Length = new Validator.Assert().Length( 10 );
      expect( Length.validate( 'foo bar baz' ) ).to.be( true );
    } )

    it( 'should throw a Violation exception if fails', function () {
      var Length = new Validator.Assert().Length( 10 );
      try {
        Length.validate( 'foo' );
        expect().fails();
      } catch ( violation ) {
        expect( violation ).to.be.a( Violation );
      }
    } )

    it( 'should register a group through assertion construct ', function () {
      var Length = new Validator.Assert( 'foo' ).Length( 10, 15 );
      expect( Length.hasGroups() ).to.be( true );
      expect( Length.hasGroup( 'foo' ) ).to.be( true );
    } )

    it( 'should register mulitple groups through assertion construct', function () {
      var Length = new Validator.Assert( [ 'foo', 'bar'] ).Length( 10, 15 );
      expect( Length.hasGroups() ).to.be( true );
      expect( Length.hasGroup( 'foo' ) ).to.be( true );
      expect( Length.hasGroup( 'bar' ) ).to.be( true );
    } )

    it( 'should register a group through addGroup ', function () {
      var Length = new Validator.Assert().Length( 10 ).addGroup( 'foo' );
      expect( Length.hasGroups() ).to.be( true );
      expect( Length.hasGroup( 'foo' ) ).to.be( true );
    } )

    it( 'should register multiple groups through addGroup', function () {
      var Length = new Validator.Assert().Length( 10 ).addGroup( [ 'foo', 'bar' ] );
      expect( Length.hasGroups() ).to.be( true );
      expect( Length.hasGroup( 'foo' ) ).to.be( true );
      expect( Length.hasGroup( 'bar' ) ).to.be( true );
    } )

    it( 'should register mulitple groups through addGroups', function () {
      var Length = new Validator.Assert().Length( 10 ).addGroups( [ 'foo', 'bar'] );
      expect( Length.hasGroups() ).to.be( true );
      expect( Length.hasGroup( 'foo' ) ).to.be( true );
      expect( Length.hasGroup( 'bar' ) ).to.be( true );
    } )

    it( 'should register mulitple groups through chained addGroup', function () {
      var Length = new Validator.Assert().Length( 10 ).addGroup( 'foo' ).addGroup( 'bar' );
      expect( Length.hasGroups() ).to.be( true );
      expect( Length.hasGroup( 'foo' ) ).to.be( true );
      expect( Length.hasGroup( 'bar' ) ).to.be( true );
    } )

    it( 'should remove group', function () {
      var Length = new Validator.Assert().Length( 10 ).addGroup( 'foo' ).addGroup( 'bar' ).removeGroup( 'bar' );
      expect( Length.hasGroups() ).to.be( true );
      expect( Length.hasGroup( 'foo' ) ).to.be( true );
      expect( Length.hasGroup( 'bar' ) ).to.be( false );
    } )

    it( 'should test hasOneOf for groups', function () {
      var Length = new Validator.Assert().Length( 10 ).addGroup( [ 'foo', 'bar' ] );
      expect( Length.hasOneOf( [ 'foo', 'baz' ] ) ).to.be( true );
      expect( Length.hasOneOf( [ 'bar', 'baz' ] ) ).to.be( true );
      expect( Length.hasOneOf( [ 'foobar', 'baz', 'foobaz' ] ) ).to.be( false );
    } )
  } )

  describe( 'Violation', function () {
    var violation = new Validator.Violation( new Validator.Assert().NotBlank(), '' );

    it( 'should be an object', function () {
      expect( violation ).to.be.an( 'object' );
    } )

    it( 'should have "Violation" __class__', function () {
      expect( violation.__class__ ).to.be( 'Violation' );
    } )

    it( 'should fail if not instanciated with an Assert object having __class__', function () {
      try {
        var violation = new Validator.Violation( 'foo' );
        expect().fail();
      } catch ( err ) {
        expect( err.message ).to.be( 'Should give an assertion implementing the Assert interface' );
      }
    } )

  } )

  describe( 'asserts', function () {
    var assert;

    it( 'NotNull', function () {
      assert = new Assert().NotNull();

      try {
        assert.validate( null );
        expect().fail();
      } catch ( violation ) {
        expect( violation ).to.be.a( Violation );
      }
    } )
  } )

  describe( 'Constraint', function () {
    var constraint = new Validator.Constraint();

    it( 'should be an object', function () {
      expect( constraint ).to.be.an( 'object' );
    } )

    it( 'should have "Constraint" __class__', function () {
      expect( constraint.__class__ ).to.be( 'Constraint' );
    } )

    it( 'should be instanciated without an assertion', function () {
      var myConstraint = new Validator.Constraint();
      expect( myConstraint.nodes ).to.eql( {} );
    } )

    it( 'should throw an error if not instanciated with an object', function () {
      try {
        new Constraint( new Assert().Length( 10 ) );
        expect().fails();
      } catch ( err ) {
        expect( err.message ).to.be( 'Should give a valid mapping object to Constraint' );
      }
    } )

    it( 'should be instanciated with a simple object', function () {
      var myConstraint = new Constraint( { foo: new Assert().Length( 10 ) } );
      expect( myConstraint.has( 'foo' ) ).to.be( true );
    } )

    it( 'should add a node: Assert', function () {
      var myConstraint = new Constraint();
      myConstraint.add( 'foo', new Assert().Length( 10 ) );
      expect( myConstraint.has( 'foo' ) ).to.be( true );
    } )

    it( 'should add a node: Constraint', function () {
      var myConstraint = new Constraint();
      myConstraint.add( 'foo', new Constraint( { bar: new Assert().Length( 10 ) } ) );
      expect( myConstraint.has( 'foo' ) ).to.be( true );
      expect( myConstraint.get( 'foo' ).has( 'bar' ) ).to.be( true );
    } )

    it( 'should be instanciated with a nested object', function () {
      var object = {
          foo: null,
          bar: {
            baz: null,
            qux: {
              bux: null
            }
          }
        },
        constraint = new Constraint({
          foo: [ new Assert().NotNull(), new Assert().NotNull() ],
          bar: {
            baz: new Assert().NotNull(),
            qux: {
              bux: new Assert().NotNull()
            }
          }   
        });

        expect( constraint ).to.be.a( Constraint );
        expect( constraint.get( 'foo' ) ).to.be.an( Array );
        expect( constraint.get( 'foo' )[0] ).to.be.an( Assert );
        expect( constraint.get( 'foo' )[0].__class__ ).to.be( 'NotNull' );
        expect( constraint.get( 'foo' )[1] ).to.be.an( Assert );
        expect( constraint.get( 'foo' )[1].__class__ ).to.be( 'NotNull' );
        expect( constraint.get( 'bar' ) ).to.be.a( Constraint );
        expect( constraint.get( 'bar' ).get( 'baz' ) ).to.be.an( Assert );
        expect( constraint.get( 'bar' ).get( 'baz' ).__class__ ).to.be( 'NotNull' );
        expect( constraint.get( 'bar' ).get( 'qux' ) ).to.be.a( Constraint );
        expect( constraint.get( 'bar' ).get( 'qux' ).get( 'bux' ) ).to.be.an( Assert );
        expect( constraint.get( 'bar' ).get( 'qux' ).get( 'bux' ).__class__ ).to.be( 'NotNull' );
    } )
  } )

  describe( 'Validator', function () {

    it( 'should be an object', function () {
      expect( validator ).to.be.an( 'object' );
    } )

    it( 'should have "Validator" __class__', function () {
      expect( validator.__class__ ).to.be( 'Validator' );
    } )

    describe( 'String validation', function () {
      it( 'sould throw Error if not trying to validate a string against Assert or Asserts array', function () {
        try {
          validator.validate( 'foo', 'bar' );
          expect().fail();
        } catch ( err ) {
          expect( err.message ).to.be( 'You must give an Assert or an Asserts array to validate a string' );
        }
      } )

      it( 'should validate a string', function () {
        expect( validator.validate( 'foo', [ new Assert().Length( 5, 10 ), new Assert().NotBlank() ] ) ).not.to.be.empty();
        expect( validator.validate( 'foobar', [ new Assert().Length( 5, 10 ), new Assert().NotBlank() ] ) ).to.be.empty();
      } )

      it( 'should return violations for a string', function () {
        var asserts = [ new Assert().Length( 5, 10 ), new Assert().NotBlank() ];
        var violations = validator.validate( '', asserts );
        expect( violations ).to.have.length( 2 );
        expect( violations[ 0 ] ).to.be.a( Validator.Violation );
        expect( violations[ 0 ].assert ).to.be( 'Length' );
        expect( violations[ 1 ].assert ).to.be( 'NotBlank' );
        violations = validator.validate( 'foo', asserts );
        expect( violations ).to.have.length( 1 );
        expect( violations[ 0 ].assert ).to.be( 'Length' );
      } )

      it( 'should use groups for validation', function() {
        var asserts = [ new Assert().Length( 4 ).addGroup( 'bar' ), new Assert().Length( 8 ).addGroup( 'baz' ), new Assert().Length( 2 ) ];
        expect( validator.validate( 'foo', asserts ) ).to.be.empty();
        expect( validator.validate( 'foo', asserts, 'bar' ) ).not.to.be.empty();
        expect( validator.validate( 'foofoo', asserts, 'bar' ) ).to.be.empty();
        expect( validator.validate( 'foofoo', asserts, 'baz' ) ).not.to.be.empty();
        expect( validator.validate( 'foofoofoo', asserts, 'baz' ) ).to.be.empty();
      } )
    })

    describe( 'Object validation', function () {
      it( 'should validate an object with a constraint', function () {
        var constraint = new Constraint()
            .add( 'name', new Assert().Length( 5, 15 ) )
            .add( 'email', new Assert().NotBlank() );

        var result = validator.validate( { name: 'foo', email: '' }, constraint );

        expect( result ).not.to.eql( {} );
        expect( result ).to.have.key( 'name' );
        expect( result ).to.have.key( 'email' );

        expect( result.name[ 0 ] ).to.be.a( Violation );
        expect( result.email[ 0 ] ).to.be.a( Violation );
        expect( result.name[ 0 ].assert ).to.be( 'Length' );
        expect( result.email[ 0 ].assert ).to.be( 'NotBlank' );

        result = validator.validate( { name: 'foo bar', email: '' }, constraint );
        expect( result ).not.to.eql( {} );
        expect( result ).not.to.have.key( 'name' );
        expect( result ).to.have.key( 'email' );

        result = validator.validate( { name: 'foo bar', email: 'foo@bar.baz' }, constraint );
        expect( result ).to.eql( {} );
      } )

      it( 'should validate an object against a validation object', function () {
        var result = validator.validate( { name: 'foo', email: '' }, {
          name: new Assert().Length( 5 ),
          email: new Assert().NotBlank()
        } );

        expect( result ).to.have.key( 'name' );
        expect( result ).to.have.key( 'email' );
      } )

      it( 'should validate non nested object', function () {
        var object = {
            name: 'john doe',
            email: 'wrong@email',
            firstname: null,
            phone: null
          },
          constraint = new Constraint({
            name:      [ new Assert().NotBlank(), new Assert().Length( 4, 25 ) ],
            email:     new Assert().Email(),
            firstname: new Assert().NotBlank().addGroup( ['foo', 'register'] ),
            phone:     new Assert().NotBlank().addGroup( 'edit' )
          });

        var result = validator.validate( object, constraint );
        expect( result ).not.to.eql( {} );
        expect( result ).to.have.key( 'email' );
        expect( result ).not.to.have.key( 'firstname' );
        expect( result ).not.to.have.key( 'name' );
        expect( result ).not.to.have.key( 'phone' );

        var result = validator.validate( object, constraint, 'edit' );
        expect( result ).not.to.eql( {} );
        expect( result ).not.to.have.key( 'email' );
        expect( result ).not.to.have.key( 'firstname' );
        expect( result ).not.to.have.key( 'name' );
        expect( result ).to.have.key( 'phone' );

        var result = validator.validate( object, constraint, [ 'edit', 'foo' ] );
        expect( result ).not.to.eql( {} );
        expect( result ).not.to.have.key( 'email' );
        expect( result ).to.have.key( 'firstname' );
        expect( result ).not.to.have.key( 'name' );
        expect( result ).to.have.key( 'phone' );
      } )

      it( 'should validate nested objects', function () {
        var object = {
            foo: null,
            bar: {
              baz: null,
              qux: {
                bux: null
              }
            }
          },
          constraint = new Constraint({
            foo: [ new Assert().NotNull(), new Assert().NotNull() ],
            bar: {
              baz: new Assert().NotNull(),
              qux: {
                bux: new Assert().NotNull()
              }
            }   
          });

          var result = validator.validate( object, constraint );
          expect( result ).to.have.key( 'foo' );
          expect( result.foo ).to.be.an( Array );
          expect( result.foo ).to.have.length( 2 );
          expect( result.foo[ 0 ] ).to.be.a( Violation );
          expect( result.foo[ 0 ].assert ).to.be( 'NotNull' );
          expect( result.bar ).to.have.key( 'baz' );
          expect( result.bar ).to.have.key( 'qux' );
          expect( result.bar.baz ).to.be.an( Array );
          expect( result.bar.baz[ 0 ] ).to.be.a( Violation );
          expect( result.bar.qux.bux[ 0 ] ).to.be.a( Violation );

          object = {
            foo: 'foo',
            bar: {
              baz: 'baz',
              qux: {
                bux: null
              }
            }
          };
          result = validator.validate( object, constraint );
          expect( result ).not.to.have.key( 'foo' );
          expect( result ).to.have.key( 'bar' );
          expect( result.bar ).not.to.have.key( 'baz' );
          expect( result.bar ).to.have.key( 'qux' );
          expect( result.bar.qux ).to.have.key( 'bux' );
      } )

      describe( 'Validation groups', function () {
        var object, constraint;

        before( function () {
          object = { foo: null, bar: null, baz: null, qux: null };
          constraint = new Constraint({
            foo: [ new Assert( [ 'foo', 'bar' ] ).NotNull(), new Assert().NotBlank() ],
            bar: new Assert( 'baz' ).NotNull(),
            baz: new Assert().NotNull(),
            qux: new Assert( [ 'foo', 'qux' ] ).NotNull()
          });
        })

        it( 'should validate asserts without validation groups', function () {
          var result = validator.validate( object, constraint );
          expect( result ).to.have.key( 'foo' );
          expect( result ).not.to.have.key( 'bar' );
          expect( result ).to.have.key( 'baz' );
          expect( result ).not.to.have.key( 'qux' );
        } )

        it( 'should be the same with "Default" group', function () {
          var result = validator.validate( object, constraint, 'Default' );
          expect( result ).to.have.key( 'foo' );
          expect( result ).not.to.have.key( 'bar' );
          expect( result ).to.have.key( 'baz' );
          expect( result ).not.to.have.key( 'qux' );
        } )

        it( 'should validate only a specific validation group', function () {
          var result = validator.validate( object, constraint, 'foo' );
          expect( result ).to.have.key( 'foo' );
          expect( result ).not.to.have.key( 'bar' );
          expect( result ).not.to.have.key( 'baz' );
          expect( result ).to.have.key( 'qux' );
        } )

        it( 'should validate only two specific validation groups', function () {
          var result = validator.validate( object, constraint, [ 'foo', 'baz' ] );
          expect( result ).to.have.key( 'foo' );
          expect( result ).to.have.key( 'bar' );
          expect( result ).not.to.have.key( 'baz' );
          expect( result ).to.have.key( 'qux' );
        } )

        it( 'should validate more validation groups', function () {
          var result = validator.validate( object, constraint, [ 'foo', 'qux', 'bar' ] );
          expect( result ).to.have.key( 'foo' );
          expect( result ).not.to.have.key( 'bar' );
          expect( result ).not.to.have.key( 'baz' );
          expect( result ).to.have.key( 'qux' );
        } )

        it( 'should validate groups with "Default"', function () {
          var result = validator.validate( object, constraint, [ 'foo', 'Default' ] );
          expect( result ).to.have.key( 'foo' );
          expect( result ).not.to.have.key( 'bar' );
          expect( result ).to.have.key( 'baz' );
          expect( result ).to.have.key( 'qux' );
        } )
      } )
    } )
  } )
} )