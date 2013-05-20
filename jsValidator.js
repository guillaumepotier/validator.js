( function ( exports ) {

  /**
  * Validator
  */

  var Validator = function () {
    this.__class__ = 'Validator';
    this.constraints = [];
    this.groups = [];
    this.errors = [];

    return this;
  };

  Validator.prototype = {

    constructor: Validator,

    validate: function ( object, collection, group ) {
      if ( 'undefined' === typeof collection.__class__ || !( 'Constraint' === collection.__class__ || 'Collection' === collection.__class__ ) )
        throw new Error( 'You must give a Constraint or a constraints Collection' );

      if ( 'string' === typeof object) {
        return this._validateString( object, collection, group );
      }

      return this._validateObject( object, collection, group );
    },

    _validateString: function ( string, constraint, group ) {
      if ( 'Constraint' !== constraint.__class__ )
        typeof new Error( 'You must give a Constraint to validate a string, ' + constraint.__class__ + ' given' );

      return constraint.check( string, group );
    },

    _validateObject: function ( object, collection, group ) {
      if ( 'Collection' !== collection.__class__ )
        typeof new Error( 'You must give a Collection to validate an object, ' + collection.__class__ + ' given' );

      return collection.check( object, group );
    }
  };

  /**
  * Collection
  */

  var Collection = function ( constraints ) {
    this.__class__ = 'Collection';
    this.constraints = constraints || {};

    return this;
  };

  Collection.prototype = {

    constructor: Collection,

    add: function ( key, constraint, force ) {
      if ( 'undefined' === typeof constraint.__class__ || 'Constraint' !== constraint.__class__ )
        throw new Error( 'Should be an instance of Constraint' );

      if ( ( !this.has( key ) && 'undefined' === typeof force ) || force )
        this.constraints[ key ] = constraint;

      return this;
    },

    get: function ( key, placeholder ) {
      return 'undefined' !== typeof this.constraints[ key ] ? this.constraints[ key ] : placeholder || null;
    },

    has: function ( key ) {
      return 'undefined' !== typeof this.constraints[ key ];
    },

    remove: function ( key ) {
      delete this.constraints[ key ];

      return this;
    }
  };

  /**
  * Constraint
  */

  var Constraint = function ( asserts ) {
    this.__class__ = 'Constraint';
    this.asserts = [];

    if ( 'undefined' !== typeof asserts && 'undefined' !== typeof asserts.__parentClass__ && 'Assert' === asserts.__parentClass__ )
      asserts = [ asserts ];

    this.addMultiple( asserts || [], true );

    return this;
  };

  Constraint.prototype = {

    constructor: Constraint,

    check: function ( value, group ) {
      var result, failures = [];

      if ( group && !this.hasGroup( group ) )
        throw new Error( 'The "' + group + '" group does not exist in any Assert' );

      for ( var i = 0; i < this.asserts.length; i++ ) {
        if ( group && !this.asserts[ i ].hasGroup( group ) )
          continue;

        if ( !group && this.asserts[ i ].hasGroups() )
          continue;

        result = this.asserts[ i ].validate( value );

        if ( true !== result )
          failures.push( result );
      }

      return failures;
    },

    add: function ( assert, deep ) {
      if ( 'undefined' === typeof assert.__parentClass__ && 'Assert' !== assert.__parentClass__ )
        throw new Error( 'Should give an Assert object' );

      if ( !this.has( assert, deep ) )
        this.asserts.push( assert );

      return this;
    },

    addMultiple: function ( asserts, deep ) {
      for ( var i = 0; i < asserts.length; i++ ) {
        this.add( asserts[ i ], deep );
      }

      return this;
    },

    has: function ( assert, deep ) {
      for ( var i = 0; i < this.asserts.length; i++ )
        if ( ( 'undefined' === typeof deep && assert.__class__ === this.asserts[ i ].__class__ ) || ( deep && this.asserts[ i ].isEqualTo( assert ) ) )
          return true;

      return false;
    },

    remove: function ( assert, deep ) {
      var _asserts = [];

      for ( var i = 0; i < this.asserts.length; i++ )
        if ( ( 'undefined' === typeof deep && assert.__class__ !== this.asserts[ i ].__class__ ) || ( deep && !this.asserts[ i ].isEqualTo( assert ) ) )
          _asserts.push( this.asserts[ i ] );

      this.asserts = _asserts;

      return this;
    },

    hasGroup: function ( group ) {
      for ( var i = 0; i < this.asserts.length; i++ )
        if ( this.asserts[ i ].hasGroup( group ) )
          return true;

      return false;
    }
  };

  /**
  * Violation
  */

  var Violation = function ( assert, value, violation ) {
    this.__class__ = 'Violation';

    if ( 'undefined' === typeof assert.__class__ )
      throw new Error( 'Should give an assertion implementing the Assert interface' );

    this.assert = assert.__class__;
    this.value = value;
    this.violation = violation;

    this.show = function () {
      return {
        assert: this.assert,
        value: this.value,
        violation: this.violation
      };
    };

    this.__toString = function () {
      if ( 'undefined' !== typeof this.violation )
        var violation = '", ' + this.getViolation().constraint + ' expected was ' + this.getViolation().expected;

      return this.assert + ' assert failed for "' + this.value + violation || '';
    };

    this.getViolation = function () {
      var constraint, expected;

      for ( constraint in this.violation )
        expected = this.violation[ constraint ];

      return { constraint: constraint, expected: expected };
    };

    return this;
  };

  /**
  * Assert
  */

  var Assert = function () {
    this.__class__ = 'Assert';
    this.__parentClass__ = this.__class__;

    return this;
  };

  Assert.prototype = {

    construct: Assert,

    _setGroups: function ( groups ) {
      if ( 'string' === typeof groups )
        groups = [ groups ];

      this.groups = groups || [];
    },

    hasGroup: function ( group ) {
      if ( !this.groups.length )
        return false;

      return -1 !== this.groups.indexOf( group );
    },

    hasGroups: function () {
      return this.groups.length > 0;
    },

    addGroup: function ( group ) {
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

    NotNull: function ( groups ) {
      this.__class__ = 'NotNull';
      this._setGroups( groups );

      this.validate = function ( value ) {
        return null !== value ? true : new Violation( this, value );
      };

      return this;
    },

    NotBlank: function ( groups ) {
      this.__class__ = 'NotBlank';
      this._setGroups( groups );

      this.validate = function ( value ) {
        return 'string' === typeof value && '' !== value.replace( /^\s+/g, '' ).replace( /\s+$/g, '' ) ? true : new Violation( this, value );
      };

      return this;
    },

    Length: function ( min, max, groups ) {
      this.__class__ = 'Length';
      this._setGroups( groups );
      this.min = min;
      this.max = max;

      this.validate = function ( value ) {
        if ( 'undefined' !== typeof this.min && this.min === this.max && value.length !== this.min )
          return new Violation( this, value, { min: this.min, max: this.max } );

        if ( 'undefined' !== typeof this.max && value.length > this.max )
          return new Violation( this, value, { max: this.max } );

        if ( 'undefined' !== typeof this.min && value.length < this.min )
          return new Violation( this, value, { min: this.min } );

        return true;
      };

      return this;
    }
  };

  // expose to the world these awesome classes
  exports.Assert = Assert;
  exports.Validator = Validator;
  exports.Violation = Violation;
  exports.Constraint = Constraint;
  exports.Collection = Collection;

  /**
  * Some useful object prototypes here
  */

  // IE8<= compatibility
  // https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/indexOf
  if (!Array.prototype.indexOf)
    Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
        "use strict";
        if (this == null) {
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
            } else if (n != 0 && n != Infinity && n != -Infinity) {
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

  // Test two objects against each other to detrmine if strictly equal *by properties* only
  Object.prototype.isEqualTo = function ( object ) {
    for ( var i in this ) {
      if ( 'function' === typeof this[ i ] )
        continue;

      if ( 'undefined' === typeof this[ i ] && 'undefined' !== typeof object[ i ] )
        return false;

      if ( 'undefined' !== typeof this[ i ] && 'undefined' === typeof object[ i ] )
        return false;

      if ( 'object' === typeof this[ i ] ) {
        if ( this[ i ].length > 0 && this[ i ].length !== object[ i ].length )
          return false;

        if ( false === this[ i ].isEqualTo( object[ i ] ) )
          return false;
        else
          continue;
      }

      if ( this[ i ] !== object[ i ] )
        return false;
    }

    return true;
  };

} )( 'undefined' === typeof exports ? this.jsValidator = {} : exports );