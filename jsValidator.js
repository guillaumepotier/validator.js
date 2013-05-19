( function ( exports ) {

  var Validator = function () {
    this.__class__ = 'Validator';
    this.constraints = [];
    this.groups = [];
    this.errors = [];

    return this;
  };

  Validator.prototype = {

    constructor: Validator,

    validate: function ( object, collection ) {
      if ( !collection instanceof Collection && !collection instanceof Constraint )
        throw new Error( 'You must give a Constraint or a constraints Collection' );

      if ( 'string' === typeof object) {
        return this.validateString( object, collection );
      }

      return this.validateObject( object, collection );
    },

    validateString: function ( string, constraint ) {
      if ( 'Constraint' !== constraint.__class__ )
        typeof new Error( 'You must give a Constraint to validate a string, ' + constraint.__class__ + ' given' );

      return constraint.check( string );
    },

    validateObject: function ( object, collection ) {
      if ( 'Collection' !== collection.__class__ )
        typeof new Error( 'You must give a Collection to validate an object, ' + collection.__class__ + ' given' );
    }
  };

  var Collection = function () {
    this.__class__ = 'Collection';
    this.constraints = {};
  };

  Collection.prototype = {

    constructor: Collection
  };

  var Constraint = function ( asserts, groups ) {
    this.__class__ = 'Constraint';
    this.groups = groups || [];
    this.asserts = asserts || [];

    return this;
  };

  Constraint.prototype = {

    constructor: Constraint,

    check: function ( value ) {
      var result, failures = [];

      for ( var i in this.asserts ) {
        result = this.asserts[ i ].validate( value );

        if ( true !== result )
          failures.push( result );

        return failures;
      }
    }
  };

  var Violation = function ( assert, value, violation ) {
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

  var Assert = function () {
    this.__class__ = 'Assert';

    return this;
  };

  Assert.prototype = {

    construct: Assert,

    NotNull: function () {
      this.__class__ = 'NotNull';

      this.validate = function ( value ) {
        return null !== value ? true : new Violation( this, value );
      };
    },

    NotBlank: function () {
      this.__class__ = 'NotBlank';

      this.validate = function ( value ) {
        return 'string' === typeof value && '' !== value.replace( /^\s+/g, '' ).replace( /\s+$/g, '' ) ? true : new Violation( this, value );
      };
    },

    Length: function ( min, max ) {
      this.__class__ = 'Length';
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

  exports.Assert = Assert;
  exports.Validator = Validator;
  exports.Violation = Violation;
  exports.Constraint = Constraint;
  exports.Collection = Collection;

} )( 'undefined' === typeof exports ? this.jsValidator = {} : exports );