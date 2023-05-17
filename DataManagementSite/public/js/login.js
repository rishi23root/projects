// show any message if exist
show_server_message('message');

// make login only when fields are not empty
var username = document.getElementById("username");
var password = document.getElementById("password");
var loginForm = document.getElementById("loginForm");

function check_it(value){
    if (value === ""){
        createCookie({cookieName : 'local_message',message: '/login,error,Username or password can not be Empty',path : '/login'})
    }
}

loginForm.addEventListener('submit',event=>{
    event.preventDefault()            
    check_it(username.value);
    check_it(password.value);
    show_server_message('local_message');
    if (username.value && password.value){
        event.currentTarget.submit();
    }
})