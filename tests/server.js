var expect = require( 'expect.js' ),
    jsValidator = require( '../jsValidator' );

describe( 'jsValidator', function () {
  describe( 'Assert', function () {
    var assert = new jsValidator.Assert();

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
      var Length = new jsValidator.Assert().Length( 10 );
      expect( Length ).to.be.an( 'object' );
      expect( Length.__class__ ).to.be( 'Length' );
      expect( assert.__parentClass__ ).to.be( 'Assert' );
    } )

    it( 'should return true if validate success', function () {
      var Length = new jsValidator.Assert().Length( 10 );
      expect( Length.validate( 'foo bar baz' ) ).to.be( true );
    } )

    it( 'should throw a Violation exception if fails', function () {
      var Length = new jsValidator.Assert().Length( 10 );
      try {
        Length.validate( 'foo' );
        expect().fails();
      } catch ( violation ) {
        expect( violation ).to.be.a( jsValidator.Violation );
      }
    } )

    it( 'should register a group through assertion construct ', function () {
      var Length = new jsValidator.Assert().Length( 10, 15, 'foo' );
      expect( Length.hasGroups() ).to.be( true );
      expect( Length.hasGroup( 'foo' ) ).to.be( true );
    } )

    it( 'should register a group through addGroup ', function () {
      var Length = new jsValidator.Assert().Length( 10 ).addGroup( 'foo' );
      expect( Length.hasGroups() ).to.be( true );
      expect( Length.hasGroup( 'foo' ) ).to.be( true );
    } )

    it( 'should register mulitple groups through assertion construct', function () {
      var Length = new jsValidator.Assert().Length( 10, 15, [ 'foo', 'bar'] );
      expect( Length.hasGroups() ).to.be( true );
      expect( Length.hasGroup( 'foo' ) ).to.be( true );
      expect( Length.hasGroup( 'bar' ) ).to.be( true );
    } )

    it( 'should register mulitple groups through addGroups', function () {
      var Length = new jsValidator.Assert().Length( 10 ).addGroups( [ 'foo', 'bar'] );
      expect( Length.hasGroups() ).to.be( true );
      expect( Length.hasGroup( 'foo' ) ).to.be( true );
      expect( Length.hasGroup( 'bar' ) ).to.be( true );
    } )

    it( 'should register mulitple groups through chained addGroup', function () {
      var Length = new jsValidator.Assert().Length( 10 ).addGroup( 'foo' ).addGroup( 'bar' );
      expect( Length.hasGroups() ).to.be( true );
      expect( Length.hasGroup( 'foo' ) ).to.be( true );
      expect( Length.hasGroup( 'bar' ) ).to.be( true );
    } )

    it( 'should remove group', function () {
      var Length = new jsValidator.Assert().Length( 10 ).addGroup( 'foo' ).addGroup( 'bar' ).removeGroup( 'bar' );
      expect( Length.hasGroups() ).to.be( true );
      expect( Length.hasGroup( 'foo' ) ).to.be( true );
      expect( Length.hasGroup( 'bar' ) ).to.be( false );
    } )
  } )

  describe( 'Constraint', function () {
    var constraint = new jsValidator.Constraint();

    it( 'should be an object', function () {
      expect( constraint ).to.be.an( 'object' );
    } )

    it( 'should have "Constraint" __class__', function () {
      expect( constraint.__class__ ).to.be( 'Constraint' );
    } )

    it( 'should be instanciated without an assertion', function () {
      var myConstraint = new jsValidator.Constraint();
      expect( myConstraint.asserts.length ).to.be( 0 );
    } )

    it( 'should be instanciated with an assertion', function () {
      var myConstraint = new jsValidator.Constraint( new jsValidator.Assert().Length( 10 ) );
      expect( myConstraint.asserts.length ).to.be( 1 );
    } )

    it( 'should add an assertion', function () {
      var myConstraint = new jsValidator.Constraint();
      myConstraint.add( new jsValidator.Assert().Length( 10 ) );
      expect( myConstraint.asserts.length ).to.be( 1 );
    } )

    it( 'should throw Error if not assertion given in add method', function () {
      try {
        new jsValidator.Constraint().add( 'foo' );
        expect().fail();
      } catch ( err ) {
        expect( err.message ).to.be( 'Should give an Assert object' );
      }
    } )

    it( 'should return true with has assertion, not deep', function () {
      var myConstraint = new jsValidator.Constraint();
      myConstraint.add( new jsValidator.Assert().Length( 10 ) );
      expect( myConstraint.has( new jsValidator.Assert().Length( 15 ) ) ).to.be( true );
    } )

    it( 'should return true with has assertion, with deep', function () {
      var myConstraint = new jsValidator.Constraint();
      myConstraint.add( new jsValidator.Assert().Length( 10 ) );
      expect( myConstraint.has( new jsValidator.Assert().Length( 10 ), true ) ).to.be( true );
    } )

    it( 'should return false with has assertion, with deep', function () {
      var myConstraint = new jsValidator.Constraint();
      myConstraint.add( new jsValidator.Assert().Length( 10 ) );
      expect( myConstraint.has( new jsValidator.Assert().Length( 15 ), true ) ).to.be( false );
    } )

    it( 'should remove an assertion, not deep', function () {
      var myConstraint = new jsValidator.Constraint();
      myConstraint.add( new jsValidator.Assert().NotBlank() ).add( new jsValidator.Assert().Length( 10 ) );
      expect( myConstraint.asserts.length ).to.be( 2 );
      myConstraint.remove( new jsValidator.Assert().Length( 15 ) );
      expect( myConstraint.has( new jsValidator.Assert().NotBlank() ) ).to.be( true );
      expect( myConstraint.asserts.length ).to.be( 1 );
    } )

    it( 'should remove an assertion, with deep', function () {
      var myConstraint = new jsValidator.Constraint();
      myConstraint.add( new jsValidator.Assert().NotBlank() ).add( new jsValidator.Assert().Length( 10 ) );
      expect( myConstraint.asserts.length ).to.be( 2 );
      myConstraint.remove( new jsValidator.Assert().Length( 15 ), true );
      expect( myConstraint.asserts.length ).to.be( 2 );
      myConstraint.remove( new jsValidator.Assert().Length( 10 ), true );
      expect( myConstraint.asserts.length ).to.be( 1 );
    } )
  } )

  describe( 'Collection', function () {
    var collection = new jsValidator.Collection();

    it( 'should be an object', function () {
      expect( collection ).to.be.an( 'object' );
    } )

    it( 'should have "Collection" __class__', function () {
      expect( collection.__class__ ).to.be( 'Collection' );
    } )

    it( 'should be instanciated without a constraint', function () {
      var myCollection = new jsValidator.Collection();
      expect( myCollection.constraints.isEqualTo( {} ) ).to.be( true );
    } )

    it( 'should be instanciated with a constraint', function () {
      var myCollection = new jsValidator.Collection( { foo: new jsValidator.Constraint() } );
      expect( myCollection.constraints.isEqualTo( { foo: new jsValidator.Constraint() } ) ).to.be( true );
    } )

    it( 'should fail if not a Constraint in add method', function () {
      expect( new jsValidator.Collection().add ).to.throwError();
    } )

    it( 'should add a Constraint', function () {
      var myCollection = new jsValidator.Collection().add( 'foo', new jsValidator.Constraint() );
      expect( myCollection.has( 'foo' ) ).to.be( true );
    } )

    it( 'should force add a Constraint', function () {
      var myCollection = new jsValidator.Collection().add( 'foo', new jsValidator.Constraint( new jsValidator.Assert().Length( 10 ) ) );
      expect( myCollection.get( 'foo' ).isEqualTo( new jsValidator.Constraint( new jsValidator.Assert().Length( 10 ) ) ) ).to.be( true );
      myCollection.add( 'foo', new jsValidator.Constraint( new jsValidator.Assert().Length( 15 ) ) );
      expect( myCollection.get( 'foo' ).isEqualTo( new jsValidator.Constraint( new jsValidator.Assert().Length( 10 ) ) ) ).to.be( true );
      myCollection.add( 'foo', new jsValidator.Constraint( new jsValidator.Assert().Length( 35 ) ), true );
      expect( myCollection.get( 'foo' ).isEqualTo( new jsValidator.Constraint( new jsValidator.Assert().Length( 35 ) ) ) ).to.be( true );
    } )

    it( 'should remove a Constraint', function () {
      var myCollection = new jsValidator.Collection().add( 'foo', new jsValidator.Constraint() );
      expect( myCollection.has( 'foo' ) ).to.be( true );
      myCollection.remove( 'foo' );
      expect( myCollection.has( 'foo' ) ).to.be( false );
    } )

  } )

  describe( 'Violation', function () {
    var violation = new jsValidator.Violation( new jsValidator.Assert().NotBlank(), '' );

    it( 'should be an object', function () {
      expect( violation ).to.be.an( 'object' );
    } )

    it( 'should have "Violation" __class__', function () {
      expect( violation.__class__ ).to.be( 'Violation' );
    } )

    it( 'should fail if not instanciated with an Assert object having __class__', function () {
      try {
        var violation = new jsValidator.Violation( 'foo' );
        expect().fail();
      } catch ( err ) {
        expect( err.message ).to.be( 'Should give an assertion implementing the Assert interface' );
      }
    } )

  } )

  describe( 'Validator', function () {
    var validator = new jsValidator.Validator();

    it( 'should be an object', function () {
      expect( validator ).to.be.an( 'object' );
    } )

    it( 'should have "Validator" __class__', function () {
      expect( validator.__class__ ).to.be( 'Validator' );
    } )

    it( 'sould throw Error if Collection or Constraint not given to validate method', function () {
      try {
        validator.validate( 'foo', 'bar', 'baz' );
        expect().fail();
      } catch ( err ) {
        expect( err.message ).to.be( 'You must give a Constraint or a constraints Collection' );
      }

      try {
        validator.validate( 'foo', { __class__: 'foo' }, 'baz' );
        expect().fail();
      } catch ( err ) {
        expect( err.message ).to.be( 'You must give a Constraint or a constraints Collection' );
      }
    } )

    describe( 'String validation', function () {
      it( 'should validate a string', function () {
        var constraint = new jsValidator.Constraint( [ new jsValidator.Assert().Length( 5, 10 ), new jsValidator.Assert().NotBlank() ] );
        expect( validator.validate( 'foo', constraint ) ).not.to.be.empty();
        expect( validator.validate( 'foobar', constraint ) ).to.be.empty();
      } )

      it( 'should return violations for a string', function () {
        var constraint = new jsValidator.Constraint( [ new jsValidator.Assert().Length( 5, 10 ), new jsValidator.Assert().NotBlank() ] );
        var violations = validator.validate( '', constraint );
        expect( violations ).to.have.length( 2 );
        expect( violations[ 0 ] ).to.be.a( jsValidator.Violation );
        expect( violations[ 0 ].assert ).to.be( 'Length' );
        expect( violations[ 1 ].assert ).to.be( 'NotBlank' );
        violations = validator.validate( 'foo', constraint );
        expect( violations ).to.have.length( 1 );
        expect( violations[ 0 ].assert ).to.be( 'Length' );
      } )

      it( 'should use groups for validation', function() {
        var constraint = new jsValidator.Constraint( [ new jsValidator.Assert().Length( 4 ).addGroup( 'bar' ), new jsValidator.Assert().Length( 8 ).addGroup( 'baz' ), new jsValidator.Assert().Length( 2 ) ] );
        expect( validator.validate( 'foo', constraint ) ).to.be.empty();
        expect( validator.validate( 'foo', constraint, 'bar' ) ).not.to.be.empty();
        expect( validator.validate( 'foofoo', constraint, 'bar' ) ).to.be.empty();
        expect( validator.validate( 'foofoo', constraint, 'baz' ) ).not.to.be.empty();
        expect( validator.validate( 'foofoofoo', constraint, 'baz' ) ).to.be.empty();
      } )

      it( 'should not validate against a non existent group', function () {
        var constraint = new jsValidator.Constraint( [ new jsValidator.Assert().Length( 4 ).addGroup( 'bar' ), new jsValidator.Assert().Length( 8 ).addGroup( 'baz' ), new jsValidator.Assert().Length( 2 ) ] );
        try {
          validator.validate( 'foo', constraint, 'foo' );
          expect().fail();
        } catch ( err ) {
          expect( err.message ).to.be( 'The "foo" group does not exist in any Assert' );
        }
      } )
    })

    describe( 'Object validation', function () {
      it( 'should validate an object', function () {
        var collection = new jsValidator.Collection()
            .add( 'name', new jsValidator.Constraint( new jsValidator.Assert().Length( 5, 15 ) ) )
            .add( 'email', new jsValidator.Constraint( new jsValidator.Assert().NotBlank() ) );

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
    } )
  } )
} )