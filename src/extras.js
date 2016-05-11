/*!
* Part of @@name
* Version @@version - built @@timestamp
*/

( function ( factory ) {
  if ( typeof define === 'function' && define.amd ) {
    define( [ 'validator'], factory); // AMD
  } else if ( typeof exports === 'object' ) {
    module.exports = factory( require( './validator.js' ) ); // Node
  } else {
    factory( window[ 'undefined' !== typeof validatorjs_ns ? validatorjs_ns : 'Validator' ] ); // Browser global
  }
}( function ( validator ) {
  var asserts = {
    Eql: function ( eql ) {
      this.__class__ = 'Eql';

      if ( 'undefined' === typeof eql )
        throw new Error( 'Equal must be instanciated with an Array or an Object' );

      this.eql = eql;

      this.validate = function ( value ) {
        var eql = 'function' === typeof this.eql ? this.eql( value ) : this.eql;

        if ( !expect.eql( eql, value ) )
          throw new validator.Violation( this, value, { eql: eql } );

        return true;
      };

      return this;
    },

    Mac: function () {
      this.__class__ = 'Mac';

      this.validate = function ( value ) {
        var regExp = /^(?:[0-9A-F]{2}:){5}[0-9A-F]{2}$/i;

        if ( 'string' !== typeof value )
          throw new validator.Violation( this, value, { value: Validator.errorCode.must_be_a_string } );

        if ( !regExp.test( value ) )
          throw new validator.Violation( this, value );

        return true;
      };

      return this;
    },

    IPv4: function () {
      this.__class__ = 'IPv4';

      this.validate = function ( value ) {
        var regExp = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

        if ( 'string' !== typeof value )
          throw new validator.Violation( this, value, { value: Validator.errorCode.must_be_a_string } );

        if ( !regExp.test( value ) )
          throw new validator.Violation( this, value );

        return true;
      };

      return this;
    }
  };

  // https://github.com/LearnBoost/expect.js/blob/master/expect.js
  var expect = {
    eql: function ( actual, expected ) {
      if ( actual === expected ) {
        return true;
      } else if ( 'undefined' !== typeof Buffer && Buffer.isBuffer( actual ) && Buffer.isBuffer( expected ) ) {
        if ( actual.length !== expected.length ) return false;

        for ( var i = 0; i < actual.length; i++ )
          if ( actual[i] !== expected[i] ) return false;

        return true;
      } else if ( actual instanceof Date && expected instanceof Date ) {
        return actual.getTime() === expected.getTime();
      } else if ( typeof actual !== 'object' && typeof expected !== 'object' ) {
        // loosy ==
        return actual == expected;
      } else {
        return this.objEquiv(actual, expected);
      }
    },
    isUndefinedOrNull: function ( value ) {
      return value === null || typeof value === 'undefined';
    },
    isArguments: function ( object ) {
      return Object.prototype.toString.call(object) == '[object Arguments]';
    },
    keys: function ( obj ) {
      if ( Object.keys )
        return Object.keys( obj );

      var keys = [];

      for ( var i in obj )
        if ( Object.prototype.hasOwnProperty.call( obj, i ) )
          keys.push(i);

      return keys;
    },
    objEquiv: function ( a, b ) {
      if ( this.isUndefinedOrNull( a ) || this.isUndefinedOrNull( b ) )
        return false;

      if ( a.prototype !== b.prototype ) return false;

      if ( this.isArguments( a ) ) {
        if ( !this.isArguments( b ) )
          return false;

        return eql( pSlice.call( a ) , pSlice.call( b ) );
      }

      try {
        var ka = this.keys( a ), kb = this.keys( b ), key, i;

        if ( ka.length !== kb.length )
          return false;

        ka.sort();
        kb.sort();

        for ( i = ka.length - 1; i >= 0; i-- )
          if ( ka[ i ] != kb[ i ] )
            return false;

        for ( i = ka.length - 1; i >= 0; i-- ) {
          key = ka[i];
          if ( !this.eql( a[ key ], b[ key ] ) )
             return false;
        }

        return true;
      } catch ( e ) {
        return false;
      }
    }
  };

  return validator.Assert.extend(asserts);
} ) );
