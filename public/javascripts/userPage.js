/**
 * User chat constructor
 * @param id - chat id
 * @param config - chat configuration
 * @constructor
 */
UserChat = function(id, config){
    this.id = id;
    this.configurations = config;
};

/**
 * Get user by id from the entity
 * @param userId
 * @returns {Promise<any>}
 */
UserChat.getUser = function(userId){
    return  fetch("/getUserById?id=" + userId,
        {
            method: "GET",
            headers: {"Content-Type": "application/json"}
        }).then(function(response) {
        return  response.json();
    }).catch(function () {
        alert('Can not get user info')
    });
};

/**
 * Get chat by id from the entity
 * @param chatId
 * @returns {Promise<any>}
 */
UserChat.getChat = function(chatId){
    return  fetch("/getChatById?id=" + chatId,
        {
            method: "GET",
            headers: {"Content-Type": "application/json"}
        }).then(function(response) {
        return  response.json();
    }).catch(function () {
        alert('Can not get chat info')
    });
};

/**
 * Create user chat object
 * @param config
 */
UserChat.start = function(config){
    let id = location.href.slice(location.href.indexOf('=')+1);
    let userChat = new UserChat(id, config);
    UserChat.getUser(id).then(function (user) {
        userChat.user = user;
        UserChat.getChat(id).then(function (chat) {
            userChat.chat = chat;
            userChat.launch();
        });
    });
};

/** launch the user chat app */
UserChat.prototype.launch = function(){
    this.drawChatPage()
        .then(this.addListeners());
};

/**
 * Generate user chat page
 * @returns {Promise<unknown>}
 */
UserChat.prototype.drawChatPage = function(){

    let that = this;

    this.tsChat = document.createElement('div');
    this.tsChat.id = 'ts-chat';

    let fieldset = document.createElement('fieldset');
    fieldset.id = 'chat-content';
    let chatName = document.createElement('legend');
    chatName.innerText = this.configurations.title;
    fieldset.appendChild(chatName);

    this.rollUpBtn = document.createElement('button');
    this.rollUpBtn.id = 'roll-up';
    this.rollUpBtn.innerHTML = '-';
    if(!this.configurations.allowMinimize){
        this.rollUpBtn.disabled = true;
    }

    this.content = document.createElement('div');
    this.content.id = 'content';
    this.content.className = 'chat-content';

    this.messagesBlock = document.createElement('div');
    this.messagesBlock.id = 'messages';
    this.messagesBlock.className = 'messages-content';
    this.chat.messages.forEach(function (message) {
        that.addMessage(' ' + that.user.name + ': ' + message.content, new Date(message.date));
    });

    let form = document.createElement('div');
    this.messageTextArea = document.createElement('textarea');
    this.messageTextArea.id = 'message-text';
    this.messageTextArea.rows = 3;
    form.appendChild(this.messageTextArea);

    this.sendMessageBtn = document.createElement('button');
    this.sendMessageBtn.id = 'send-btn';
    this.sendMessageBtn.innerText = 'Send';
    form.appendChild(this.sendMessageBtn);

    //Add elements to the page
    this.content.appendChild(this.messagesBlock);
    this.content.appendChild(form);
    fieldset.appendChild(this.rollUpBtn);
    fieldset.appendChild(this.content);
    this.tsChat.appendChild(fieldset);
    document.body.appendChild(this.tsChat);

    return new Promise(function (resolve) {
        resolve();
    });
};

/** Add listeners to chat elements */
UserChat.prototype.addListeners = function(){

    let that = this;
    this.setChatSide();
    this.subscribe();

    this.tsChat.addEventListener('mousedown', function (e) {
        if(that.configurations.allowDrag){
            that.moveChatBlock(that.tsChat, e);
        }
    });

    this.tsChat.addEventListener('mouseup', function () {
        document.onmousemove = null;
    });

    this.rollUpBtn.addEventListener('click', function () {
        that.minimizeChatBlock();
    });

    this.sendMessageBtn.addEventListener('click', function () {
        that.sendMessage();
    });
};

/** Put chat block on the right side */
UserChat.prototype.setChatSide = function(){

    let chat = this.tsChat;
    chat.style.top = this.getElementMarginTop(chat) + 'px';
    chat.style.left = this.getElementMarginLeft(chat, this.configurations.position) + 'px';
};

/**
 * Find element margin top
 * @param element
 * @returns {number}
 */
UserChat.prototype.getElementMarginTop = function(element){
    return window.innerHeight - element.offsetHeight -30;
};

/**
 * Find element margin left
 * @param element
 * @param position
 * @returns {number}
 */
UserChat.prototype.getElementMarginLeft = function(element, position){
    if(position === 'right'){
        return window.innerWidth - element.offsetWidth -20;
    }else{
        return 20;
    }
};

/**
 *  Add message to the messages block
 * @param message
 * @param date
 */
UserChat.prototype.addMessage = function(message, date){
    let messageString = document.createElement('p');
    if(this.configurations.showDateTime){
        messageString.innerText = '' + date.getHours() + ':' + date.getMinutes() + message;
    }else{
        messageString.innerText = '' + message;
    }
    this.messagesBlock.appendChild(messageString);
};
/**
 * Moving chat block on the screen
 * @param chat - div element, which contain chat block
 * @param e - event
 */
UserChat.prototype.moveChatBlock = function(chat, e){
    let left = parseInt( window.getComputedStyle(chat).getPropertyValue("left") );
    let top = parseInt( window.getComputedStyle(chat).getPropertyValue("top") );
    let mouseX = e.clientX;
    let mouseY = e.clientY;

    document.onmousemove = function (e) {
        let dx = mouseX - e.clientX;
        let dy = mouseY - e.clientY;
        chat.style.left = left - dx + "px";
        chat.style.top = top - dy + "px";
    };
};

/** Minimize chat block */
UserChat.prototype.minimizeChatBlock = function(){
    if(this.content.getAttribute('hidden') === ''){
        this.content.removeAttribute('hidden');
        this.rollUpBtn.innerHTML = ' - ';
    }else{
        this.content.setAttribute('hidden','');
        this.rollUpBtn.innerHTML = '[ ]';
    }
    this.setChatSide();
};

/** Send message to the operator */
UserChat.prototype.sendMessage = function(){
    let text = this.messageTextArea.value;
    this.messageTextArea.value = '';
    this.addMessage(' ' + this.user.name + ': ' + text, new Date());
    let message = {
        id: this.user.id,
        userName: this.user.name,
        text: text
    };
    fetch("/sendMessage",
        {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(message)
        });
};

/** Get messages from operator */
UserChat.prototype.subscribe = function() {
    let that = this;
    fetch("/subscribe?id=" + that.user.id,
        {
            method: "GET"
        }).then(function (res) {
        return res.json();
    }).then(function (message) {
        that.addMessage(' ' + that.configurations.botName + ': ' + message.content, new Date(message.date));
        that.subscribe();
    }).catch(function () {
        setTimeout(function () {
            that.subscribe();
        }, 1000);
    });
};

/** Get chat configuration and start main scrip */
window.addEventListener('load', function () {
    fetch("/config/getConfig",
        {
            method: "GET",
            headers: {"Content-Type": "application/json"}
        }).then(function(response) {
        return  response.json();
    }).then(function (configData) {
        UserChat.start(configData);
    }).catch(function () {
        alert('Can not load config.json')
    });
});
