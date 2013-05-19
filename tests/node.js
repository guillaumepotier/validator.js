var jsValidator = require('../jsValidator'),
    sys = require('sys');

var constraint = new jsValidator.Constraint([new jsValidator.Assert().Length(5, 10)]),
    validator = new jsValidator.Validator();

sys.puts(validator.validate('toto', constraint)[0].__toString());