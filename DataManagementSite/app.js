const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require("helmet");
const cors = require('cors');
const app = express();
const {savedata,confirm_user,
       confirm_username,
       update_profile_data,
       read_user,
       save_session,
       read_session,
       delete_session} = require('./database/database.js');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config()
const port = process.env.PORT || 5000;

// ############ middlewares ################
app.locals.basedir = __dirname;
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors())
app.use(helmet({ contentSecurityPolicy: (process.env.NODE_ENV === 'production') ? undefined : false }));
app.set('views', path.join(__dirname, 'views'))
app.use('/static', express.static(__dirname + '/public'));
// #########################################
// cookie format - message=pagename,messagetype,message 
// message-types = {success:blue, alert:green, error:red}

app.get('/', (req, res) => {
    // if user have valid session id then redirect to profile page of the user
    var cookies = JSON.parse(JSON.stringify(req.cookies));
    read_session(cookies['session_id'],result=>{
        if (result.success){
            res.cookie('message', `/dashboard,alert,Welcome back ${result.username}`,{path: '/dashboard' ,expires : new Date(Date.now() + 15*1000)}); // expire in 15 sec
            res.redirect('/dashboard'); 
        }
        else{
            // send message login to continue
            res.cookie('message', '/login,alert,Login to continue',{path: '/login' ,expires : new Date(Date.now() + 15*1000)}); // expire in 15 sec
            res.redirect('/login');
        }
    });
})


app.get('/terms_and_conditions', (req, res) => {
    // user Dashboard
    res.status(200).sendFile(path.join(__dirname, 'views/terms_and_conditions.html'));
})

app.get('/confirm_username',(req,res)=>{
    // confirm user exist in the database
    confirm_username(req.query.username,result=>{
        res.send(result.success)
    })
})


// login
app.route('/login')
    .get((req, res) => {    
        // login in an account
        res.status(200).sendFile(path.join(__dirname, 'views/login.html'));
    })
    .post((req, res) => {
        // login in an account
        let username = req.body.username.trim(); 
        let password = req.body.password.trim();
        if (username && password){
            confirm_user(username,password,result =>{
                if (result.success){
                    // create session id for the user and save in the database
                    user_session = uuidv4()
                    save_session(username,user_session)
                    res.cookie('session_id', user_session, { expires: new Date(Date.now() + 604800*1000), httpOnly: true })// expire in seven days
                    // send message logout for new login 
                    res.cookie('message', '/dashboard,success,Login Successful',{path: '/dashboard' ,expires : new Date(Date.now() + 15*1000)}); // expire in 15 sec
                    res.redirect('/dashboard');
                } 
                else{
                    // send message wrong username or password
                    res.cookie('message', '/login,error,wrong Username or Password',{path: '/login' ,expires : new Date(Date.now() + 15*1000)}); // expire in 15 sec
                    res.redirect('/login');
                }
            })
        } else {
            // send message empty - username or password
            res.cookie('message', '/login,error,Username or Password should have values',{path: '/login' ,expires : new Date(Date.now() + 15*1000)}); // expire in 15 sec
            res.redirect('/login');
        }
    })

// sign-up
app.route('/signup')
    .get((req, res) => {
        // for create an account
        res.status(200).sendFile(path.join(__dirname, 'views/signup.html'));
    })
    .post((req, res) => {
        // save data in database
        confirm_username(req.body.username,result=>{
            if (!result.success){
                // redirect to login
                savedata({...req.body});
                // send message now login to continue
                res.cookie('message', `/login,success,Welcome '${req.body.username}' - Login to continue`,{path: '/login' ,expires : new Date(Date.now() + 15*1000)}); // expire in 15 sec
                res.redirect('/login');
            } else{
                res.cookie('message', '/signup,error,Username exist signup again',{path: '/signup' ,expires : new Date(Date.now() + 15*1000)}); // expire in 15 sec
                res.redirect('/signup');
            }
        })
    })


app.route('/dashboard')
    .get((req, res) => {
        // user Dashboard
        var cookies = JSON.parse(JSON.stringify(req.cookies));
        read_session(cookies['session_id'],result=>{
            if (result.success){
                res.status(200).sendFile(path.join(__dirname, 'views/dashboard.html'));
            }
            else {
                // send message session expire login to continue
                res.cookie('message', '/login,alert,Session expire Login again',{path: '/login' ,expires : new Date(Date.now() + 15*1000)}); // expire in 15 sec
                res.redirect('/login');
            }
        });
    })
    .post((req,res)=>{
        // save the updated data and redirect the page
        var cookies = JSON.parse(JSON.stringify(req.cookies));
        read_session(cookies['session_id'],result=>{
            if (result.success){
                update_profile_data({...req.body,username:result.username,lastUpdate:new Date()})
                // send message data updated successfully
                res.cookie('message', '/dashboard,success,Data updated Successfully',{path: '/dashboard' ,expires : new Date(Date.now() + 15*1000)}); // expire in 15 sec
                res.redirect('/dashboard')
            }
            else {
                // send message session expire login to continue
                res.cookie('message', '/login,alert,Session expire login again',{path: '/login' ,expires : new Date(Date.now() + 15*1000)}); // expire in 15 sec
                res.redirect('/login');
            }
        });
    })

// fetching route
app.get('/profile_data', (req, res) => {
    // update this route to the dashboard 
    var cookies = JSON.parse(JSON.stringify(req.cookies));
    read_session(cookies['session_id'],result=>{
        if (result.success){
            read_user(result.username,data=>{
                res.status(200).json(data.data);
            })
        } else {
            res.status(404).json()
        }
    });
})

app.get('/logout',(req,res)=>{
    delete_session(JSON.parse(JSON.stringify(req.cookies))['session_id'])
    res.clearCookie('session_id')
    // send message logout sucessfully, again login to continue
    res.cookie('message', '/login,success,Logout Sucessfully',{path: '/login' ,expires : new Date(Date.now() + 15*1000)}); // expire in 15 sec
    res.redirect('/login')
})


app.route('*')
    .get((req,res)=>{k
        res.status(404);
        res.send(
            `<h1>Page not found <a href="/">Go to the home page</a><h1> `);
    })
    .post((req,res)=>{
        res.status(404);
        res.send(
            `<h1>Page not found <a href="/">Go to the home page</a><h1> `);
    })
    
app.listen(port, () => {
  console.log(`web-app listening at http://localhost:${port}`)
});
