show_server_message('message');

var userfield = document.getElementById('username');
var passwordfield = document.getElementById('password');
var confirmpasswordfield = document.getElementById('confirm_password');
var manage = document.getElementById('manage');
var Email = document.getElementById('Email');
var address = document.getElementById('address');
var term_check = document.getElementById('terms')
function confirm_user(show=false){
    var name = userfield.value;
    if (userfield.value){
        fetch(`/confirm_username?username=${userfield.value}`)
        .then(res => res.json())
        .then(a => {
            // update the border of the user
            if ( a ) {
                // make input red
                userfield.classList.add("error_user_Exist")
                // show notify message that user already exist try other username or contact admin
                if (show){
                    createCookie({cookieName:"local_message",message:`/signup,error,username - '${name}' already exist`,path:'/signup'})
                    show_server_message('local_message');                    
                }
            } else {
                // turn normal
                userfield.classList.remove("error_user_Exist")
            }
        });
    } else {
        userfield.classList.remove("error_user_Exist")
    }
}

// check if password match
confirmpasswordfield.oninput = _=>{
    if (confirmpasswordfield.value && confirmpasswordfield.value !== passwordfield.value){
        confirmpasswordfield.classList.add("error_user_Exist")
        passwordfield.classList.add("error_user_Exist")
    }
    else {
        confirmpasswordfield.classList.remove("error_user_Exist")
        passwordfield.classList.remove("error_user_Exist")
    }
}

document.getElementById("sigupForm").addEventListener('submit',event=>{
    event.preventDefault()            
    var continueBool = true;
    confirm_user(show=true)

    // confirm that user doesn't exist  
    userfield.classList.forEach(ele=>{
        if (ele === "error_user_Exist"){
            continueBool = false
        }
    });

    // check if password is provided
    if (confirmpasswordfield.value && confirmpasswordfield.value !== passwordfield.value){
        createCookie({cookieName:"local_message",message:"/signup,error,Password and Confirm-Password doesn't match",path:'/signup'})
        show_server_message('local_message');
        continueBool = false;
    }
    
    // check other fields are provided    
    if (manage.value && Email.value && address.value && continueBool){
        // if check box is checked 
        if (term_check.checked){
            event.currentTarget.submit();
        }
        else{
            createCookie({cookieName:"local_message",message:`/signup,error,Can't proceed with out terms and condition applied`,path:'/signup'})
        	show_server_message('local_message');                    
        }
    } else {
        if (continueBool){
            createCookie({cookieName:"local_message",message:"/signup,alert,All fields are compulsory",path:'/signup'})
            show_server_message('local_message');
        }
    }
})
