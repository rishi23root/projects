var mysql = require('mysql');
require('dotenv').config()

// connect to the database
var user_DateCon = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

user_DateCon.connect(function(err) {
    if (err) throw err;
    console.log("Connected! --> userdata");
});
  
// functions to userdata use
function savedata({username,password,manage,gmail,address}){
    // save data in table
    var sql_query = `INSERT INTO ${process.env.USERDATA_TABLE} 
            VALUES ('${username}','${password}','${manage}','${gmail}','${address}','${new Date()}','${0}','${0}','${0}','${0}','${''}','${''}','${''}','${''}','${0}');`;
    user_DateCon.query(sql_query,(err,result)=>{
        if (err) throw err;
    })
}

function confirm_user(username,password,callback){
    // confirm user data in database
    var sql_query = `SELECT * FROM ${process.env.USERDATA_TABLE} WHERE username = '${username}' and password = '${password}'`;
    user_DateCon.query(sql_query,(err,result)=>{
        if (err) throw err;
        var result = JSON.parse(JSON.stringify(result));
        callback({'success': result.length ? true : false})
    })
}

function confirm_username(username,callback){
    // confirm user data in database
    var sql_query = `SELECT * FROM ${process.env.USERDATA_TABLE} WHERE username = '${username}';`;
    user_DateCon.query(sql_query,(err,result)=>{
        if (err) throw err;
        callback({'success': JSON.parse(JSON.stringify(result)).length ? true : false})
    })
}

function read_user(username,callback){
    var sql_query = `SELECT 
                username,manage,gmail,address,lastUpdate,
                icuBeds,covBeds,totalBeds,vacBeds,
                con1,con2,con3,
                location,ambulance FROM ${process.env.USERDATA_TABLE} WHERE username = '${username}'`;
    user_DateCon.query(sql_query,(err,result)=>{
        if (err) throw err;
        var result = JSON.parse(JSON.stringify(result));
        callback({'success': result.length ? true : false,'data':result.length ? result[0] : {}})
    })
}

function update_profile_data({username,
                              manage,gmail,
                              address,lastUpdate,
                              icuBeds,covBeds,
                              totalBeds,vacBeds,
                              con1,con2,con3,
                              location,ambulance}){
    // update the a user info on request 
    sql_query = `UPDATE ${process.env.USERDATA_TABLE} SET 
                    lastUpdate='${lastUpdate}',
                    icuBeds='${icuBeds}',
                    covBeds='${covBeds}',
                    totalBeds='${totalBeds}',
                    vacBeds='${vacBeds}',
                    con1='${con1}',
                    con2='${con2}',
                    con3='${con3}', 
                    location='${location}',
                    ambulance='${ambulance}'
                WHERE username='${username}' and manage='${manage}' and address='${address}' and gmail='${gmail}';`
    user_DateCon.query(sql_query,(err,result)=>{
        if (err) throw err;
    })
}

// session id database working here
function save_session(username,sessionid){
    // save a new session in database and update if already exists
    sql_query = `SELECT * FROM ${process.env.USERSESSION_TABLE} WHERE username='${username}';`
    user_DateCon.query(sql_query,(err,result)=>{
        if (err) throw err;
        var result = JSON.parse(JSON.stringify(result));
        if (result.length === 0){
            // user not exits create a new entry
            sql_query = `INSERT INTO  ${process.env.USERSESSION_TABLE} (username, session) VALUES ('${username}','${sessionid}');`
            user_DateCon.query(sql_query,(err,result)=>{
                if (err) throw err;
            })
        }
        else {
            // user exits update session
            sql_query = `UPDATE ${process.env.USERSESSION_TABLE} SET session = '${sessionid}' WHERE username='${username}';`
            user_DateCon.query(sql_query,(err,result)=>{
                if (err) throw err;
            })
        }
    })
}

function read_session(sessionid,callback){
    // read the user name from session id form the datebase
    var sql_query = `SELECT * FROM ${process.env.USERSESSION_TABLE} WHERE session = '${sessionid}'`;
    user_DateCon.query(sql_query,(err,result)=>{
        if (err) throw err;
        var result = JSON.parse(JSON.stringify(result));
        callback({success: result.length ? true:false ,username : result.length ? result[0]['username']:""});
    })
}

function delete_session(sessionid){
    var sql_query = `DELETE FROM ${process.env.USERSESSION_TABLE} WHERE session = '${sessionid}'`;
    user_DateCon.query(sql_query,(err,result)=>{
        if (err) throw err;
    })
}

module.exports = {
    // userdata functions
    savedata: savedata,
    confirm_user: confirm_user,
    confirm_username: confirm_username,
    update_profile_data: update_profile_data,
    read_user: read_user,
    // session funtions
    save_session: save_session,
    read_session: read_session,
    delete_session: delete_session
}