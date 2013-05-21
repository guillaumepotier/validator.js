( function ( exports ) {

  /**
  * Validator
  */

  var Validator = function () {
    this.__class__ = 'Validator';

    return this;
  };

  Validator.prototype = {

    constructor: Validator,

    validate: function ( objectOrString, AssertsOrConstraint, group ) {
      if ( 'string' === typeof objectOrString) {
        return this._validateString( objectOrString, AssertsOrConstraint, group );
      }

      return this._validateObject( objectOrString, AssertsOrConstraint, group );
    },

    _validateString: function ( string, assert, group ) {
      var result, failures = [];

      if ( !_isArray( assert ) )
        assert = [ assert ];

      // todo: test group to see if exists in Asserts.
      // it.skip( 'should not validate against a non existent group' );

      for ( var i = 0; i < assert.length; i++ ) {
        if ( ! ( assert[ i ] instanceof Assert) )
          throw new Error( 'You must give an Assert or an Asserts array to validate a string' );

        result = assert[ i ].check( string, group );

        if ( result instanceof Violation )
          failures.push( result );
      }

      return failures;
    },

    _validateObject: function ( object, collection, group ) {
      if ( ! ( collection instanceof Collection ) )
        typeof new Error( 'You must give a Collection to validate an object, ' + collection.__class__ + ' given' );

      return collection.check( object, group );
    }
  };

  /**
  * Collection
  */

  var Collection = function ( constraints ) {
    this.__class__ = 'Collection';
    this.constraints = {};

    if ( 'object' === typeof constraints )
      this.addJSON( constraints );

    return this;
  };

  Collection.prototype = {

    constructor: Collection,

    check: function ( object, group ) {
      var result, failures = {};

      if ( group && !this.hasGroup( group ) )
        throw new Error( 'The "' + group + '" group does not exist in any Constraint Assert' );

      for ( var i in this.constraints ) {
        if ( 'undefined' === typeof object[ i ] )
          continue;

        if ( 'function' === typeof object[ i ] )
          continue;

        result = this.constraints[ i ].check( object[ i ], group, false );

        if ( result.length )
          failures[ i ] = result;
      }

      return failures;
    },

    add: function ( key, constraint, force ) {
      if ( ! ( constraint instanceof Constraint ) )
        throw new Error( 'Should be an instance of Constraint' );

      if ( ( !this.has( key ) && 'undefined' === typeof force ) || force )
        this.constraints[ key ] = constraint;

      return this;
    },

    addJSON: function ( constraints ) {
      for ( var i in constraints )
        this.add( i, constraints[ i ] instanceof Constraint ? constraints[ i ] : new Constraint( constraints[ i ] ) );

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
    },

    hasGroups: function ( groups ) {
        for ( var i = 0; i < groups.length; i++ )
          if ( this.hasGroup( groups[ i ] ) ) return true;

      return false;
    },

    hasGroup: function ( group ) {
      if ( 'object' === typeof group )
        return this.hasGroups( group );

      for ( var i in this.constraints ) {
        if ( this.constraints[ i ].hasGroup( group ) )
          return true;
      }

      return false;
    }
  };

  /**
  * Constraint
  */

  var Constraint = function ( asserts ) {
    this.__class__ = 'Constraint';
    this.asserts = [];
    this.addMultiple( asserts || [], true );

    return this;
  };

  Constraint.prototype = {

    constructor: Constraint,

    check: function ( value, group, groupCheck ) {
      var result, failures = [];

      if ( group && false !== groupCheck && !this.hasGroup( group ) )
        throw new Error( 'The "' + group + '" group does not exist in any Assert' );

      for ( var i = 0; i < this.asserts.length; i++ ) {
        if ( group && !this.asserts[ i ].hasGroup( group ) )
          continue;

        if ( !group && this.asserts[ i ].hasGroups() )
          continue;

        try {
          this.asserts[ i ].validate( value );
        } catch ( violation ) {
          failures.push( violation );
        }
      }

      return failures;
    },

    add: function ( assert, deep ) {
      if ( ! ( assert instanceof Assert ) ) {
        throw new Error( 'Should give an Assert object' );
      }

      if ( !this.has( assert, deep ) )
        this.asserts.push( assert );

      return this;
    },

    addMultiple: function ( asserts, deep ) {
      if ( asserts instanceof Assert )
        asserts = [ asserts ];

      for ( var i = 0; i < asserts.length; i++ ) {
        if ( asserts[ i ] instanceof Assert )
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

    hasGroups: function ( groups ) {
        for ( var i = 0; i < groups.length; i++ )
          if ( this.hasGroup( groups[ i ] ) ) return true;

      return false;
    },

    hasGroup: function ( group ) {
      if ( 'object' === typeof group )
        return this.hasGroups( group );

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

    if ( ! ( assert instanceof Assert ) )
      throw new Error( 'Should give an assertion implementing the Assert interface' );

    this.assert = assert.__class__;
    this.value = value;
    this.violation = violation;
  };

  Violation.prototype = {
    show: function () {
      return {
        assert: this.assert,
        value: this.value,
        violation: this.violation
      };
    },

    __toString: function () {
      if ( 'undefined' !== typeof this.violation )
        var violation = '", ' + this.getViolation().constraint + ' expected was ' + this.getViolation().expected;

      return this.assert + ' assert failed for "' + this.value + violation || '';
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

  var Assert = function () {
    this.__class__ = 'Assert';
    this.__parentClass__ = this.__class__;

    return this;
  };

  Assert.prototype = {

    construct: Assert,

    check: function ( value, group ) {
      if ( group && !this.hasGroup( group ) )
        return;

      if ( !group && this.hasGroups() )
        return;

      try {
        this.validate( value );
      } catch ( violation ) {
        return violation;
      }
    },

    _setGroups: function ( groups ) {
      if ( 'string' === typeof groups )
        groups = [ groups ];

      this.groups = groups || [];
    },

    hasGroup: function ( group ) {
      if ( 'string' !== typeof group )
        return this.hasOneOf( group );

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
      if ( 'object'=== typeof group )
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

    NotNull: function ( groups ) {
      this.__class__ = 'NotNull';
      this._setGroups( groups );

      this.validate = function ( value ) {
        if ( null === value )
          throw new Violation( this, value );

        return true;
      };

      return this;
    },

    NotBlank: function ( groups ) {
      this.__class__ = 'NotBlank';
      this._setGroups( groups );

      this.validate = function ( value ) {
        if ( 'string' !== typeof value || '' === value.replace( /^\s+/g, '' ).replace( /\s+$/g, '' ) )
          throw new Violation( this, value );

        return true;
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
          throw new Violation( this, value, { min: this.min, max: this.max } );

        if ( 'undefined' !== typeof this.max && value.length > this.max )
          throw new Violation( this, value, { max: this.max } );

        if ( 'undefined' !== typeof this.min && value.length < this.min )
          throw new Violation( this, value, { min: this.min } );

        return true;
      };

      return this;
    },

    Email: function ( groups ) {
      this.__class__ = 'Email';
      this._setGroups( groups );

      this.validate = function ( value ) {
        var regExp = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;

        if ( '' !== value || !regExp.test( value ) )
          throw new Violation( this, value );

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
  * Some useful object prototypes / functions here
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

  function _isArray ( obj ) {
    return Object.prototype.toString.call( obj ) === '[object Array]';
  }

} )( 'undefined' === typeof exports ? this[ validatorjs_ns || 'Validator' ] = {} : exports );