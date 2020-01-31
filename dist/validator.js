/*!
* validator.js
* Guillaume Potier - <guillaume@wisembly.com>
* Version 2.0.4 - built Thu Jan 30 2020 15:34:17
* MIT Licensed
*
*/

( function ( ) {
  var exports = {};

  /**
  * Validator
  */

  function Validator ( options ) {
    if ( ! ( this instanceof Validator ) ) {
      return new Validator( options );
    }

    this.__class__ = 'Validator';
    this.__version__ = '2.0.4';
    this.options = options || {};
    this.bindingKey = this.options.bindingKey || '_validatorjsConstraint';
  };

  Validator.prototype = {

    constructor: Validator,

    /*
    * Validate string: validate( string, Assert, string ) || validate( string, [ Assert, Assert ], [ string, string ] )
    * Validate object: validate( object, Constraint, string ) || validate( object, Constraint, [ string, string ] )
    * Validate binded object: validate( object, string ) || validate( object, [ string, string ] )
    */
    validate: function ( objectOrString, AssertsOrConstraintOrGroup, group ) {
      if ( 'string' !== typeof objectOrString && 'object' !== typeof objectOrString )
        throw new Error( 'You must validate an object or a string' );

      // string / array validation
      if ( 'string' === typeof objectOrString || _isArray(objectOrString) )
        return this._validateString( objectOrString, AssertsOrConstraintOrGroup, group );

      // binded object validation
      if ( this.isBinded( objectOrString ) )
        return this._validateBindedObject( objectOrString, AssertsOrConstraintOrGroup );

      // regular object validation
      return this._validateObject( objectOrString, AssertsOrConstraintOrGroup, group );
    },

    bind: function ( object, constraint ) {
      if ( 'object' !== typeof object )
        throw new Error( 'Must bind a Constraint to an object' );

      object[ this.bindingKey ] = new Constraint( constraint );

      return this;
    },

    unbind: function ( object ) {
      if ( 'undefined' === typeof object._validatorjsConstraint )
        return this;

      delete object[ this.bindingKey ];

      return this;
    },

    isBinded: function ( object ) {
      return 'undefined' !== typeof object[ this.bindingKey ];
    },

    getBinded: function ( object ) {
      return this.isBinded( object ) ? object[ this.bindingKey ] : null;
    },

    _validateString: function ( string, assert, group ) {
      var result, failures = [];

      if ( !_isArray( assert ) )
        assert = [ assert ];

      for ( var i = 0; i < assert.length; i++ ) {
        if ( ! ( assert[ i ] instanceof Assert) )
          throw new Error( 'You must give an Assert or an Asserts array to validate a string' );

        result = assert[ i ].check( string, group, string );

        if ( true !== result )
          failures.push( result );
      }

      return failures.length ? failures : true;
    },

    _validateObject: function ( object, constraint, group ) {
      if ( 'object' !== typeof constraint )
        throw new Error( 'You must give a constraint to validate an object' );

      if ( constraint instanceof Assert )
        return constraint.check( object, group, object );

      if ( constraint instanceof Constraint )
        return constraint.check( object, group, object );

      return new Constraint( constraint ).check( object, group );
    },

    _validateBindedObject: function ( object, group ) {
      return object[ this.bindingKey ].check( object, group, object);
    }
  };

  Validator.errorCode = {
    must_be_a_string: 'must_be_a_string',
    must_be_an_array: 'must_be_an_array',
    must_be_a_number: 'must_be_a_number',
    must_be_a_string_or_array: 'must_be_a_string_or_array'
  };

  /**
  * Constraint
  */

  function Constraint ( data, options ) {
    if ( ! ( this instanceof Constraint ) ) {
      return new Constraint( data, options );
    }

    this.__class__ = 'Constraint';
    this.options = options || {};
    this.nodes = {};

    if ( data ) {
      try {
        this._bootstrap( data );
      } catch ( err ) {
        throw new Error( 'Should give a valid mapping object to Constraint', err, data );
      }
    }
  };

  Constraint.prototype = {

    constructor: Constraint,

    isRequired: function( property, group, deepRequired ) {
      var constraint = this.get( property );
      var constraints = _isArray( constraint ) ? constraint : [constraint];

      for ( var i = constraints.length - 1; i >= 0; i-- ) {
        constraint = constraints[i];

        if ( 'Required' === constraint.__class__ ) {
          if ( constraints[i].requiresValidation( group ) ) {
            return true;
          }
        }

        if ( deepRequired ) {
          if ( 'Collection' === constraint.__class__ ) {
            constraint = constraint.constraint;
          }

          if ( constraint instanceof Constraint ) {
            // ensure constraint of collection gets the same deepRequired option
            constraint.options.deepRequired = deepRequired;

            for ( var node in constraint.nodes ) {
              if ( constraint.isRequired( node, group, deepRequired ) ) {
                return true;
              }
            }
          }
        }
      }

      return false;
    },

    check: function ( object, group ) {
      var result, failures = {};

      // check all constraint nodes.
      for ( var property in this.nodes ) {
        var isRequired = this.isRequired( property, group, this.options.deepRequired );

        if ( ! this.has( property, object ) && ! this.options.strict && ! isRequired ) {
          continue;
        }

        try {
          if (! this.has( property, this.options.strict || isRequired ? object : undefined ) ) {
            // we trigger here a HaveProperty Assert violation to have uniform Violation object in the end
            new Assert().HaveProperty( property ).validate( object );
          }

          result = this._check( property, object[ property ], group, object );

          // check returned an array of Violations or an object mapping Violations
          if ( ( _isArray( result ) && result.length > 0 ) || ( !_isArray( result ) && !_isEmptyObject( result ) ) ) {
            failures[ property ] = result;
          }
        } catch ( violation ) {
          failures[ property ] = violation;
        }
      }

      return _isEmptyObject(failures) ? true : failures;
    },

    add: function ( node, object ) {
      if ( object instanceof Assert || ( _isArray( object ) && object[ 0 ] instanceof Assert ) ) {
        this.nodes[ node ] = object;

        return this;
      }

      if ( 'object' === typeof object && !_isArray( object ) ) {
        this.nodes[ node ] = object instanceof Constraint ? object : new Constraint( object, this.options );

        return this;
      }

      throw new Error( 'Should give an Assert, an Asserts array, a Constraint', object );
    },

    has: function ( node, nodes ) {
      nodes = 'undefined' !== typeof nodes ? nodes : this.nodes;

      return 'undefined' !== typeof nodes[ node ];
    },

    get: function ( node, placeholder ) {
      return this.has( node ) ? this.nodes[ node ] : placeholder || null;
    },

    remove: function ( node ) {
      var _nodes = [];

      for ( var i in this.nodes )
        if ( i !== node )
          _nodes[ i ] = this.nodes[ i ];

      this.nodes = _nodes;

      return this;
    },

    _bootstrap: function ( data ) {
      if ( data instanceof Constraint )
        return this.nodes = data.nodes;

      for ( var node in data )
        this.add( node, data[ node ] );
    },

    _check: function ( node, value, group, context ) {
      // Assert
      if ( this.nodes[ node ] instanceof Assert )
        return this._checkAsserts( value, [ this.nodes[ node ] ], group, context );

      // Asserts
      if ( _isArray( this.nodes[ node ] ) )
        return this._checkAsserts( value, this.nodes[ node ], group, context );

      // Constraint -> check api
      if ( this.nodes[ node ] instanceof Constraint )
        return this.nodes[ node ].check( value, group, context );

      throw new Error( 'Invalid node', this.nodes[ node ] );
    },

    _checkAsserts: function ( value, asserts, group, context ) {
      var result, failures = [];

      for ( var i = 0; i < asserts.length; i++ ) {
        result = asserts[ i ].check( value, group, context );

        if ( 'undefined' !== typeof result && true !== result )
          failures.push( result );

        // Some asserts (Collection for example) could return an object
        // if ( result && ! ( result instanceof Violation ) )
        //   return result;
        //
        // // Vast assert majority return Violation
        // if ( result instanceof Violation )
        //   failures.push( result );
      }

      return failures;
    }
  };

  /**
  * Violation
  */

  function Violation ( assert, value, violation ) {
    if ( ! ( this instanceof Violation ) ) {
      return new Violation( assert, value, violation );
    }

    this.__class__ = 'Violation';

    if ( ! ( assert instanceof Assert || assert.__parentClass__ === 'Assert' ) )
      throw new Error( 'Should give an assertion implementing the Assert interface' );

    this.assert = assert;
    this.value = value;

    if ( 'undefined' !== typeof violation )
      this.violation = violation;
  };

  Violation.prototype = {
    show: function () {
      var show =  {
        assert: this.assert.__class__,
        value: this.value
      };

      if ( this.violation )
        show.violation = this.violation;

      return show;
    },

    __toString: function () {
      var v = '';
      if ( 'undefined' !== typeof this.violation ) {
        this.violation = this.getViolation().constraint + ' expected was ' + this.getViolation().expected;
        v = ", " + this.violation;
      }

      return this.assert.__class__ + ' assert failed for "' + this.value + '"' + v;
    },

    getViolation: function () {
      var constraint, expected;

      for ( constraint in this.violation )
        expected = this.violation[ constraint ];

      return { constraint: constraint, expected: expected };
    }
  };

  /**
  * Assert
  */

  function Assert ( group ) {
    if ( ! ( this instanceof Assert ) )
      return new Assert( group );

    this.__class__ = 'Assert';
    this.__parentClass__ = this.__class__;
    this.groups = [];

    if ( 'undefined' !== typeof group )
      this.addGroup( group );
  };

  /**
   * Extend Assert
   */

  Assert.extend = function ( asserts ) {
    if ( 'object' !== typeof asserts )
      throw new Error( 'Invalid parameter: `asserts` should be an object' );

    if ( 0 === Object.keys( asserts ).length )
      throw new Error( 'Invalid parameter: `asserts` should have at least one property' );

    // Inherit from Assert.
    function Extended( group ) {
      if ( ! ( this instanceof Extended ) )
        return new Extended( group );

      Assert.apply( this, arguments );
    }

    Extended.prototype = Object.create( Assert.prototype );
    Extended.prototype.constructor = Extended;

    // Copy all the static methods.
    Object.keys( Assert ).forEach( function( key ) {
      Extended[ key ] = Assert[ key ];
    } );

    // Extend with custom asserts.
    for ( var key in asserts ) {
      if ( 'function' !== typeof asserts[ key ] )
        throw new Error( 'The extension assert must be a function' );

      Extended.prototype[ key ] = asserts[ key ];
    }

    return _prettify( Extended );
  };

  Assert.prototype = {

    construct: Assert,

    requiresValidation: function ( group ) {
      if ( group && !this.hasGroup( group ) )
        return false;

      if ( !group && this.hasGroups() )
        return false;

      return true;
    },

    check: function ( value, group, context ) {
      if ( !this.requiresValidation( group ) )
        return true;

      try {
        return this.validate( value, group, context );
      } catch ( violation ) {
        return violation;
      }
    },

    hasGroup: function ( group ) {
      if ( _isArray( group ) )
        return this.hasOneOf( group );

      // All Asserts respond to "Any" group
      if ( 'Any' === group )
        return true;

      // Asserts with no group also respond to "Default" group. Else return false
      if ( !this.hasGroups() )
        return 'Default' === group;

      return -1 !== this.groups.indexOf( group );
    },

    hasOneOf: function ( groups ) {
      for ( var i = 0; i < groups.length; i++ )
        if ( this.hasGroup( groups[ i ] ) )
          return true;

      return false;
    },

    hasGroups: function () {
      return this.groups.length > 0;
    },

    addGroup: function ( group ) {
      if ( _isArray( group ) )
        return this.addGroups( group );

      if ( !this.hasGroup( group ) )
        this.groups.push( group );

      return this;
    },

    removeGroup: function ( group ) {
      var _groups = [];

      for ( var i = 0; i < this.groups.length; i++ )
        if ( group !== this.groups[ i ] )
          _groups.push( this.groups[ i ] );

      this.groups = _groups;

      return this;
    },

    addGroups: function ( groups ) {
      for ( var i = 0; i < groups.length; i++ )
        this.addGroup( groups[ i ] );

      return this;
    },

    /**
    * Asserts definitions
    */

    HaveProperty: function ( node ) {
      this.__class__ = 'HaveProperty';
      this.node = node;

      this.validate = function ( object ) {
        if ( 'undefined' === typeof object[ this.node ] )
          throw new Violation( this, object, { value: this.node } );

        return true;
      };

      return this;
    },

    Blank: function () {
      this.__class__ = 'Blank';

      this.validate = function ( value ) {
        if ( 'string' !== typeof value )
          throw new Violation( this, value, { value: Validator.errorCode.must_be_a_string } );

        if ( '' !== value.replace( /^\s+/g, '' ).replace( /\s+$/g, '' ) )
          throw new Violation( this, value );

        return true;
      };

      return this;
    },

    Callback: function ( fn ) {
      this.__class__ = 'Callback';
      this.arguments = Array.prototype.slice.call( arguments );

      if ( 1 === this.arguments.length )
        this.arguments = [];
      else
        this.arguments.splice( 0, 1 );

      if ( 'function' !== typeof fn )
        throw new Error( 'Callback must be instanciated with a function' );

      this.fn = fn;

      this.validate = function ( value ) {
        var result;
        try {
          result = this.fn.apply( this, [ value ].concat( this.arguments ) );
        }
        catch(err) {
          throw new Violation( this, value, { error: err } );
        }

        if ( true !== result )
          throw new Violation( this, value, { result: result } );

        return true;
      };

      return this;
    },

    Choice: function ( list ) {
      this.__class__ = 'Choice';

      if ( !_isArray( list ) && 'function' !== typeof list )
        throw new Error( 'Choice must be instanciated with an array or a function' );

      this.list = list;

      this.validate = function ( value ) {
        var list = 'function' === typeof this.list ? this.list() : this.list;

        for ( var i = 0; i < list.length; i++ )
          if ( value === list[ i ] )
            return true;

        throw new Violation( this, value, { choices: list } );
      };

      return this;
    },

    Collection: function ( assertOrConstraint ) {
      this.__class__ = 'Collection';
      this.constraint = _isPlainObject( assertOrConstraint ) ? new Constraint( assertOrConstraint ) : assertOrConstraint;

      this.validate = function ( collection, group ) {
        var result, validator = new Validator(), count = 0, failures = {}, groups = this.groups.length ? this.groups : group;

        if ( !_isArray( collection ) )
          throw new Violation( this, collection, { value: Validator.errorCode.must_be_an_array } );

        for ( var i = 0; i < collection.length; i++ ) {
          result = this.constraint ?
            validator.validate( collection[ i ], this.constraint, groups ) :
            validator.validate( collection[ i ], groups );

          if ( !_isEmptyObject( result ) )
            failures[ count ] = result;

          count++;
        }

        return !_isEmptyObject( failures ) ? failures : true;
      };

      return this;
    },

    Count: function ( count ) {
      this.__class__ = 'Count';
      this.count = count;

      this.validate = function ( array ) {
        if ( !_isArray( array ) )
          throw new Violation( this, array, { value: Validator.errorCode.must_be_an_array } );

        var count = 'function' === typeof this.count ? this.count( array ) : this.count;

        if ( isNaN( Number( count ) ) )
          throw new Error( 'Count must be a valid interger', count );

        if ( count !== array.length )
          throw new Violation( this, array, { count: count } );

        return true;
      };

      return this;
    },

    Email: function () {
      this.__class__ = 'Email';

      this.validate = function ( value ) {
        var regExp = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;

        if ( 'string' !== typeof value )
          throw new Violation( this, value, { value: Validator.errorCode.must_be_a_string } );

        if ( !regExp.test( value ) )
          throw new Violation( this, value );

        return true;
      };

      return this;
    },

    EqualTo: function ( reference ) {
      this.__class__ = 'EqualTo';

      if ( 'undefined' === typeof reference )
        throw new Error( 'EqualTo must be instanciated with a value or a function' );

      this.reference = reference;

      this.validate = function ( value ) {
        var reference = 'function' === typeof this.reference ? this.reference( value ) : this.reference;

        if ( reference !== value )
          throw new Violation( this, value, { value: reference } );

        return true;
      };

      return this;
    },

    GreaterThan: function ( threshold ) {
      this.__class__ = 'GreaterThan';

      if ( 'undefined' === typeof threshold )
        throw new Error( 'Should give a threshold value' );

      this.threshold = threshold;

      this.validate = function ( value ) {
        if ( '' === value || isNaN( Number( value ) ) )
          throw new Violation( this, value, { value: Validator.errorCode.must_be_a_number } );

        if ( this.threshold >= value )
          throw new Violation( this, value, { threshold: this.threshold } );

        return true;
      };

      return this;
    },

    GreaterThanOrEqual: function ( threshold ) {
      this.__class__ = 'GreaterThanOrEqual';

      if ( 'undefined' === typeof threshold )
        throw new Error( 'Should give a threshold value' );

      this.threshold = threshold;

      this.validate = function ( value ) {
        if ( '' === value || isNaN( Number( value ) ) )
          throw new Violation( this, value, { value: Validator.errorCode.must_be_a_number } );

        if ( this.threshold > value )
          throw new Violation( this, value, { threshold: this.threshold } );

        return true;
      };

      return this;
    },

    InstanceOf: function ( classRef ) {
      this.__class__ = 'InstanceOf';

      if ( 'undefined' === typeof classRef )
        throw new Error( 'InstanceOf must be instanciated with a value' );

      this.classRef = classRef;

      this.validate = function ( value ) {
        if ( true !== (value instanceof this.classRef) )
          throw new Violation( this, value, { classRef: this.classRef } );

        return true;
      };

      return this;
    },

    IsString: function () {
      this.__class__ = 'IsString';

      this.validate = function ( value ) {
        if ( !_isString( value ) )
          throw new Violation( this, value, { value: Validator.errorCode.must_be_a_string } );

        return true;
      };

      return this;
    },

    Length: function ( boundaries ) {
      this.__class__ = 'Length';

      if ( !boundaries.min && !boundaries.max )
        throw new Error( 'Length assert must be instanciated with a { min: x, max: y } object' );

      this.min = parseInt(boundaries.min);
      this.max = parseInt(boundaries.max);

      this.validate = function ( value ) {
        if ( 'string' !== typeof value && !_isArray( value ) )
          throw new Violation( this, value, { value: Validator.errorCode.must_be_a_string_or_array } );

        if ( 'undefined' !== typeof this.min && this.min === this.max && value.length !== this.min )
          throw new Violation( this, value, { min: this.min, max: this.max } );

        if ( 'undefined' !== typeof this.max && value.length > this.max )
          throw new Violation( this, value, { max: this.max } );

        if ( 'undefined' !== typeof this.min && value.length < this.min )
          throw new Violation( this, value, { min: this.min } );

        return true;
      };

      return this;
    },

    LessThan: function ( threshold ) {
      this.__class__ = 'LessThan';

      if ( 'undefined' === typeof threshold )
        throw new Error( 'Should give a threshold value' );

      this.threshold = threshold;

      this.validate = function ( value ) {
        if ( '' === value || isNaN( Number( value ) ) )
          throw new Violation( this, value, { value: Validator.errorCode.must_be_a_number } );

        if ( this.threshold <= value )
          throw new Violation( this, value, { threshold: this.threshold } );

        return true;
      };

      return this;
    },

    LessThanOrEqual: function ( threshold ) {
      this.__class__ = 'LessThanOrEqual';

      if ( 'undefined' === typeof threshold )
        throw new Error( 'Should give a threshold value' );

      this.threshold = threshold;

      this.validate = function ( value ) {
        if ( '' === value || isNaN( Number( value ) ) )
          throw new Violation( this, value, { value: Validator.errorCode.must_be_a_number } );

        if ( this.threshold < value )
          throw new Violation( this, value, { threshold: this.threshold } );

        return true;
      };

      return this;
    },

    NotNull: function () {
      this.__class__ = 'NotNull';

      this.validate = function ( value ) {
        if ( null === value || 'undefined' === typeof value )
          throw new Violation( this, value );

        return true;
      };

      return this;
    },

    NotBlank: function () {
      this.__class__ = 'NotBlank';

      this.validate = function ( value ) {
        if ( 'string' !== typeof value )
          throw new Violation( this, value, { value: Validator.errorCode.must_be_a_string } );

        if ( '' === value.replace( /^\s+/g, '' ).replace( /\s+$/g, '' ) )
          throw new Violation( this, value );

        return true;
      };

      return this;
    },

    NotEqualTo: function ( reference ) {
      this.__class__ = 'NotEqualTo';

      if ( 'undefined' === typeof reference )
        throw new Error( 'NotEqualTo must be instanciated with a value or a function' );

      this.reference = reference;

      this.validate = function ( value ) {
        var reference = 'function' === typeof this.reference ? this.reference( value ) : this.reference;

        if ( reference === value )
          throw new Violation( this, value, { value: reference } );

        return true;
      };

      return this;
    },

    Null: function () {
      this.__class__ = 'Null';

      this.validate = function ( value ) {
        if ( null !== value )
          throw new Violation( this, value );

        return true;
      };

      return this;
    },

    Range: function ( min, max ) {
      this.__class__ = 'Range';

      if ( 'undefined' === typeof min || 'undefined' === typeof max )
        throw new Error( 'Range assert expects min and max values' );

      this.min = min;
      this.max = max;

      this.validate = function ( value ) {
          try {
            // validate strings and objects with their Length
            if ( ( 'string' === typeof value && isNaN( Number( value ) ) ) || _isArray( value ) )
              new Assert().Length( { min: this.min, max: this.max } ).validate( value );

            // validate numbers with their value
            else
              new Assert().GreaterThanOrEqual( this.min ).validate( value ) && new Assert().LessThanOrEqual( this.max ).validate( value );

            return true;
          } catch ( violation ) {
            throw new Violation( this, value, violation.violation );
          }

        return true;
      };

      return this;
    },

    Regexp: function ( regexp, flag ) {
      this.__class__ = 'Regexp';

      if ( 'undefined' === typeof regexp )
        throw new Error( 'You must give a regexp' );

      this.regexp = regexp;
      this.flag = flag;

      this.validate = function ( value ) {
        if ( 'string' !== typeof value )
          throw new Violation( this, value, { value: Validator.errorCode.must_be_a_string } );

        if ( !new RegExp( this.regexp, this.flag ).test( value ) )
          throw new Violation( this, value, { regexp: this.regexp, flag: this.flag } );

        return true;
      };

      return this;
    },

    Required: function () {
      this.__class__ = 'Required';

      this.validate = function ( value ) {
        if ( 'undefined' === typeof value )
          throw new Violation( this, value );

        return true;
      };

      return this;
    },

    // Unique() or Unique ( { key: foo } )
    Unique: function ( object ) {
      this.__class__ = 'Unique';

      if ( 'object' === typeof object )
        this.key = object.key;

      this.validate = function ( array ) {
        var value, store = [];

        if ( !_isArray( array ) )
          throw new Violation( this, array, { value: Validator.errorCode.must_be_an_array } );

        for ( var i = 0; i < array.length; i++ ) {
          value = 'object' === typeof array[ i ] ? array[ i ][ this.key ] : array[ i ];

          if ( 'undefined' === typeof value )
            continue;

          if ( -1 !== store.indexOf( value ) )
            throw new Violation( this, array, { value: value } );

          store.push( value );
        }

        return true;
      };

      return this;
    },

    // When assert
    When: function( ref, options ) {
      this.__class__ = 'When';

      if ( 'string' !== typeof ref )
        throw new Error( 'When assert expects ref to be a string' );

      if ( !_isPlainObject( options ) )
        throw new Error( 'When assert expects options to be a plain object' );

      if ( 'undefined' ===  typeof options.is )
        throw new Error( 'When assert expects an is constraint' );

      if ( 'undefined' ===  typeof options.otherwise && 'undefined' ===  typeof  options.then )
        throw new Error( 'When assert expects a otherwise constraint or a then constraint or both' );

      this.options = {
        is: _isPlainObject( options.is ) ? new Constraint( options.is ) : options.is,
        otherwise: _isPlainObject( options.otherwise ) ? new Constraint( options.otherwise ) : options.otherwise,
        then: _isPlainObject( options.then ) ? new Constraint( options.then ) : options.then
      };
      this.ref = ref;

      this.validate = function ( value, group, context ) {
        if ( 'undefined' === typeof context )
          throw new Error( 'When assert expects context to be defined' );

        if ( 'undefined' !== typeof context[ this.ref ] ) {
          var failures = {}, validator = new Validator();

          try {
            failures = validator.validate( context[ this.ref ], this.options.is );

            if ( !_isEmptyObject( failures ) )
              throw new Error();

            if ( this.options.then )
              failures = validator.validate( value, this.options.then );
          } catch ( e ) {
            if ( this.options.otherwise )
              failures = validator.validate( value, this.options.otherwise );
          }
        }

        return !_isEmptyObject( failures ) ? failures : true;
      };

      return this;
    }
  };

  /**
  * Some useful object prototypes / functions here
  */

  // IE8<= compatibility
  // https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/indexOf
  if (!Array.prototype.indexOf)
    Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
        "use strict";
        if (this === null) {
            throw new TypeError();
        }
        var t = Object(this);
        var len = t.length >>> 0;
        if (len === 0) {
            return -1;
        }
        var n = 0;
        if (arguments.length > 1) {
            n = Number(arguments[1]);
            if (n != n) { // shortcut for verifying if it's NaN
                n = 0;
            } else if (n !== 0 && n != Infinity && n != -Infinity) {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
        }
        if (n >= len) {
            return -1;
        }
        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
        for (; k < len; k++) {
            if (k in t && t[k] === searchElement) {
                return k;
            }
        }
        return -1;
    };

  // Test if object is empty, useful for Constraint violations check
  var _isEmptyObject = function ( obj ) {
    for ( var property in obj )
      return false;

    return true;
  };

  var _isArray = function ( obj ) {
    return Object.prototype.toString.call( obj ) === '[object Array]';
  };

  var _isPlainObject = function ( obj ) {
    return typeof obj === 'object' && Object.getPrototypeOf( obj ) === Object.prototype;
  };

  var _isString = function ( str ) {
    return Object.prototype.toString.call( str ) === '[object String]';
  };

  var _toCamelCase = function ( str ) {
    return str
      .replace(/\s(.)/g, function( $1 ) { return $1.toUpperCase(); })
      .replace(/\s/g, '')
      .replace(/^(.)/, function( $1 ) { return $1.toLowerCase(); });
  };

  var _prettify = function _prettify ( Fn ) {
    // Copy prototype properties.
    for ( var property in Fn.prototype ) {
      var matches = property.match(/^(.*?[A-Z]{2,})(.*)$/);
      var camelCaseProperty = _toCamelCase( property );

      if ( matches !== null ) {
        camelCaseProperty = matches[1] + _toCamelCase( matches[2] );
      }

      if (camelCaseProperty === property) {
        continue;
      }

      // Create `camelCase` aliases.
      _alias( Fn.prototype, property, camelCaseProperty );

      // Add static methods as aliases.
      Fn[ camelCaseProperty ] = (function( prop ) {
        return function() {
          var assert = new Fn();

          return assert[ prop ].apply( assert, arguments );
        }
      })( property );

      _alias( Fn, camelCaseProperty, property );
    }

    return Fn;
  };

  var _alias = function _alias ( object, from, to ) {
    object[ to ] = object[ from ];
  }

  // aliases
  _alias( Assert.prototype, 'Length', 'OfLength' );
  _alias( Assert.prototype, 'HaveProperty', 'PropertyDefined' );
  _alias( Assert.prototype, 'IsString', 'String' );

  // prettify
  _prettify( Assert );

  // expose to the world these awesome classes
  exports.Assert = Assert;
  exports.Constraint = Constraint;
  exports.Validator = Validator;
  exports.Violation = Violation;

  exports.assert = function( group ) {
    return new Assert( group );
  };

  exports.constraint = function( data, options ) {
    return new Constraint( data, options );
  };

  exports.validator = function( options ) {
    return new Validator( options );
  };

  exports.violation = function( assert, value, violation ) {
    return new Violation( assert, value, violation );
  };

  // AMD export
  if ( typeof define === 'function' && define.amd ) {
    define( function() {
      return exports;
    } );

  // commonjs export
  } else if ( typeof module !== 'undefined' && module.exports ) {
    module.exports = exports;

  // browser
  } else {
    window[ 'undefined' !== typeof validatorjs_ns ? validatorjs_ns : 'Validator' ] = exports;
  }
} )( );
