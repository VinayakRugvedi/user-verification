var submitButton = document.querySelector('.submitButton')
submitButton.addEventListener('click', () => {
  var emailEntered = document.getElementById('email')
  var passwordEntered = document.getElementById('password')
  fetch('http://localhost:5000/userVerify', {
    method : "POST",
    body : JSON.stringify({
      email : emailEntered.value,
      password : passwordEntered.value
    }),
    headers : {
      'Content-Type' : 'application/json'
    }
  })
  .then(res => res.json())
  .then(json => {
        console.log(json)
        emailEntered.value = ''
        passwordEntered.value = ''})
})
