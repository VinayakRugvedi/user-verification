var submitButton = document.querySelector('.submitButton')
submitButton.addEventListener('click', () => {
  var emailEntered = document.getElementById('email')
  var passwordEntered = document.getElementById('password')
  fetch('http://localhost:5000/authenticateUser', {
    method : "POST",
    body : JSON.stringify({
      email : emailEntered.value,
      password : passwordEntered.value,
      confirmedPassword : passwordEntered.value
    }),
    headers : {
      'Content-Type' : 'application/json'
    }
  })
  .then(res => res.json())
  .then(json => {
        console.log(json)
        let element = document.querySelector('.message')
        element.textContent = json.msg
      })
})
