( function ( exports ) {

var Suite = function ( Validator, expect ) {
  describe( 'Validator', function () {
    var validator = new Validator.Validator(),
      Violation = Validator.Violation,
      Assert = Validator.Assert,
      Constraint = Validator.Constraint;

    describe( 'Assert', function () {
      var assert = new Assert();

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
        var Length = new Assert().Length( { min: 10 } );
        expect( Length ).to.be.an( 'object' );
        expect( Length.__class__ ).to.be( 'Length' );
        expect( assert.__parentClass__ ).to.be( 'Assert' );
      } )

      it( 'should return true if validate success', function () {
        var Length = new Assert().Length( { min: 10 } );
        expect( Length.validate( 'foo bar baz' ) ).to.be( true );
      } )

      it( 'should throw a Violation exception if fails', function () {
        var Length = new Assert().Length( { min: 10 } );
        try {
          Length.validate( 'foo' );
          expect().fails();
        } catch ( violation ) {
          expect( violation ).to.be.a( Violation );
        }
      } )

      it( 'should register a group through assertion construct ', function () {
        var Length = new Assert( 'foo' ).Length( { min: 10, min: 15 } );
        expect( Length.hasGroups() ).to.be( true );
        expect( Length.hasGroup( 'foo' ) ).to.be( true );
      } )

      it( 'should register mulitple groups through assertion construct', function () {
        var Length = new Assert( [ 'foo', 'bar'] ).Length( { min: 10, min: 15 } );
        expect( Length.hasGroups() ).to.be( true );
        expect( Length.hasGroup( 'foo' ) ).to.be( true );
        expect( Length.hasGroup( 'bar' ) ).to.be( true );
      } )

      it( 'should register a group through addGroup ', function () {
        var Length = new Assert().Length( { min: 10 } ).addGroup( 'foo' );
        expect( Length.hasGroups() ).to.be( true );
        expect( Length.hasGroup( 'foo' ) ).to.be( true );
      } )

      it( 'should register multiple groups through addGroup', function () {
        var Length = new Assert().Length( { min: 10 } ).addGroup( [ 'foo', 'bar' ] );
        expect( Length.hasGroups() ).to.be( true );
        expect( Length.hasGroup( 'foo' ) ).to.be( true );
        expect( Length.hasGroup( 'bar' ) ).to.be( true );
      } )

      it( 'should register mulitple groups through addGroups', function () {
        var Length = new Assert().Length( { min: 10 } ).addGroups( [ 'foo', 'bar'] );
        expect( Length.hasGroups() ).to.be( true );
        expect( Length.hasGroup( 'foo' ) ).to.be( true );
        expect( Length.hasGroup( 'bar' ) ).to.be( true );
      } )

      it( 'should register mulitple groups through chained addGroup', function () {
        var Length = new Assert().Length( { min: 10 } ).addGroup( 'foo' ).addGroup( 'bar' );
        expect( Length.hasGroups() ).to.be( true );
        expect( Length.hasGroup( 'foo' ) ).to.be( true );
        expect( Length.hasGroup( 'bar' ) ).to.be( true );
      } )

      it( 'should remove group', function () {
        var Length = new Assert().Length( { min: 10 } ).addGroup( 'foo' ).addGroup( 'bar' ).removeGroup( 'bar' );
        expect( Length.hasGroups() ).to.be( true );
        expect( Length.hasGroup( 'foo' ) ).to.be( true );
        expect( Length.hasGroup( 'bar' ) ).to.be( false );
      } )

      it( 'should test hasOneOf for groups', function () {
        var Length = new Assert().Length( { min: 10 } ).addGroup( [ 'foo', 'bar' ] );
        expect( Length.hasOneOf( [ 'foo', 'baz' ] ) ).to.be( true );
        expect( Length.hasOneOf( [ 'bar', 'baz' ] ) ).to.be( true );
        expect( Length.hasOneOf( [ 'foobar', 'baz', 'foobaz' ] ) ).to.be( false );
      } )
    } )

    describe( 'Violation', function () {
      var violation = new Validator.Violation( new Assert().NotBlank(), '' );

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

    describe( 'Asserts', function () {
      var assert, validate;

      before( function () {
        validate = function ( value, assert ) {
          try {
            assert.validate( value );
          } catch ( violation ) {
            return violation;
          }

          return true;
        };
      } )

      it( 'NotNull', function () {
        assert = new Assert().NotNull();

        expect( validate( null, assert ) ).not.to.be( true );
        expect( validate( '', assert ) ).to.be( true );
        expect( validate( false, assert ) ).to.be( true );
        expect( validate( 'foo', assert ) ).to.be( true );
      } )

      it( 'Null', function () {
        assert = new Assert().Null();

        expect( validate( null, assert ) ).to.be( true );
        expect( validate( '', assert ) ).not.to.be( true );
        expect( validate( false, assert ) ).not.to.be( true );
        expect( validate( 'foo', assert ) ).not.to.be( true );
      } )

      it( 'NotBlank', function () {
        assert = new Assert().NotBlank();

        expect( validate( null, assert ) ).not.to.be( true );
        expect( validate( '', assert ) ).not.to.be( true );
        expect( validate( false, assert ) ).not.to.be( true );
        expect( validate( 'foo', assert ) ).to.be( true );
      } )

      it( 'Blank', function () {
        assert = new Assert().Blank();

        expect( validate( null, assert ) ).not.to.be( true );
        expect( validate( '', assert ) ).to.be( true );
        expect( validate( false, assert ) ).not.to.be( true );
        expect( validate( 'foo', assert ) ).not.to.be( true );
      } )

      it( 'Length', function () {
        assert = new Assert().Length( { min: 3 } );

        expect( validate( null, assert ) ).not.to.be( true );
        expect( validate( '', assert ) ).not.to.be( true );
        expect( validate( false, assert ) ).not.to.be( true );
        expect( validate( false, assert ).show() ).to.eql( { assert: 'Length', value: false, violation: { value: 'must_be_a_string' } } );
        expect( validate( 'foo', assert ) ).to.be( true );
        expect( validate( 'f', assert ).show() ).to.eql( { assert: 'Length', value: 'f', violation: { min: 3 } } );
        expect( validate( 'f', assert ) ).not.to.be( true );

        assert = new Assert().Length( { max: 10 } );
        expect( validate( 'foo bar baz', assert ) ).not.to.be( true );
        expect( validate( 'foo bar baz', assert ).show() ).to.eql( { assert: 'Length', value: 'foo bar baz', violation: { max: 10 } } );
      } )

      it( 'Email', function () {
        assert = new Assert().Email();

        expect( validate( 'foo', assert ) ).not.to.be( true );
        expect( validate( 'foo@bar', assert ) ).not.to.be( true );
        expect( validate( 'foo@bar', assert ).show() ).to.eql( { assert: 'Email', value: 'foo@bar' } );

        expect( validate( 'foo@bar.baz', assert ) ).to.be( true );
      } )

      it( 'InstanceOf', function () {
        assert = new Assert().InstanceOf( Date );

        expect( validate( 'foo', assert ) ).not.to.be( true );
        expect( validate( 'foo', assert ).show() ).to.eql( { assert: 'InstanceOf', value: 'foo', violation: { classRef: Date } } );
        expect( validate( 4, assert ) ).not.to.be( true );
        expect( validate( new Date(), assert ) ).to.be( true );
      } )

      it( 'IPv4', function () {
        assert = new Assert().IPv4();

        expect( validate( 'foo.bar', assert ) ).not.to.be( true );
        expect( validate( '192.168.1', assert ) ).not.to.be( true );
        expect( validate( '292.168.1.201', assert ).show() ).to.eql( { assert: 'IPv4', value: '292.168.1.201' } );

        expect( validate( '192.168.1.201', assert ) ).to.be( true );
      } )

      it( 'Mac', function () {
        assert = new Assert().Mac();

        expect( validate( '0G:42:AT:F5:OP:Z2', assert ) ).not.to.be( true );
        expect( validate( 'AD:32:11:F7:3B', assert ) ).not.to.be( true );
        expect( validate( 'AD:32:11:F7:3B:ZX', assert ).show() ).to.eql( { assert: 'Mac', value: 'AD:32:11:F7:3B:ZX' } );

        expect( validate( 'AD:32:11:F7:3B:C9', assert ) ).to.be( true );
      } )

      it( 'EqualTo', function () {
        assert = new Assert().EqualTo( 42 );

        expect( validate( 'foo', assert ) ).not.to.be( true );
        expect( validate( 'foo', assert ).show() ).to.eql( { assert: 'EqualTo', value: 'foo', violation: { value: 42 } } );
        expect( validate( 4, assert ) ).not.to.be( true );
        expect( validate( 42, assert ) ).to.be( true );
      } )

      it( 'EqualTo w/ function', function () {
        assert = new Assert().EqualTo( function ( value ) {
          return 42;
        } );

        expect( validate( 'foo', assert ) ).not.to.be( true );
        expect( validate( 'foo', assert ).show() ).to.eql( { assert: 'EqualTo', value: 'foo', violation: { value: 42 } } );
        expect( validate( 4, assert ) ).not.to.be( true );
        expect( validate( 42, assert ) ).to.be( true );
      } )

      it( 'Callback', function () {
        assert = new Assert().Callback( function ( value ) {
          var calc = ( 42 / value ) % 2;

          return calc ? true : calc;
        } );

        expect( validate( 3, assert ) ).not.to.be( true );
        expect( validate( 3, assert ).show() ).to.eql( { assert: 'Callback', value: 3, violation: { result: 0 } } );
        expect( validate( 42, assert ) ).to.be( true );
      } )

      it ( 'Choice', function () {
        assert = new Assert().Choice( [ 'foo', 'bar', 'baz' ] );

        expect( validate( 'qux', assert ) ).not.to.be( true );
        expect( validate( 'qux', assert ).show() ).to.eql( { assert: 'Choice', value: 'qux', violation: { choices: [ 'foo', 'bar', 'baz' ] } } );
        expect( validate( 'foo', assert ) ).to.be( true );
      } )

      it( 'Choice w/ function', function () {
        var val1 = 'foo', val2 = 'bar', val3 = 'baz', fn = function () {
          return [ val1, val2, val3 ];
        };

        assert = new Assert().Choice( fn );
        expect( validate( 'qux', assert ) ).not.to.be( true );
        expect( validate( 'qux', assert ).show() ).to.eql( { assert: 'Choice', value: 'qux', violation: { choices: [ 'foo', 'bar', 'baz' ] } } );
        expect( validate( 'foo', assert ) ).to.be( true );
      } )

      it( 'Count', function () {
        assert = new Assert().Count( 3 );

        expect( validate( 'foo', assert ) ).not.to.be( true );
        expect( validate( 'foo', assert ).show() ).to.eql( { assert: 'Count', value: 'foo', violation: { value: 'must_be_an_array' } } );
        expect( validate( [ 1, 2 ], assert ) ).not.to.be( true );
        expect( validate( [ 1, 2 ], assert ).show() ).to.eql( { assert: 'Count', value: [ 1, 2 ], violation: { count: 3 } } );
        expect( validate( [ 1, 2, 3 ], assert ) ).to.be( true );
      } )

      it( 'Count w/ function', function () {
        assert = new Assert().Count( function () { return 3; } );

        expect( validate( 'foo', assert ) ).not.to.be( true );
        expect( validate( 'foo', assert ).show() ).to.eql( { assert: 'Count', value: 'foo', violation: { value: 'must_be_an_array' } } );
        expect( validate( [ 1, 2 ], assert ) ).not.to.be( true );
        expect( validate( [ 1, 2 ], assert ).show() ).to.eql( { assert: 'Count', value: [ 1, 2 ], violation: { count: 3 } } );
        expect( validate( [ 1, 2, 3 ], assert ) ).to.be( true );
      } )

      it( 'Required', function () {
        assert = new Assert().Required();

        expect( validate( '', assert ) ).not.to.be( true );
        expect( validate( { foo: 'bar' }, assert ) ).to.be( true );
      } )

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

      it( 'Collection with binded objects', function () {
        var itemConstraint = { foobar: new Assert().NotNull(), foobaz: new Assert().NotNull() },
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
            items: [ new Assert().Collection(), new Assert().Count( 2 ) ]
          };

          for ( var i = 0; i < object.items.length; i++ )
            validator.bind( object.items[ i ], itemConstraint );

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

      it( 'Unique', function () {
        assert = new Assert().Unique();

        expect( validate( [ 'foo', 'bar', 'baz', 'foo' ], assert ) ).not.to.be( true );
        expect( validate( [ 'foo', 'bar', 'baz', 'foo' ], assert ).show() ).to.eql( { assert: 'Unique', value: [ 'foo', 'bar', 'baz', 'foo' ], violation: { value: 'foo' } } );
        expect( validate( [ 'foo', 'bar', 'baz' ], assert ) ).to.be( true );
      } )

      it( 'Unique with objects', function () {
        assert = new Assert().Unique( { key: 'foo' } );
        var array = [ { foo: 'bar' }, { foo: 'baz' }, { foo: 'bar' } ];

        expect( validate( array, assert ) ).not.to.be( true );
        expect( validate( array, assert ).show() ).to.eql( { assert: 'Unique', value: array, violation: { value: 'bar' } } );
        expect( validate( [ { foo: 'bar' }, { foo: 'baz' } ], assert ) ).to.be( true );

        expect( validate( [ { bar: 'bar' }, { baz: 'baz' } ], assert ) ).to.be( true );
      } )

      it( 'Eql', function () {
        assert = new Assert().Eql( { foo: 'foo', bar: 'bar' } );

        expect( validate( 'foo', assert) ).not.to.be( true );
        expect( validate( 'foo', assert ).show() ).to.eql( { assert: 'Eql', value: 'foo', violation: { eql: { foo: 'foo', bar: 'bar' } } } );
        expect( validate( { foo: 'foo' }, assert ) ).not.to.be( true );
        expect( validate( { foo: null, bar: null }, assert ) ).not.to.be( true );
        expect( validate( { foo: 'foo', bar: 'bar' }, assert ) ).to.be( true );
      } )

      it( 'Eql w/ function', function () {
        assert = new Assert().Eql( function ( value ) { return { foo: 'foo', bar: 'bar' } } );

        expect( validate( { foo: null, bar: null }, assert ) ).not.to.be( true );
        expect( validate( { foo: 'foo', bar: 'bar' }, assert ) ).to.be( true );
      } )

      it( 'Regexp', function () {
        assert = new Assert().Regexp( '^[A-Z]' );

        expect( validate( 'foo', assert ) ).not.to.be( true );
        expect( validate( 'foo', assert ).show() ).to.eql( { assert: 'Regexp', value: 'foo', violation: { regexp: '^[A-Z]', flag: '' } } );
        expect( validate( 'FOO', assert ) ).to.be( true );
      } )

      it( 'Range', function () {
        assert = new Assert().Range( 5, 10 );
        expect( validate( 'foo', assert ) ).not.to.be( true );
        expect( validate( 'foo', assert ).show() ).to.eql( { assert: 'Range', value: 'foo', violation: { min: 5 } } );
        expect( validate( 'foo bar', assert ) ).to.be( true );
        expect( validate( 'foo bar baz', assert ) ).not.to.be( true );
        expect( validate( 'foo bar baz', assert ).show() ).to.eql( { assert: 'Range', value: 'foo bar baz', violation: { max: 10 } } );
      } )

      it( 'GreaterThan', function () {
        assert = new Assert().GreaterThan( 5 );
        expect( validate( 3, assert ) ).not.to.be( true );
        expect( validate( 5, assert ).show() ).to.eql( { assert: 'GreaterThan', value: 5, violation: { threshold: 5 } } );
        expect( validate( 7, assert ) ).to.be( true );
      } )

      it( 'GreaterThanOrEqual', function () {
        assert = new Assert().GreaterThanOrEqual( 5 );
        expect( validate( 3, assert ) ).not.to.be( true );
        expect( validate( 3, assert ).show() ).to.eql( { assert: 'GreaterThanOrEqual', value: 3, violation: { threshold: 5 } } );
        expect( validate( 5, assert ) ).to.be( true );
        expect( validate( 7, assert ) ).to.be( true );
      } )

      it( 'LessThan', function () {
        assert = new Assert().LessThan( 5 );
        expect( validate( 3, assert ) ).to.be( true );
        expect( validate( 5, assert ).show() ).to.eql( { assert: 'LessThan', value: 5, violation: { threshold: 5 } } );
        expect( validate( 7, assert ) ).not.to.be( true );
      } )

      it( 'LessThanOrEqual', function () {
        assert = new Assert().LessThanOrEqual( 5 );
        expect( validate( 3, assert ) ).to.be( true );
        expect( validate( 5, assert ) ).to.be( true );
        expect( validate( 7, assert ) ).not.to.be( true );
        expect( validate( 7, assert ).show() ).to.eql( { assert: 'LessThanOrEqual', value: 7, violation: { threshold: 5 } } );
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
          new Constraint( new Assert().Length( { min: 10 } ) );
          expect().fails();
        } catch ( err ) {
          expect( err.message ).to.be( 'Should give a valid mapping object to Constraint' );
        }
      } )

      it( 'should be instanciated with a simple object', function () {
        var myConstraint = new Constraint( { foo: new Assert().Length( { min: 10 } ) } );
        expect( myConstraint.has( 'foo' ) ).to.be( true );
      } )

      it( 'should add a node: Assert', function () {
        var myConstraint = new Constraint();
        myConstraint.add( 'foo', new Assert().Length( { min: 10 } ) );
        expect( myConstraint.has( 'foo' ) ).to.be( true );
      } )

      it( 'should add a node: Constraint', function () {
        var myConstraint = new Constraint();
        myConstraint.add( 'foo', new Constraint( { bar: new Assert().Length( { min: 10 } ) } ) );
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

      it( 'should be instanciated with a constraint', function () {
        var constraint = new Constraint( { foo: new Assert().NotNull(), bar: [ new Assert().NotNull(), new Assert().NotBlank() ] } );

        constraint = new Constraint( constraint );
        expect( constraint ).to.be.a( Constraint );
        expect( constraint.has( 'foo' ) ).to.be( true );
        expect( constraint.has( 'bar' ) ).to.be( true );
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
          expect( validator.validate( 'foo', [ new Assert().Length( { min: 5, max: 10 } ), new Assert().NotBlank() ] ) ).not.to.be.empty();
          expect( validator.validate( 'foobar', [ new Assert().Length( { min: 5, max: 10 } ), new Assert().NotBlank() ] ) ).to.be.empty();
        } )

        it( 'should return violations for a string', function () {
          var asserts = [ new Assert().Length( { min: 5, max: 10 } ), new Assert().NotBlank() ];
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
          var asserts = [ new Assert().Length( { min: 4 } ).addGroup( 'bar' ), new Assert().Length( { min: 8 } ).addGroup( 'baz' ), new Assert().Length( { min: 2 } ) ];
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
              .add( 'name', new Assert().Length( { min: 5, max: 15 } ) )
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
            name: new Assert().Length( { min: 5 } ),
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
              name:      [ new Assert().NotBlank(), new Assert().Length( { min: 4, max: 25 } ) ],
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
      } )

      describe( 'Binded object validation', function () {
        it( 'should bind a Constraint to an object', function () {
          var object = { foo: 'foo', bar: 'bar' },
            constraint = new Constraint( { foo: new Assert().NotNull() } );

          validator.bind( object, constraint );
          expect( object ).to.have.key( '_validatorjsConstraint' );
          expect( validator.isBinded( object ) ).to.be( true );
        } )

        it( 'should unbind Constraint from an object', function () {
          var object = { foo: 'foo', bar: 'bar' },
            constraint = new Constraint( { foo: new Assert().NotNull() } );

            validator.bind( object, constraint ).unbind( object );
            expect( object ).not.to.have.key( validator.bindedKey );
            expect( validator.isBinded( object ) ).to.be( false );
        } )

        it( 'should validate object with binded Constraint', function () {
          var object = { foo: null, bar: 'bar' },
            constraint = new Constraint( { foo: new Assert().NotNull() } );

          var result = validator.bind( object, constraint ).validate( object );
          expect( result ).to.have.key( 'foo' );
        } )
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

        it( 'should validate groups with binded object', function () {
          validator.bind( object, constraint );

          var result = validator.validate( object, [ 'foo', 'Default' ] );
          expect( result ).to.have.key( 'foo' );
          expect( result ).not.to.have.key( 'bar' );
          expect( result ).to.have.key( 'baz' );
          expect( result ).to.have.key( 'qux' );
        } )

        it( 'should validate groups in Collection constraint', function () {
          validator.bind( object, constraint );
          var nestedObj = { foo: null, items: [ object, object ] },
            result = validator.validate( nestedObj, { items: new Assert().Collection() }, [ 'foo', 'Default' ] );

          expect( result ).to.have.key( 'items' );
          expect( result.items[ 0 ] ).to.have.key( '0' );
          expect( result.items[ 0 ] ).to.have.key( '1' );
          expect( result.items[ 0 ][ 0 ] ).to.have.key( 'foo' );
          expect( result.items[ 0 ][ 0 ] ).not.to.have.key( 'bar' );
          expect( result.items[ 0 ][ 0 ] ).to.have.key( 'baz' );
          expect( result.items[ 0 ][ 0 ] ).to.have.key( 'qux' );
        } )
      } )
    } )
  } )
}

exports.Suite = Suite;

} )( 'undefined' === typeof exports ? this[ 'Tests' ] = {} : exports );