function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function createCookie({cookieName,message,path}){
    document.cookie = `${cookieName}=${message};path=${path};expires = ${new Date(Date.now() + 15*1000)};`   
}

function remove_notification(element){
    var fadeEffect = setInterval(function () {
        if (!element.style.opacity) {
            element.style.opacity = 1;
        }
        if (element.style.opacity > 0) {
            element.style.opacity -= 0.1;
        } else {
            clearInterval(fadeEffect);
        }
    }, 15);
}

function show_server_message(cookieName){
    var result = getCookie(cookieName).split(',',3);
    if (result){
        // to confirm the route 
        if (document.location['pathname'] === result[0]){
            // display data
            var element = document.createElement("DIV");   
            element.classList.add("server_message");
            // create a element and append in document 
            element.classList.add(result[1]);
            // message here 
            element.innerHTML = result[2];
            document.body.appendChild(element);

            // delete cookie after showing data once.
            document.cookie = `${cookieName}=;path=${result[0]};expires=Thu, 01-Jan-70 00:00:01 GMT;`


            // remove element after some time
            var autoremove = setTimeout(function() {
                remove_notification(element);
                setTimeout(function() {
                    element.parentNode.removeChild(element);
                }, 2400);
            }, 2500);

            element.onclick = _ => {
                remove_notification(element);
                // remove autoremove timeout
                element.parentNode.removeChild(element);
                clearInterval(autoremove);
            }

        }
    }
}