
/**
 * Represents an operator chat
 * @param name - bot name in configuration file
 * @constructor
 */
OperatorChat = function(name){
    this.operatorName = name;
    this.activeChatId = 0;
    this.firstOpenActiveBlock = true;
    this.userBlock = document.getElementById('users');
    this.activeBlock = document.getElementById('active-user');
    this.closeActiveBtn = document.getElementById('close-active-block-btn');
    this.sendMessageBtn = document.getElementById('send-message');
    this.chat = document.getElementById('chat');
    this.activeBlock.hidden = false;
};

/**
 * Create operator chat object
 * @param name - operator name
 */
OperatorChat.start = function(name){
    let operator = new OperatorChat(name);
    operator.launch();
};

/** Launch the operator chat app */
OperatorChat.prototype.launch = function(){
    let that = this;
    this.addAllUsers().then(function () {
        that.userBlock.addEventListener('click',function (event) {
            let target = event.target;
            if(target.tagName === 'P'){
                that.addUserListener( + target.id.slice(4));
            }
        });
        that.addNewUsers();
        that.setHeightOfBlocks();
    });
};

/** Set height of the all blocks on the page */
OperatorChat.prototype.setHeightOfBlocks = function(){
    var chatBlockHeight = document.getElementById('chat-fieldset').offsetHeight;
    document.getElementById('control-fieldset').style.minHeight = chatBlockHeight - 22 + 'px';
    this.activeBlock.style.minHeight = chatBlockHeight + 40 + 'px';
    document.getElementById('operator-main-fieldset').style.minHeight = chatBlockHeight + 90 + 'px';
    this.userBlock.style.minHeight = chatBlockHeight -37 + 'px';
    this.activeBlock.hidden = true;
};

/** Get list of users from the entity */
OperatorChat.prototype.addAllUsers = function(){
    let that = this;
    return fetch('/getAllUsers',{
        method: 'GET',
    }).then(function(res){
        return res.json();
    }).then(function (data) {
        that.drawUsersBlock(data);
    }).catch(function (e) {
        console.log('Cant load users')
    })
};

/**
 * Show list of user on the users block
 * @param users
 */
OperatorChat.prototype.drawUsersBlock = function(users){
    let that = this;
    users.forEach(function (user) {
        that.drawUser(user);
    })
};

/**
 * Generate element <p> 1 : User </p>
 * @param user
 */
OperatorChat.prototype.drawUser = function (user) {
    let userLink = document.createElement('p');
    userLink.id = 'user' + user.id;
    userLink.innerText = user.id + ': ' + user.name;
    this.userBlock.appendChild(userLink);
};

/** Add new users to the page*/
OperatorChat.prototype.addNewUsers = function(){
    let that = this;
    fetch('/getNewUsers',{
        method: 'GET',
    }).then(function(res){
        return res.json();
    }).then(function (data) {
        that.drawUser(data);
        that.addNewUsers();
    }).catch(function (e) {
        setTimeout(that.addNewUsers, 1000);
    })
};

/**
 * Add listeners for choose active chat
 * @param userId
 */
OperatorChat.prototype.addUserListener = function(userId){
    this.activeBlock.hidden = false;
    this.activeChatId = userId;
    this.chat.innerHTML = '';
    document.getElementById('active-legend').innerText = 'Active chat ' + userId;
    this.joinActiveBlock(userId);
};

/**
 * Generate and show active chat
 * @param id
 */
OperatorChat.prototype.joinActiveBlock = function(id){
    let that  = this;
    fetch('/getChat?chatId=' + id,{
        method: 'GET'
    }).then(function (res) {
        return res.json()
    }).then(function (chatContent) {
        that.addMessagesToActiveBlock(chatContent.messages);
        that.addActiveBlockListeners();

    });
};

/**
 * Show active chat
 * @param messages
 */
OperatorChat.prototype.addMessagesToActiveBlock = function(messages){
    let that = this;
    messages.forEach(function (item) {
        let date = new Date(item.date)
        let messageString = document.createElement('p');
        messageString.innerText =  '' + date.getHours() + ':' + date.getMinutes()
            + ' ' + item.senderName + ': ' + item.content;
        that.chat.appendChild(messageString);
    })
};

/** Add listeners of active block */
OperatorChat.prototype.addActiveBlockListeners = function(){
    let that = this;

    this.closeActiveBtn.addEventListener('click', function () {
        that.activeBlock.hidden = true;
        that.activeChatId = 0;
    });

    this.sendMessageBtn.addEventListener('click', function () {
        let text = document.getElementById('operator-message-text').value;
        document.getElementById('operator-message-text').value = '';
        let date = new Date()
        let messageString = document.createElement('p');
        messageString.innerText =  '' + date.getHours() + ':' + date.getMinutes()
            + that.operatorName + ' : ' + text;
        that.chat.appendChild(messageString);
        fetch("/sendMessageToUser",
            {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({id: that.activeChatId, botName: that.operatorName, text: text})
            });
    });

    if(this.firstOpenActiveBlock){
        this.getNewMessage();
        this.firstOpenActiveBlock = false;
    }
};

/** Get new messages from user */
OperatorChat.prototype.getNewMessage = function(){
    let that = this;
    if(this.activeChatId){
        fetch('/getNewMessages?chatId=' + this.activeChatId,{
            method: 'GET'
        }).then(function (res) {
            return res.json()
        }).then(function (message) {
            that.addMessagesToActiveBlock([message]);
            that.getNewMessage();
        }).catch(function () {
            setTimeout(function (){
                that.getNewMessage()
            }, 1000);
        });
    }
};

/** Get chat configuration and start main script */
window.addEventListener('load', function () {
    fetch("/config/getConfig",
        {
            method: "GET",
            headers: {"Content-Type": "application/json"}
        }).then(function(response) {
        return  response.json();
    }).then(function (configData) {
        OperatorChat.start(configData.botName);
    }).catch(function () {
        alert('Can not load config.json')
    });
});