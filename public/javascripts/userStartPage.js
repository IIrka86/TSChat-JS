
/**
 * Get name of new user
 *
 * @param config - configuration of the chat
 * @returns {string} - Name of the user
 */
getUserName = function(config){
    let username = 'User';
    if(config.requireName){
        username = prompt('Enter your name please..', 'User');
    }
    return username;
};

/**
 * Send user info to entity and redirect to the user page
 */
sendUserInfo = function(username){
    fetch("/addUser",
        {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({name: username})
        }).then(function(res) {
        return res.json();
    }).then(function (userId) {
        location.replace("/getUserPage?id=" + userId.id)
    }).catch(function () {
        alert("Can not add user to entity")
    });
};

/**
 * Get chat configuration from entity
 */
window.addEventListener('load', function () {
    fetch("/config/getConfig",
        {
            method: "GET",
            headers: {"Content-Type": "application/json"}
        }).then(function(response) {
        return  response.json();
    }).then(function (configData) {
        sendUserInfo(getUserName(configData));
    }).catch(function () {
        alert('Can not load config.json')
    });
});
