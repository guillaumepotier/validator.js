var expect = require( 'expect.js' ),
    jsValidator = require( '../jsValidator' );

describe( 'jsValidator suite', function () {
  describe( 'Assert', function () {
    var Assert = new jsValidator.Assert();

    it( 'should be an object', function () {
      expect( Assert ).to.be.an( 'object' );
    } )

    it( 'should have "Assert" __class__', function () {
      expect( Assert.__class__).to.be( 'Assert' );
    } )
  } )
} )