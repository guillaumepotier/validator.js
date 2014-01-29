# CHANGELOG

**0.5.2**

    - Length validator now accepts arrays too

**0.5.1**

    - Violation now stors whole Assert not only Assert.__class__

**0.5.0**

    - it is now possible to validate string/obj against all Asserts with "Any" group

**0.4.11**

    - allowed Callback Assert to have multiple configuration parameters

**0.4.11**

    - allow groups to be numeric

**0.4.10**

    - named validator AMD define
    - added grunt tasks to automate builds

**0.4.7**

    - renamed `Validator.const` to avoid IE7/8 errors

**0.4.6**

  - validator.js is now AMD compliant to work with requirejs

**0.4.5**

  - bower stuff

**0.4.4**

  - fixed Required validator (#5)
  - updated package scripts

**0.4.3**

  - added Mac() and IPv4() Asserts (#1)

**0.4.2**

  - added `strict` validation option to Constraint

**0.4.1**

  - fixed Required Assert
  - successful validation returns now `true` value, not empty array or object anymore
