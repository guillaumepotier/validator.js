var expect = require( 'expect.js' ),
    Validator = require( '../validator.js' );

describe( 'Validator', function () {
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
        expect( violation ).to.be.a( Validator.Violation );
      }
    } )

    it( 'should register a group through assertion construct ', function () {
      var Length = new Validator.Assert().Length( 10, 15, 'foo' );
      expect( Length.hasGroups() ).to.be( true );
      expect( Length.hasGroup( 'foo' ) ).to.be( true );
    } )

    it( 'should register mulitple groups through assertion construct', function () {
      var Length = new Validator.Assert().Length( 10, 15, [ 'foo', 'bar'] );
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
      expect( myConstraint.asserts.length ).to.be( 0 );
    } )

    it( 'should be instanciated with an assertion', function () {
      var myConstraint = new Validator.Constraint( new Validator.Assert().Length( 10 ) );
      expect( myConstraint.asserts.length ).to.be( 1 );
    } )

    it( 'should add an assertion', function () {
      var myConstraint = new Validator.Constraint();
      myConstraint.add( new Validator.Assert().Length( 10 ) );
      expect( myConstraint.asserts.length ).to.be( 1 );
    } )

    it( 'should throw Error if not assertion given in add method', function () {
      try {
        new Validator.Constraint().add( 'foo' );
        expect().fail();
      } catch ( err ) {
        expect( err.message ).to.be( 'Should give an Assert object' );
      }
    } )

    it( 'should return true with has assertion, not deep', function () {
      var myConstraint = new Validator.Constraint();
      myConstraint.add( new Validator.Assert().Length( 10 ) );
      expect( myConstraint.has( new Validator.Assert().Length( 15 ) ) ).to.be( true );
    } )

    it( 'should return true with has assertion, with deep', function () {
      var myConstraint = new Validator.Constraint();
      myConstraint.add( new Validator.Assert().Length( 10 ) );
      expect( myConstraint.has( new Validator.Assert().Length( 10 ), true ) ).to.be( true );
    } )

    it( 'should return false with has assertion, with deep', function () {
      var myConstraint = new Validator.Constraint();
      myConstraint.add( new Validator.Assert().Length( 10 ) );
      expect( myConstraint.has( new Validator.Assert().Length( 15 ), true ) ).to.be( false );
    } )

    it( 'should remove an assertion, not deep', function () {
      var myConstraint = new Validator.Constraint();
      myConstraint.add( new Validator.Assert().NotBlank() ).add( new Validator.Assert().Length( 10 ) );
      expect( myConstraint.asserts.length ).to.be( 2 );
      myConstraint.remove( new Validator.Assert().Length( 15 ) );
      expect( myConstraint.has( new Validator.Assert().NotBlank() ) ).to.be( true );
      expect( myConstraint.asserts.length ).to.be( 1 );
    } )

    it( 'should remove an assertion, with deep', function () {
      var myConstraint = new Validator.Constraint();
      myConstraint.add( new Validator.Assert().NotBlank() ).add( new Validator.Assert().Length( 10 ) );
      expect( myConstraint.asserts.length ).to.be( 2 );
      myConstraint.remove( new Validator.Assert().Length( 15 ), true );
      expect( myConstraint.asserts.length ).to.be( 2 );
      myConstraint.remove( new Validator.Assert().Length( 10 ), true );
      expect( myConstraint.asserts.length ).to.be( 1 );
    } )
  } )

  describe( 'Collection', function () {
    var collection = new Validator.Collection();

    it( 'should be an object', function () {
      expect( collection ).to.be.an( 'object' );
    } )

    it( 'should have "Collection" __class__', function () {
      expect( collection.__class__ ).to.be( 'Collection' );
    } )

    it( 'should be instanciated without a constraint', function () {
      var myCollection = new Validator.Collection();
      expect( myCollection.constraints.isEqualTo( {} ) ).to.be( true );
    } )

    it( 'should be instanciated with a constraint', function () {
      var myCollection = new Validator.Collection( { foo: new Validator.Constraint() } );
      expect( myCollection.constraints.isEqualTo( { foo: new Validator.Constraint() } ) ).to.be( true );
    } )

    it( 'should fail if not a Constraint in add method', function () {
      expect( new Validator.Collection().add ).to.throwError();
    } )

    it( 'should add a Constraint', function () {
      var myCollection = new Validator.Collection().add( 'foo', new Validator.Constraint() );
      expect( myCollection.has( 'foo' ) ).to.be( true );
    } )

    it( 'should force add a Constraint', function () {
      var myCollection = new Validator.Collection().add( 'foo', new Validator.Constraint( new Validator.Assert().Length( 10 ) ) );
      expect( myCollection.get( 'foo' ).isEqualTo( new Validator.Constraint( new Validator.Assert().Length( 10 ) ) ) ).to.be( true );
      myCollection.add( 'foo', new Validator.Constraint( new Validator.Assert().Length( 15 ) ) );
      expect( myCollection.get( 'foo' ).isEqualTo( new Validator.Constraint( new Validator.Assert().Length( 10 ) ) ) ).to.be( true );
      myCollection.add( 'foo', new Validator.Constraint( new Validator.Assert().Length( 35 ) ), true );
      expect( myCollection.get( 'foo' ).isEqualTo( new Validator.Constraint( new Validator.Assert().Length( 35 ) ) ) ).to.be( true );
    } )

    it( 'should remove a Constraint', function () {
      var myCollection = new Validator.Collection().add( 'foo', new Validator.Constraint() );
      expect( myCollection.has( 'foo' ) ).to.be( true );
      myCollection.remove( 'foo' );
      expect( myCollection.has( 'foo' ) ).to.be( false );
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

  describe( 'Validator', function () {
    var validator = new Validator.Validator(),
      Assert = Validator.Assert,
      Constraint = Validator.Constraint;

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

      it.skip( 'should not validate against a non existent group', function () {
        try {
          validator.validate( 'foo', [ new Assert().Length( 4 ).addGroup( 'bar' ), new Assert().Length( 8 ).addGroup( 'baz' ), new Assert().Length( 2 ) ], 'foo' );
          expect().fail();
        } catch ( err ) {
          expect( err.message ).to.be( 'The "foo" group does not exist in any Assert' );
        }
      } )
    })

    describe( 'Object validation', function () {
      it( 'should validate an object', function () {
        var collection = new Validator.Collection()
            .add( 'name', new Validator.Constraint( new Validator.Assert().Length( 5, 15 ) ) )
            .add( 'email', new Validator.Constraint( new Validator.Assert().NotBlank() ) );

        var result = validator.validate( { name: 'foo', email: '' }, collection );
        expect( result ).not.to.be.empty();
        expect( result ).to.have.key( 'name' );
        expect( result ).to.have.key( 'email' );

        expect( result.name[ 0 ].assert ).to.be( 'Length' );
        expect( result.email[ 0 ].assert ).to.be( 'NotBlank' );

        result = validator.validate( { name: 'foo bar', email: '' }, collection );
        expect( result ).not.to.be.empty();
        expect( result ).not.to.have.key( 'name' );
        expect( result ).to.have.key( 'email' );

        result = validator.validate( { name: 'foo bar', email: 'foo@bar.baz' }, collection );
        expect( result ).to.be.empty();
      } )

      it( 'should validate README example', function () {
        var object = {
            name: 'john doe',
            email: 'wrong@email',
            firstname: null,
            phone: null
          },
          Collection = new Validator.Collection({
            name:      [ new Assert().NotBlank(), new Assert().Length( 4, 25 ) ],
            email:     new Assert().Email(),
            firstname: new Assert().NotBlank().addGroup( ['foo', 'register'] ),
            phone:     new Assert().NotBlank().addGroup( 'edit' )
          });

        var result = validator.validate( object, Collection );
        expect( result.isEqualTo( {} ) ).to.be( false );
        expect( result ).to.have.key( 'email' );
        expect( result ).not.to.have.key( 'firstname' );
        expect( result ).not.to.have.key( 'name' );
        expect( result ).not.to.have.key( 'phone' );

        var result = validator.validate( object, Collection, 'edit' );
        expect( result.isEqualTo( {} ) ).to.be( false );
        expect( result ).not.to.have.key( 'email' );
        expect( result ).not.to.have.key( 'firstname' );
        expect( result ).not.to.have.key( 'name' );
        expect( result ).to.have.key( 'phone' );

        var result = validator.validate( object, Collection, [ 'edit', 'foo' ] );
        expect( result.isEqualTo( {} ) ).to.be( false );
        expect( result ).not.to.have.key( 'email' );
        expect( result ).to.have.key( 'firstname' );
        expect( result ).not.to.have.key( 'name' );
        expect( result ).to.have.key( 'phone' );
      } )

      describe( 'Validation groups', function () {
        var object, Collection;

        before( function () {
          object = { foo: null, bar: null, baz: null, qux: null };
          Collection = new Validator.Collection({
            foo: [ new Assert().NotNull( [ 'foo', 'bar' ] ), new Assert().NotBlank() ],
            bar: new Assert().NotNull( [ 'baz' ] ),
            baz: new Assert().NotNull(),
            qux: new Assert().NotNull( [ 'foo', 'qux' ] )
          });
        })

        it( 'should validate asserts without validation groups', function () {
          var result = validator.validate( object, Collection );
          expect( result ).to.have.key( 'foo' );
          expect( result ).not.to.have.key( 'bar' );
          expect( result ).to.have.key( 'baz' );
          expect( result ).not.to.have.key( 'qux' );
        } )

        it( 'should be the same with "Default" group', function () {
          var result = validator.validate( object, Collection, 'Default' );
          expect( result ).to.have.key( 'foo' );
          expect( result ).not.to.have.key( 'bar' );
          expect( result ).to.have.key( 'baz' );
          expect( result ).not.to.have.key( 'qux' );
        } )

        it( 'should validate only a specific validation group', function () {
          var result = validator.validate( object, Collection, 'foo' );
          expect( result ).to.have.key( 'foo' );
          expect( result ).not.to.have.key( 'bar' );
          expect( result ).not.to.have.key( 'baz' );
          expect( result ).to.have.key( 'qux' );
        } )

        it( 'should validate only two specific validation groups', function () {
          var result = validator.validate( object, Collection, [ 'foo', 'baz' ] );
          expect( result ).to.have.key( 'foo' );
          expect( result ).to.have.key( 'bar' );
          expect( result ).not.to.have.key( 'baz' );
          expect( result ).to.have.key( 'qux' );
        } )

        it( 'should validate more validation groups', function () {
          var result = validator.validate( object, Collection, [ 'foo', 'qux', 'bar' ] );
          expect( result ).to.have.key( 'foo' );
          expect( result ).not.to.have.key( 'bar' );
          expect( result ).not.to.have.key( 'baz' );
          expect( result ).to.have.key( 'qux' );
        } )

        it( 'should validate groups with "Default"', function () {
          var result = validator.validate( object, Collection, [ 'foo', 'Default' ] );
          expect( result ).to.have.key( 'foo' );
          expect( result ).not.to.have.key( 'bar' );
          expect( result ).to.have.key( 'baz' );
          expect( result ).to.have.key( 'qux' );
        } )

      } )
    } )
  } )
} )