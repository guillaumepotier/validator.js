( function ( exports ) {

var Suite = function ( validatorjs, expect, AssertExtra ) {
  describe( 'validator.js', function () {
    var Assert = validatorjs.Assert,
      Constraint = validatorjs.Constraint,
      Validator = validatorjs.Validator,
      Violation = validatorjs.Violation;

    var validator = new validatorjs.Validator();

    describe( 'Assert', function () {
      var assert = new Assert();

      describe( 'constructor', function () {
        it( 'should not require the new keyword', function () {
          expect( Assert() ).to.be.an( Assert );
        } )
      } )

      describe('static constructor', function() {
        it( 'should create an instance of `Assert`', function () {
          var assert = validatorjs.assert( 'foobar' );

          expect( assert ).to.be.an( Assert );
          expect( assert.groups ).to.eql( ['foobar'] );
        } )
      } )

      describe( 'static methods', function () {
        it( 'should create an instance of `Assert` ', function () {
          var assert = Assert.Range( 5, 10 );

          expect( assert ).to.be.an( Assert );
          expect( assert.__class__ ).to.be( 'Range' );
          expect( assert.min ).to.be( 5 );
          expect( assert.max ).to.be( 10 );
        } );

        it( 'should have a camel case alias', function () {
          expect( Assert.NotBlank().__class__ ).to.be( Assert.notBlank().__class__ );
        } );

        it( 'should create new instances', function () {
          const assert = Assert.NotBlank();

          expect( assert ).to.not.equal( Assert.notBlank() );
        } );

        it( 'should support `extend`', function () {
          const assert = Assert.extend({
            Foobar: function() {
              this.__class__ = 'Foobar';
              this.validate = function() {
                return false;
              }

              return this;
            }
          } ).Foobar();

          expect( assert ).to.be.an( Assert );
          expect( assert.__class__ ).to.be( 'Foobar' );
        } );

        it( 'should support groups', function () {
          const assert1 = Assert('bizGroup').NotBlank();

          expect( assert1 ).to.be.an( Assert );
          expect( assert1.__class__ ).to.be( 'NotBlank' );
          expect( assert1.groups ).to.eql( ['bizGroup'] );

          const assert2 = Assert('fooGroup').notBlank();

          expect( assert2 ).to.be.an( Assert );
          expect( assert2.__class__ ).to.be( 'NotBlank' );
          expect( assert2.groups ).to.eql( ['fooGroup'] );

          var fn = function() {
            this.__class__ = 'Foobar';
            this.validate = function() {
              return false;
            }

            return this;
          }

          const assert3 = Assert.extend({ Foobar: fn } )('barGroup').Foobar();

          expect( assert3 ).to.be.an( Assert );
          expect( assert3.__class__ ).to.be( 'Foobar' );
          expect( assert3.groups ).to.eql( ['barGroup'] );

          const assert4 = Assert.extend({ Foobar: fn } )('quxGroup').foobar();

          expect( assert4 ).to.be.an( Assert );
          expect( assert4.__class__ ).to.be( 'Foobar' );
          expect( assert4.groups ).to.eql( ['quxGroup'] );
        } );
      });

      describe( 'extend', function() {
        it( 'should throw an error if the extend parameter is missing', function () {
          try {
            Assert.extend();
            expect().fails();
          } catch (err) {
            expect( err.message ).to.be( 'Invalid parameter: `asserts` should be an object' );
          }
        } )

        it( 'should throw an error if the extend parameter is not a object', function () {
          try {
            Assert.extend('foobar');
            expect().fails();
          } catch (err) {
            expect( err.message ).to.be( 'Invalid parameter: `asserts` should be an object' );
          }
        } )

        it( 'should throw an error if the extend parameter is an empty object', function () {
          try {
            Assert.extend({});
            expect().fails();
          } catch (err) {
            expect( err.message ).to.be( 'Invalid parameter: `asserts` should have at least one property' );
          }
        } )

        it( 'should throw an error if the given assert is not a function', function () {
          try {
            Assert.extend({ Foobar: '' });
            expect().fails();
          } catch (err) {
            expect( err.message ).to.be( 'The extension assert must be a function' );
          }
        } )

        it( 'should not require the new keyword', function () {
          var fn = function() {};
          var Extended = Assert.extend({ Foobar: fn });

          expect( Extended() ).to.be.an( Extended );
        } )

        it( 'should call the `Assert` constructor', function () {
          var fn = function() {};
          var Extended = Assert.extend({ Foobar: fn });
          var extended = new Extended('foobar');

          expect( extended.groups ).to.eql( ['foobar' ]);
        } )

        it( 'should inherit the `Assert` prototype', function () {
          var fn = function() {};
          var Extended = Assert.extend({ Foobar: fn });

          for (var assert in Assert.prototype) {
            expect(Extended.prototype[assert]).to.equal(Assert.prototype[assert]);
          }
        } )

        it( 'should inherit `Assert` static methods', function () {
          var fn = function() {};
          var Extended = Assert.extend({ Foobar: fn });

          expect( Extended ).to.have.keys( Object.keys( Assert ) );
        } )

        it( 'should return an Assert extended copy and keep the original `Assert.prototype` unchanged', function () {
          var fn = function() {};
          var Extended = Assert.extend({ Foobar: fn });

          expect(Assert.prototype.Foobar).to.be(undefined);
          expect(Extended.prototype.Foobar).to.eql(fn);
        } )

        it( 'should return an Assert overriding default asserts', function () {
          var fn = function() {
            this.validate = function() { return 'foobar'; };

            return this;
          };
          var Extended = Assert.extend({ Email: fn });

          expect(Extended.prototype.Email).to.eql(fn);
          expect(Extended.prototype.email).to.eql(fn);
          expect(Extended.Email().validate()).to.equal('foobar');
          expect(Extended.email().validate()).to.equal('foobar');
        } )
      } )

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
      var violation = new Violation( new Assert().NotBlank(), '' );

      describe( 'constructor', function () {
        it( 'should not require the new keyword', function () {
          expect( Violation( new Assert().NotBlank(), '' ) ).to.be.an( Violation );
        } )
      } )

      describe('static constructor', function() {
        it( 'should create an instance of `Violation`', function () {
          var notNullViolation = new Violation( new Assert().NotNull() );
          var violation = validatorjs.violation( new Assert().NotBlank(), '', notNullViolation );

          expect( notNullViolation ).to.be.an( Violation );
          expect( violation.violation ).to.equal( notNullViolation );
        } )
      } )

      it( 'should be an object', function () {
        expect( violation ).to.be.an( 'object' );
      } )

      it( 'should have "Violation" __class__', function () {
        expect( violation.__class__ ).to.be( 'Violation' );
      } )

      it( 'should fail if not instanciated with an Assert object having __class__', function () {
        try {
          var violation = new Violation( 'foo' );
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

      it( 'HaveProperty', function () {
        assert = new Assert().HaveProperty( 'foo' );

        expect( validate( null, assert ) ).not.to.be( true );
        expect( validate( { foo: 'bar' }, assert ) ).to.be( true );
        expect( validate( { bar: 'baz' }, assert ) ).not.to.be( true );
      } )

      it( 'HaveProperty alias PropertyDefined', function () {
        expect( new Assert().HaveProperty( 'foo' ).__class__ ).to.eql( new Assert().PropertyDefined( 'foo' ).__class__ );
      } )

      it( 'Length', function () {
        assert = new Assert().Length( { min: 3 } );

        expect( validate( null, assert ) ).not.to.be( true );
        expect( validate( '', assert ) ).not.to.be( true );
        expect( validate( false, assert ) ).not.to.be( true );
        expect( validate( false, assert ).show() ).to.eql( { assert: 'Length', value: false, violation: { value: 'must_be_a_string_or_array' } } );
        expect( validate( false, assert ).__toString() ).to.eql( 'Length assert failed for "false", value expected was must_be_a_string_or_array' );
        expect( validate( 'foo', assert ) ).to.be( true );
        expect( validate( 'f', assert ).show() ).to.eql( { assert: 'Length', value: 'f', violation: { min: 3 } } );
        expect( validate( 'f', assert ).__toString() ).to.eql( 'Length assert failed for "f", min expected was 3' );
        expect( validate( 'f', assert ) ).not.to.be( true );

        assert = new Assert().Length( { max: 10 } );
        expect( validate( 'foo bar baz', assert ) ).not.to.be( true );
        expect( validate( 'foo bar baz', assert ).show() ).to.eql( { assert: 'Length', value: 'foo bar baz', violation: { max: 10 } } );
        expect( validate( 'foo bar baz', assert ).__toString() ).to.eql( 'Length assert failed for "foo bar baz", max expected was 10' );

        /**
         * The following assertion tests a case that occurs upstream in Parsley.js where parameters come in as strings
         * when the HTML5 standard attributes 'minlength' and 'maxlength' are parsed.
         */
        assert = new Assert().Length( { min: '3', max: '3' } );
        expect( validate( 'foo', assert ) ).to.be( true );
      } )

      it( 'Length for arrays', function () {
        assert = new Assert().Length( { min: 3, max: 5 } );
        expect( validator.validate([], assert) ).not.to.be( true );
        expect( validator.validate(['foo'], assert) ).not.to.be( true );
        expect( validator.validate(['foo', 'bar', 'baz'], assert) ).to.be( true );
        expect( validator.validate(['foo', 'bar', 'baz', 'qux', 'bux', 'pux'], assert) ).not.to.be( true );
      } )

      it( 'Length alias OfLength', function () {
        expect( new Assert().Length( { min: 0, max: 1 } ).__class__ ).to.eql( new Assert().OfLength( { min: 0, max: 1 } ).__class__ );
      } )

      it( 'Email', function () {
        assert = new Assert().Email();

        expect( validate( 'foo', assert ) ).not.to.be( true );
        expect( validate( 'foo@bar', assert ) ).not.to.be( true );
        expect( validate( 'foo@bar', assert ).show() ).to.eql( { assert: 'Email', value: 'foo@bar' } );
        expect( validate( 'foo@bar', assert ).__toString() ).to.eql( 'Email assert failed for "foo@bar"' );

        expect( validate( 'foo@bar.baz', assert ) ).to.be( true );
      } )

      it( 'InstanceOf', function () {
        assert = new Assert().InstanceOf( Date );

        expect( validate( 'foo', assert ) ).not.to.be( true );
        expect( validate( 'foo', assert ).show() ).to.eql( { assert: 'InstanceOf', value: 'foo', violation: { classRef: Date } } );
        expect( validate( 'foo', assert ).__toString() ).to.eql( 'InstanceOf assert failed for "foo", classRef expected was function Date() { [native code] }' );
        expect( validate( 4, assert ) ).not.to.be( true );
        expect( validate( new Date(), assert ) ).to.be( true );
      } )

      it( 'IsString', function () {
        assert = new Assert().IsString();

        expect( validate( 'foo', assert ) ).to.be( true );
        expect( validate( new String( 'foo' ), assert ) ).to.be( true );

        expect( validate( 7, assert ) ).not.to.be( true );
        expect( validate( 7, assert ).show() ).to.eql( { assert: 'IsString', value: 7, violation: { value: 'must_be_a_string' } } );
        expect( validate( 7, assert ).__toString() ).to.eql( 'IsString assert failed for "7", value expected was must_be_a_string' );

        var now = new Date();
        expect( validate( now, assert ) ).not.to.be( true );
        expect( validate( now, assert ).show() ).to.eql( { assert: 'IsString', value: now, violation: { value: 'must_be_a_string' } } );
        expect( validate( now, assert ).__toString() ).to.eql( 'IsString assert failed for "'+now+'", value expected was must_be_a_string' );

        expect( validate( [1, 2, 3], assert ) ).not.to.be( true );
        expect( validate( [1, 2, 3], assert ).show() ).to.eql( { assert: 'IsString', value: [1, 2, 3], violation: { value: 'must_be_a_string' } } );
        expect( validate( [1, 2, 3], assert ).__toString() ).to.eql( 'IsString assert failed for "1,2,3", value expected was must_be_a_string' );
      } )

      it( 'IsString alias String', function () {
        expect( new Assert().IsString( 'foo' ).__class__ ).to.eql( new Assert().String( 'foo' ).__class__ );
      } )

      it( 'EqualTo', function () {
        assert = new Assert().EqualTo( 42 );

        expect( validate( 'foo', assert ) ).not.to.be( true );
        expect( validate( 'foo', assert ).show() ).to.eql( { assert: 'EqualTo', value: 'foo', violation: { value: 42 } } );
        expect( validate( 'foo', assert ).__toString() ).to.eql( 'EqualTo assert failed for "foo", value expected was 42' );
        expect( validate( 4, assert ) ).not.to.be( true );
        expect( validate( 42, assert ) ).to.be( true );
      } )

      it( 'EqualTo w/ function', function () {
        assert = new Assert().EqualTo( function ( value ) {
          return 42;
        } );

        expect( validate( 'foo', assert ) ).not.to.be( true );
        expect( validate( 'foo', assert ).show() ).to.eql( { assert: 'EqualTo', value: 'foo', violation: { value: 42 } } );
        expect( validate( 'foo', assert ).__toString() ).to.eql( 'EqualTo assert failed for "foo", value expected was 42' );
        expect( validate( 4, assert ) ).not.to.be( true );
        expect( validate( 42, assert ) ).to.be( true );
      } )

      it( 'NotEqualTo', function () {
        assert = new Assert().NotEqualTo( 42 );

        expect( validate( 'foo', assert ) ).to.be( true );
        expect( validate( 42, assert ).show() ).to.eql( { assert: 'NotEqualTo', value: 42, violation: { value: 42 } } );
        expect( validate( 42, assert ).__toString() ).to.eql( 'NotEqualTo assert failed for "42", value expected was 42' );
        expect( validate( 4, assert ) ).to.be( true );
        expect( validate( 42, assert ) ).not.to.be( true );
      } )

      it( 'NotEqualTo w/ function', function () {
        assert = new Assert().NotEqualTo( function ( value ) {
          return 42;
        } );

        expect( validate( 'foo', assert ) ).to.be( true );
        expect( validate( 42, assert ).show() ).to.eql( { assert: 'NotEqualTo', value: 42, violation: { value: 42 } } );
        expect( validate( 4, assert ) ).to.be( true );
        expect( validate( 42, assert ) ).not.to.be( true );
      } )

      it( 'Callback', function () {
        assert = new Assert().Callback( function ( value ) {
          var calc = ( 42 / value ) % 2;

          return calc ? true : calc;
        } );

        expect( validate( 3, assert ) ).not.to.be( true );
        expect( validate( 3, assert ).show() ).to.eql( { assert: 'Callback', value: 3, violation: { result: 0 } } );
        expect( validate( 42, assert ) ).to.be( true );

        // improved Callback
        assert = new Assert().Callback( function ( value, string1, string2 ) {
          return value + string1 + string2 === 'foobarbaz';
        }, 'bar', 'baz' );
        expect( validate( 'foo', assert ) ).to.be( true );
      } )

      it( 'Callback with error in function', function () {
        assert = new Assert().Callback( function ( value ) {
          this_function_does_not_exist();
        } );

        var r = validate( 3, assert ).show();
        expect(r.violation).not.to.be(undefined);
        expect(r.violation.error).to.be.an(ReferenceError);
        expect('' + r.violation.error).to.be( "ReferenceError: this_function_does_not_exist is not defined" );
        expect(r).to.eql( { assert: 'Callback', value: 3, violation: { error: r.violation.error } } );
      } )

      it( 'Choice', function () {
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

        var result = validate( undefined, assert );
        expect( result ).not.to.be( true );
        expect( result.assert.__class__ ).to.be("Required");

        expect( validate( '', assert ) ).to.be( true );
        expect( validate( [], assert ) ).to.be( true );
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
        expect( result.items[ 1 ].assert.__class__ ).to.be( 'Count' );
      } )

      it( 'Collection with assert', function () {
        var object = {
            foo: null,
            items: [
              'foo',
              'bar@qux.com',
              'baz'
            ],
            strings: [ {} ]
          },
          constraint = {
            foo: new Assert().NotNull(),
            items: [ new Assert().Collection( new Assert().Email() ), new Assert().Count( 2 ) ],
            strings: [ new Assert().Collection( new Assert().IsString() ) ]
          };

        var result = validator.validate( object, constraint );

        expect( result ).to.have.key( 'foo' );
        expect( result ).to.have.key( 'items' );
        expect( result.items[ 0 ] ).to.have.key( '0' );
        expect( result.items[ 0 ] ).not.to.have.key( '1' );
        expect( result.items[ 0 ] ).to.have.key( '2' );
        expect( result.items[ 0 ][ 0 ][ 0 ] ).to.be.a( Violation );
        expect( result.items[ 0 ][ 0 ][ 0 ].assert.__class__ ).to.be( 'Email' );
        expect( result.items[ 0 ][ 2 ][ 0 ] ).to.be.a( Violation );
        expect( result.items[ 0 ][ 2 ][ 0 ].assert.__class__ ).to.be( 'Email' );
        expect( result.items[ 1 ] ).to.be.a( Violation );
        expect( result.items[ 1 ].assert.__class__ ).to.be( 'Count' );
        expect( result.strings[ 0 ] ).to.have.key( '0' );
        expect( result.strings[ 0 ][ 0 ] ).to.be.a( Violation );
        expect( result.strings[ 0 ][ 0 ].assert.__class__ ).to.be( 'IsString' );
      } )

      it( 'Collection with assert array', function () {
        var object = {
            foo: null,
            items: [
              'foo',
              'bar@qux.com',
              'baz'
            ]
          },
          constraint = {
            foo: new Assert().NotNull(),
            items: new Assert().Collection( [ new Assert().NotEqualTo('foo'), new Assert().Email() ] )
          };

        var result = validator.validate( object, constraint );

        expect( result ).to.have.key( 'foo' );
        expect( result ).to.have.key( 'items' );
        expect( result.items[ 0 ] ).to.have.key( '0' );
        expect( result.items[ 0 ] ).not.to.have.key( '1' );
        expect( result.items[ 0 ] ).to.have.key( '2' );
        expect( result.items[ 0 ][ 0 ][ 0 ] ).to.be.a( Violation );
        expect( result.items[ 0 ][ 0 ][ 0 ].assert.__class__ ).to.be( 'NotEqualTo' );
        expect( result.items[ 0 ][ 0 ][ 1 ] ).to.be.a( Violation );
        expect( result.items[ 0 ][ 0 ][ 1 ].assert.__class__ ).to.be( 'Email' );
        expect( result.items[ 0 ][ 2 ][ 0 ] ).to.be.a( Violation );
        expect( result.items[ 0 ][ 2 ][ 0 ].assert.__class__ ).to.be( 'Email' );
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
            expect( result.items[ 1 ].assert.__class__ ).to.be( 'Count' );
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

      it( 'Regexp', function () {
        assert = new Assert().Regexp( '^[A-Z]' );

        expect( validate( 'foo', assert ) ).not.to.be( true );
        expect( validate( 'foo', assert ).show() ).to.eql( { assert: 'Regexp', value: 'foo', violation: { regexp: '^[A-Z]', flag: undefined } } );
        expect( validate( 'FOO', assert ) ).to.be( true );

        assert = new Assert().Regexp( '^[A-Z]', 'i' );

        expect( validate( 'foo', assert ) ).to.be( true );
        expect( validate( 'FOO', assert ) ).to.be( true );

        assert = new Assert().Regexp( /^[A-Z]/i );

        expect( validate( 'foo', assert ) ).to.be( true );
        expect( validate( 'FOO', assert ) ).to.be( true );
      } )

      it( 'Range', function () {
        assert = new Assert().Range( 5, 10 );
        var assertZero = new Assert().Range( 0, 10 );

        // with strings
        expect( validate( 'foo', assert ) ).not.to.be( true );
        expect( validate( 'foo', assert ).show() ).to.eql( { assert: 'Range', value: 'foo', violation: { min: 5 } } );
        expect( validate( 'foo bar', assert ) ).to.be( true );
        expect( validate( 'foo bar baz', assert ) ).not.to.be( true );
        expect( validate( 'foo bar baz', assert ).show() ).to.eql( { assert: 'Range', value: 'foo bar baz', violation: { max: 10 } } );

        // with arrays
        expect( validate( ['foo'], assert ) ).not.to.be( true );
        expect( validate( ['foo', 'bar', 'baz', 'qux', 'bux'], assert ) ).to.be( true );

        // with numbers
        expect( validate( 3, assert ) ).not.to.be( true );
        expect( validate( 7, assert ) ).to.be( true );
        expect( validate( 15, assert ) ).not.to.be( true );

        expect( validate( -1, assertZero ) ).not.to.be( true );
        expect( validate( 3, assertZero ) ).to.be( true );
        expect( validate( 7, assertZero ) ).to.be( true );
        expect( validate( 15, assertZero ) ).not.to.be( true );

        // numbers typed strings are considered as number
        expect( validate( '7', assert ) ).to.be( true );
      } )

      it( 'GreaterThan', function () {
        assert = new Assert().GreaterThan( 5 );
        expect( validate( 'foo', assert) ).not.to.be( true );
        expect( validate( 3, assert ) ).not.to.be( true );
        expect( validate( 5, assert ).show() ).to.eql( { assert: 'GreaterThan', value: 5, violation: { threshold: 5 } } );
        expect( validate( 7, assert ) ).to.be( true );
      } )

      it( 'GreaterThanOrEqual', function () {
        assert = new Assert().GreaterThanOrEqual( 5 );
        expect( validate( 'foo', assert) ).not.to.be( true );
        expect( validate( 3, assert ) ).not.to.be( true );
        expect( validate( 3, assert ).show() ).to.eql( { assert: 'GreaterThanOrEqual', value: 3, violation: { threshold: 5 } } );
        expect( validate( 5, assert ) ).to.be( true );
        expect( validate( 7, assert ) ).to.be( true );
      } )

      it( 'LessThan', function () {
        assert = new Assert().LessThan( 5 );
        expect( validate( 'foo', assert) ).not.to.be( true );
        expect( validate( 3, assert ) ).to.be( true );
        expect( validate( 5, assert ).show() ).to.eql( { assert: 'LessThan', value: 5, violation: { threshold: 5 } } );
        expect( validate( 7, assert ) ).not.to.be( true );
      } )

      it( 'LessThanOrEqual', function () {
        assert = new Assert().LessThanOrEqual( 5 );
        expect( validate( 'foo', assert) ).not.to.be( true );
        expect( validate( 3, assert ) ).to.be( true );
        expect( validate( 5, assert ) ).to.be( true );
        expect( validate( 7, assert ) ).not.to.be( true );
        expect( validate( 7, assert ).show() ).to.eql( { assert: 'LessThanOrEqual', value: 7, violation: { threshold: 5 } } );
      } )

      it( 'When', function () {
        // Using `is` and `otherwise`.
        assert = {
          foo: new Assert().When( 'bar', {
            is: new Assert().Length( { min: 4 } ),
            otherwise: new Assert().Length( { min: 5 } )
          } )
        };

        expect( validator.validate( { foo: 'foo' }, assert ) ).to.be( true );
        expect( validator.validate( { foo: 'foo', bar: 'bar' }, assert ) ).to.not.be( true );
        expect( validator.validate( { foo: 'foobar', bar: 'bar' }, assert ) ).to.be( true );
        expect( validator.validate( { foo: 'foo', bar: 'foobar' }, assert ) ).to.be( true );

        // Using `is` and `then`.
        assert = {
          foo: new Assert().When( 'bar', {
            is: new Assert().Length( { min: 4 } ),
            then: new Assert().Length( { min: 5 } )
          } )
        };

        expect( validator.validate( { foo: 'foo' }, assert ) ).to.be( true );
        expect( validator.validate( { foo: 'foo', bar: 'bar' }, assert ) ).to.not.be( true );
        expect( validator.validate( { foo: 'foo', bar: 'foobar' }, assert ) ).to.not.be( true );
        expect( validator.validate( { foo: 'foobar', bar: 'foobar' }, assert ) ).to.be( true );

        // Using `is`, `then` and `otherwise`.
        assert = {
          foo: new Assert().When( 'bar', {
            is: new Assert().Length( { min: 4 } ),
            otherwise: new Assert().Length( { min: 4 } ),
            then: new Assert().Length( { min: 5 } )
          } )
        };

        expect( validator.validate( { foo: 'foo' }, assert ) ).to.be( true );
        expect( validator.validate( { foo: 'foo', bar: 'bar' }, assert ) ).to.not.be( true );
        expect( validator.validate( { foo: 'foobar', bar: 'bar' }, assert ) ).to.be( true );
        expect( validator.validate( { foo: 'foo', bar: 'foobar' }, assert ) ).to.not.be( true );
        expect( validator.validate( { foo: 'foobar', bar: 'foobar' }, assert ) ).to.be( true );
      } )

      if ( !AssertExtra )
        return;

      describe( 'Extras Asserts', function () {
        it( 'Mac', function () {
          assert = new AssertExtra().Mac();

          expect( validate( '0G:42:AT:F5:OP:Z2', assert ) ).not.to.be( true );
          expect( validate( 'AD:32:11:F7:3B', assert ) ).not.to.be( true );
          expect( validate( 'AD:32:11:F7:3B:ZX', assert ).show() ).to.eql( { assert: 'Mac', value: 'AD:32:11:F7:3B:ZX' } );

          expect( validate( 'AD:32:11:F7:3B:C9', assert ) ).to.be( true );
        } )

        it( 'IPv4', function () {
          assert = new AssertExtra().IPv4();

          expect( validate( 'foo.bar', assert ) ).not.to.be( true );
          expect( validate( '192.168.1', assert ) ).not.to.be( true );
          expect( validate( '292.168.1.201', assert ).show() ).to.eql( { assert: 'IPv4', value: '292.168.1.201' } );

          expect( validate( '192.168.1.201', assert ) ).to.be( true );
        } )

        it( 'Eql', function () {
          assert = new AssertExtra().Eql( { foo: 'foo', bar: 'bar' } );

          expect( validate( 'foo', assert) ).not.to.be( true );
          expect( validate( 'foo', assert ).show() ).to.eql( { assert: 'Eql', value: 'foo', violation: { eql: { foo: 'foo', bar: 'bar' } } } );
          expect( validate( { foo: 'foo' }, assert ) ).not.to.be( true );
          expect( validate( { foo: null, bar: null }, assert ) ).not.to.be( true );
          expect( validate( { foo: 'foo', bar: 'bar' }, assert ) ).to.be( true );
        } )

        it( 'Eql w/ function', function () {
          assert = new AssertExtra().Eql( function ( value ) { return { foo: 'foo', bar: 'bar' } } );

          expect( validate( { foo: null, bar: null }, assert ) ).not.to.be( true );
          expect( validate( { foo: 'foo', bar: 'bar' }, assert ) ).to.be( true );
        } )
      } )
    } )

    describe( 'Constraint', function () {
      var constraint = new Constraint();

      describe( 'constructor', function () {
        it( 'should not require the new keyword', function () {
          expect( Constraint() ).to.be.an( Constraint );
        } )
      } )

      describe('static constructor', function() {
        it( 'should create an instance of `Constraint`', function () {
          var constraint = validatorjs.constraint( { foo: new Assert().NotBlank() }, { bar: 'biz' } );

          expect( constraint ).to.be.an( Constraint );
          expect( constraint.nodes ).to.have.key( 'foo' );
          expect( constraint.options ).to.have.property( 'bar', 'biz' );
        } )
      } )

      it( 'should be an object', function () {
        expect( constraint ).to.be.an( 'object' );
      } )

      it( 'should have "Constraint" __class__', function () {
        expect( constraint.__class__ ).to.be( 'Constraint' );
      } )

      it( 'should be instanciated without an assertion', function () {
        var myConstraint = new Constraint();
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
      describe( 'constructor', function () {
        it( 'should not require the new keyword', function () {
          expect( Validator() ).to.be.an( Validator );
        } )
      } )

      describe('static constructor', function() {
        it( 'should create an instance of `Validator`', function () {
          var validator = validatorjs.validator( { foo: 'bar' } );

          expect( validator ).to.be.an( Validator );
          expect( validator.options ).to.have.property('foo', 'bar');
        } )
      } )

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
          expect( validator.validate( 'foo', [ new Assert().Length( { min: 5, max: 10 } ), new Assert().NotBlank() ] ) ).not.to.be( true );
          expect( validator.validate( 'foobar', [ new Assert().Length( { min: 5, max: 10 } ), new Assert().NotBlank() ] ) ).to.be( true );
        } )

        it( 'should return violations for a string', function () {
          var asserts = [ new Assert().Length( { min: 5, max: 10 } ), new Assert().NotBlank() ];
          var violations = validator.validate( '', asserts );
          expect( violations ).to.have.length( 2 );
          expect( violations[ 0 ] ).to.be.a( validatorjs.Violation );
          expect( violations[ 0 ].assert.__class__ ).to.be( 'Length' );
          expect( violations[ 1 ].assert.__class__ ).to.be( 'NotBlank' );
          violations = validator.validate( 'foo', asserts );
          expect( violations ).to.have.length( 1 );
          expect( violations[ 0 ].assert.__class__).to.be( 'Length' );
        } )

        it( 'should use groups for validation', function() {
          var asserts = [ new Assert().Length( { min: 4 } ).addGroup( 'bar' ), new Assert().Length( { min: 8 } ).addGroup( 'baz' ), new Assert().Length( { min: 2 } ) ];
          expect( validator.validate( 'foo', asserts ) ).to.be( true );
          expect( validator.validate( 'foo', asserts, 'bar' ) ).not.to.be( true );
          expect( validator.validate( 'foofoo', asserts, 'bar' ) ).to.be( true );
          expect( validator.validate( 'foofoo', asserts, 'baz' ) ).not.to.be( true );
          expect( validator.validate( 'foofoofoo', asserts, 'baz' ) ).to.be( true );
        } )

        it( 'should use numbers as groups for validation', function () {
          var asserts = [ new Assert().Length( { min: 4 } ).addGroup( 512 ), new Assert().Length( { min: 8 } ).addGroup( 1024 ), new Assert().Length( { min: 2 } ) ];
          expect( validator.validate( 'foo', asserts ) ).to.be( true );
          expect( validator.validate( 'foo', asserts, 512 ) ).not.to.be( true );
          expect( validator.validate( 'foofoo', asserts, 512 ) ).to.be( true );
          expect( validator.validate( 'foofoo', asserts, 1024 ) ).not.to.be( true );
          expect( validator.validate( 'foofoofoo', asserts, 1024 ) ).to.be( true );
        } )
      })

      describe( 'Array validation', function () {
        it( 'should validate an array of strings', function () {
          var assert = new Assert().Collection( new Assert().Email() );

          expect( validator.validate( ['foo@bar.baz', 'bar@baz.qux'], assert ) ).to.be( true );
          expect( validator.validate( ['foo@bar.baz', 'not an email'], assert ) ).not.to.be( true );
          expect( validator.validate( ['foo@bar.baz', 'not an email'], assert )[ 0 ][ '1' ][ 0 ].__class__ ).to.be( 'Violation' );
        } )


      } )

      describe( 'Object validation', function () {
        it( 'should validate an object with a simple constraint', function () {
          var constraint = {
            foo: new Assert().Required(),
            bar: new Assert().Required(),
            baz: new Assert().Required()
          };

          expect( validator.validate( {
            foo:  42,
            bar:  'bar'
          }, constraint ) ).not.to.be( true );

          expect( validator.validate( {
            foo:  42,
            bar:  'bar',
            baz:  'baz'
          }, constraint ) ).to.be( true );
        } )

        it( 'should validate required properties', function () {
          var constraint = {
            foo: new Assert().Required(),
            bar: [ new Assert().Required(), new Assert().Length( { min: 4 } ) ],
          };

          var result = validator.validate( {
            foo: 'foo',
          }, constraint );

          expect( result ).not.to.be( true );
          expect( result.bar ).to.be.a( Violation );
          expect( result.bar.assert.__class__ ).to.be( 'HaveProperty' );
          expect( result.bar.violation.value ).to.be( 'bar' );

          var result = validator.validate( {
            foo: 'foo',
            bar: '123'
          }, constraint );

          expect( result ).not.to.be( true );
          expect( result.bar[0] ).to.be.a( Violation );
          expect( result.bar[0].assert.__class__ ).to.be( 'Length' );
          expect( result.bar[0].violation ).to.eql( { min: 4 } );

          var result = validator.validate( {
            foo: 'foo',
            bar: '1234'
          }, constraint );

          expect( result ).to.be( true );
        } )

        it( 'should validate required properties in deepRequired mode', function () {
          var constraint = new Constraint({
            foo: {
              bar: new Assert().Required()
            }
          }, { deepRequired: true });

          var result = validator.validate( { }, constraint );

          expect( result ).not.to.be( true );
          expect( result.foo ).to.be.a( Violation );
          expect( result.foo.assert.__class__ ).to.be( 'HaveProperty' );
          expect( result.foo.violation.value ).to.be( 'foo' );
        } )

        it( 'should validate empty array in deepRequired mode', function () {
          var constraint = new Constraint({
            foo: new Assert().Collection({
              bar: new Assert().Required()
            })
          }, { deepRequired: true });

          var result = validator.validate( { foo: [ ] }, constraint );

          expect( result ).to.be( true );
        } )

        it( 'should validate array of strings in deepRequired mode', function () {
          var constraint = new Constraint({
            foo: new Assert().Collection(new Assert().NotBlank())
          }, { deepRequired: true });

          var result = validator.validate( { foo: [ '' ] }, constraint );

          expect( result ).not.to.be( true );
          expect( result.foo ).to.be.an( Array );
          expect( result.foo[0]['0'][0] ).to.be.a( Violation );
          expect( result.foo[0]['0'][0].assert.__class__ ).to.be( 'NotBlank' );
        } )

        it( 'should validate array of objects in deepRequired mode', function () {
          var constraint = new Constraint({
            foo: new Assert().Collection({
              bar: new Assert().Required()
            })
          }, { deepRequired: true });

          var result = validator.validate( { foo: [ { } ] }, constraint );

          expect( result ).not.to.be( true );
          expect( result.foo ).to.be.an( Array );
          expect( result.foo[0]['0'].bar ).to.be.a( Violation );
          expect( result.foo[0]['0'].bar.assert.__class__ ).to.be( 'HaveProperty' );
          expect( result.foo[0]['0'].bar.value ).to.eql( { } );
        } )

        it( 'should validate required properties in strict mode', function () {
          var constraint = new Constraint( {
            foo: new Assert().Required(),
            bar: new Assert().Email()
          }, { strict: true } );

          var result = validator.validate( {
            foo: 'foo',
          }, constraint );

          expect( result ).not.to.be( true );
          expect( result.bar ).to.be.a( Violation );
          expect( result.bar.assert.__class__ ).to.be( 'HaveProperty' );
          expect( result.bar.violation.value ).to.be( 'bar' );
        } )

        it( 'should validate nested required properties in strict mode', function () {
          var constraint = new Constraint( {
            foo: {
              bar: {
                biz: new Assert().Required()
              }
            }
          }, { strict: true } );

          var result = validator.validate( {
            foo: {}
          }, constraint );

          expect( result ).not.to.be( true );
          expect( result.foo.bar ).to.be.a( Violation );
          expect( result.foo.bar.assert.__class__ ).to.be( 'HaveProperty' );
          expect( result.foo.bar.violation.value ).to.be( 'bar' );
        } )

        it( 'should use default or strict validation', function () {
          var constraint = {
            foo: new Assert().Required(),
            bar: new Assert().Required()
          };

          var strictConstraint = new Constraint( {
            foo: new Assert().Required(),
            bar: new Assert().Required(),
            baz: new Assert().Required()
          }, { strict: true } );

          expect( validator.validate( {
            foo:  42,
            bar:  'bar',
            qux:  'qux'
          }, constraint ) ).to.be( true );

          var result = validator.validate( {
            foo:  42,
            bar:  'bar',
          }, strictConstraint );

          expect( result ).not.to.be( true );
          expect( result.baz ).to.be.a( Violation );
          expect( result.baz.assert.__class__ ).to.be( 'HaveProperty' );
          expect( result.baz.violation.value ).to.be( 'baz' );
        } )

        it( 'should validate an object with a complex constraint', function () {
          var constraint = new Constraint()
              .add( 'name', new Assert().Length( { min: 5, max: 15 } ) )
              .add( 'email', new Assert().NotBlank() );

          var result = validator.validate( { name: 'foo', email: '' }, constraint );

          expect( result ).not.to.be( true );
          expect( result ).to.have.key( 'name' );
          expect( result ).to.have.key( 'email' );

          expect( result.name[ 0 ] ).to.be.a( Violation );
          expect( result.email[ 0 ] ).to.be.a( Violation );
          expect( result.name[ 0 ].assert.__class__ ).to.be( 'Length' );
          expect( result.email[ 0 ].assert.__class__ ).to.be( 'NotBlank' );

          result = validator.validate( { name: 'foo bar', email: '' }, constraint );
          expect( result ).not.to.be( true );
          expect( result ).not.to.have.key( 'name' );
          expect( result ).to.have.key( 'email' );

          result = validator.validate( { name: 'foo bar', email: 'foo@bar.baz' }, constraint );
          expect( result ).to.be( true );
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
            expect( result.foo[ 0 ].assert.__class__ ).to.be( 'NotNull' );
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
            qux: new Assert( [ 'foo', 'qux' ] ).NotNull(),
            biz: new Assert( [ 'biz' ] ).Required(),
          });
        })

        it( 'should validate asserts without validation groups', function () {
          var result = validator.validate( object, constraint );
          expect( result ).to.have.key( 'foo' );
          expect( result ).not.to.have.key( 'bar' );
          expect( result ).to.have.key( 'baz' );
          expect( result ).not.to.have.key( 'qux' );
          expect( result ).not.to.have.key( 'biz' );
        } )

        it( 'should be the same with "Default" group', function () {
          var result = validator.validate( object, constraint, 'Default' );
          expect( result ).to.have.key( 'foo' );
          expect( result ).not.to.have.key( 'bar' );
          expect( result ).to.have.key( 'baz' );
          expect( result ).not.to.have.key( 'qux' );
          expect( result ).not.to.have.key( 'biz' );
        } )

        it( 'should validate against all Asserts with "Any" group', function () {
          var result = validator.validate( object, constraint, 'Any' );
          expect( result ).to.have.key( 'foo' );
          expect( result ).to.have.key( 'bar' );
          expect( result ).to.have.key( 'baz' );
          expect( result ).to.have.key( 'qux' );
          expect( result ).to.have.key( 'biz' );
        } )

        it( 'should validate only a specific validation group', function () {
          var result = validator.validate( object, constraint, 'foo' );
          expect( result ).to.have.key( 'foo' );
          expect( result ).not.to.have.key( 'bar' );
          expect( result ).not.to.have.key( 'baz' );
          expect( result ).to.have.key( 'qux' );
          expect( result ).not.to.have.key( 'biz' );
        } )

        it( 'should validate only two specific validation groups', function () {
          var result = validator.validate( object, constraint, [ 'foo', 'baz' ] );
          expect( result ).to.have.key( 'foo' );
          expect( result ).to.have.key( 'bar' );
          expect( result ).not.to.have.key( 'baz' );
          expect( result ).to.have.key( 'qux' );
          expect( result ).not.to.have.key( 'biz' );
        } )

        it( 'should validate more validation groups', function () {
          var result = validator.validate( object, constraint, [ 'foo', 'qux', 'bar' ] );
          expect( result ).to.have.key( 'foo' );
          expect( result ).not.to.have.key( 'bar' );
          expect( result ).not.to.have.key( 'baz' );
          expect( result ).to.have.key( 'qux' );
          expect( result ).not.to.have.key( 'biz' );
        } )

        it( 'should validate groups with "Default"', function () {
          var result = validator.validate( object, constraint, [ 'foo', 'Default' ] );
          expect( result ).to.have.key( 'foo' );
          expect( result ).not.to.have.key( 'bar' );
          expect( result ).to.have.key( 'baz' );
          expect( result ).to.have.key( 'qux' );
          expect( result ).not.to.have.key( 'biz' );
        } )

        it( 'should validate groups with binded object', function () {
          validator.bind( object, constraint );

          var result = validator.validate( object, [ 'foo', 'Default' ] );
          expect( result ).to.have.key( 'foo' );
          expect( result ).not.to.have.key( 'bar' );
          expect( result ).to.have.key( 'baz' );
          expect( result ).to.have.key( 'qux' );
          expect( result ).not.to.have.key( 'biz' );
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
          expect( result.items[ 0 ][ 0 ] ).not.to.have.key( 'biz' );
        } )
      } )
    } )
  } )
}

exports.Suite = Suite;

} )( 'undefined' === typeof exports ? this[ 'Tests' ] = {} : exports );
