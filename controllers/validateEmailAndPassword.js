const validator = require('validator')

function performValidations(req, res, next) {
    //Validating the body which contains email and password before moving ahead
    let validationStatus =
    validateEmailAndPassword(req.body.email, req.body.password, req.body.confirmedPassword)
    if(typeof validationStatus === 'object')
      res.status(400).json(validationStatus)
    else next()
}

function validateEmailAndPassword(email, password, confirmPassword) {
  let messageObject = {
    msg : ''
  }

  if(validator.isEmpty(email)) {
    messageObject.msg = "The email field is left empty"
    return messageObject
  }
  if(!validator.isEmail(email)) {
    messageObject.msg = "The email entered is not in the right format"
    return messageObject
  }
  return validatePassword(password, confirmPassword)
}

function validatePassword(password, confirmPassword) {
  let messageObject = {
    msg : ''
  }
  if(validator.isEmpty(password) || validator.isEmpty(confirmPassword)) {
    messageObject.msg = "Either the password or the Confirm Password field is left empty"
    return messageObject
  }
  if(!validator.isLength(password, {min:8, max:25}) || !validator.isLength(confirmPassword, {min:8, max:25})) {
    messageObject.msg = "The length of password should be in the range of 8 - 25"
    return messageObject
  }
  if(!validator.equals(password, confirmPassword)) {
    messageObject.msg = "The passwords do not match"
    return messageObject
  }
}

module.exports = performValidations
