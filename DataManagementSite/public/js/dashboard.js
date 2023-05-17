show_server_message('message');
const data = getUserData();
paintPage(data);

var update_form_input = document.getElementById('update_form');
var username_input = document.getElementById('username');
var manage_input = document.getElementById('manage');
var gmail_input = document.getElementById('gmail');
var address_input = document.getElementById('address');
var icuBeds_input = document.getElementById('icuBeds');
var covBeds_input = document.getElementById('covBeds');
var vacBeds_input = document.getElementById('vacBeds');
var con1_input = document.getElementById('con1');
var con2_input = document.getElementById('con2');
var con3_input = document.getElementById('con3');
var location_input = document.getElementById('location');
var ambulance_input = document.getElementById('ambulance');

var totalBeds_input = document.getElementById('totalBeds');
var lastUpdate_input = document.getElementById('lastUpdate');

async function getUserData(){
    let response = await fetch("/profile_data");
    return await response.json();
}

function paintPage(response){
    response.then(data=>{
        // paint the page here
        username_input.innerText = data['username']
        updateHeight(username_input);
        manage_input.innerText = data['manage']
        updateHeight(manage_input);
        gmail_input.innerText = data['gmail']
        updateHeight(gmail_input);
        address_input.innerText = data['address']
        updateHeight(address_input);
        lastUpdate_input.innerText = data['lastUpdate']
        updateHeight(lastUpdate_input);

        icuBeds_input.value = data['icuBeds']
        covBeds_input.value = data['covBeds']
        vacBeds_input.value = data['vacBeds']
        con1_input.value = data['con1']
        con2_input.value = data['con2']
        con3_input.value = data['con3']
        location_input.value = data['location']
        ambulance_input.value = data['ambulance']
        totalBeds_input.value = data['totalBeds']
    })
}

function detectChanges(response,callback){
    response.then(data=>{
        if (icuBeds_input.value.trim() === data['icuBeds'] &&
            covBeds_input.value.trim() === data['covBeds'] &&
            vacBeds_input.value.trim() === data['vacBeds'] &&
            con1_input.value.trim() === data['con1'] &&
            con2_input.value.trim() === data['con2'] &&
            con3_input.value.trim() === data['con3'] &&
            location_input.value.trim() === data['location'] &&
            ambulance_input.value.trim() === data['ambulance'] &&
            lastUpdate_input.value.trim() === data['lastUpdate'] &&
            totalBeds_input.value.trim() === data['totalBeds']){
                if (icuBeds_input.value === data['icuBeds'] &&
                    covBeds_input.value === data['covBeds'] &&
                    vacBeds_input.value === data['vacBeds'] &&
                    con1_input.value === data['con1'] &&
                    con2_input.value === data['con2'] &&
                    con3_input.value === data['con3'] &&
                    location_input.value === data['location'] &&
                    ambulance_input.value === data['ambulance'] &&
                    lastUpdate_input.value === data['lastUpdate'] &&
                    totalBeds_input.value === data['totalBeds']){
                    callback({success : false,message : "Nothing updated - Update at least one field to save"})
                }else{
                    callback({success : false,message : "Blank spaces are not data"})
                }
        }
        else {
            callback({success:true,message:""})
        }
    })
} 

function updateHeight(element){
    element.style.height = 'auto';
    element.style.height = (element.scrollHeight) + 'px';
}

function update_total_beds(){
    totalBeds_input.value = parseInt(icuBeds_input.value ? icuBeds_input.value : 0 ) + parseInt(covBeds_input.value ?covBeds_input.value:0) +parseInt(vacBeds_input.value ? vacBeds_input.value : 0);
}
    
update_form_input.addEventListener('submit',event=>{
    event.preventDefault()            
    update_total_beds();
    detectChanges(data,res=>{
        // trim the data
        icuBeds_input.value = icuBeds_input.value.trim()
        covBeds_input.value = covBeds_input.value.trim()
        vacBeds_input.value = vacBeds_input.value.trim()
        con1_input.value = con1_input.value.trim()
        con2_input.value = con2_input.value.trim()
        con3_input.value = con3_input.value.trim()
        location_input.value = location_input.value.trim()
        ambulance_input.value = ambulance_input.value.trim()
        lastUpdate_input.value = lastUpdate_input.value.trim()
        totalBeds_input.value = totalBeds_input.value.trim()
        if (res.success){
            // make request 
            event.currentTarget.submit();
        } else {
            // show message that nothing change 
            createCookie({cookieName:"local_message",message:`/dashboard,error,${res.message}`,path:'/dashboard'})
            show_server_message('local_message');                    
        }
    });
})

