/**
 * Constructor for chat configurations
 * @param config - chat configuration
 * @constructor
 */
ChatConfiguration = function(config){
    this.configurations = config;
};

/**
 * Create chat configuration object
 * @param config
 */
ChatConfiguration.start = function(config){
    let chatConfig = new ChatConfiguration(config);
    chatConfig.launch();
};

/**Launch the chat configuration page scripts*/
ChatConfiguration.prototype.launch = function(){
    this.showPage();
    this.addListeners();
};

/**Add configuration to page*/
ChatConfiguration.prototype.showPage = function(){
    document.getElementById('title').value = this.configurations.title;
    document.getElementById('botName').value = this.configurations.botName;
    document.getElementById('chatUrl').value = this.configurations.chatUrl;
    document.getElementById('cssClass').value = this.configurations.cssClass;
    document.getElementById('allowMinimize').checked = this.configurations.allowMinimize;
    document.getElementById('allowDrag').checked = this.configurations.allowDrag;
    document.getElementById('requireName').checked = this.configurations.requireName;
    document.getElementById('showDateTime').checked = this.configurations.showDateTime;
    document.getElementById(this.configurations.request).checked = true;
    document.getElementById(this.configurations.position).selected = true;
    this.code = document.getElementById('code-block');
    this.code.innerHTML = this.getCode();
};

/**
 * Get the code of chat configuration object
 * @returns {string}
 */
ChatConfiguration.prototype.getCode = function(){
    return '<p>&lt script &gt</p>' +
        '<p>(function(){</p>' +
        '<p class="tab">new tsChat({</p>' +
        '<p class="double-tab">title: \'' + this.configurations.title + '\',</p>' +
        '<p class="double-tab">botName: \'' + this.configurations.botName + '\',</p>' +
        '<p class="double-tab">chatUrl: \'' + this.configurations.chatUrl + '\',</p>' +
        '<p class="double-tab">cssClass: \'' + this.configurations.cssClass + '\',</p>' +
        '<p class="double-tab">position: \'' + this.configurations.position + '\',</p>' +
        '<p class="double-tab">allowMinimize: ' + this.configurations.allowMinimize + ',</p>' +
        '<p class="double-tab">allowDrag: ' + this.configurations.allowDrag + ',</p>' +
        '<p class="double-tab">showDateTime: ' + this.configurations.showDateTime + ',</p>' +
        '<p class="double-tab">requireName: ' + this.configurations.requireName + ',</p>' +
        '<p class="double-tab">request: \'' + this.configurations.request + '\',</p>' +
        '<p class="tab">});</p>' +
        '<p>})();</p>' +
        '<p>&lt script &gt</p>';
};

/** Add listeners to configuration page element */
ChatConfiguration.prototype.addListeners = function(){
    let that = this;
    let mainForm = document.getElementById('config-form');
    mainForm.addEventListener('change',function (event) {
        let target = event.target;
        if(target.tagName === 'INPUT' && that.addListenerForInput(target)){
            that.setConfigChanges();
        }else if(target.tagName === 'SELECT'){
            that.addListenerForSelect(target);
        }
    })
};

/**
 * Listener for all Input element on the page
 * @param target - input element
 * @returns {boolean} - return true if configuration was changed
 */
ChatConfiguration.prototype.addListenerForInput = function(target){
    if(target.type === 'text'){
        this.configurations[target.id] = target.value;
        return true;
    }else if(target.type === 'checkbox'){
        this.configurations[target.id] = target.checked;
        return  true;
    }else if(target.type === 'radio'){
        this.configurations[target.name] = target.id;
        return true;
    }else{
        return false;
    }
};

/**
 * Listener for Select element
 * @param select - select element
 */
ChatConfiguration.prototype.addListenerForSelect = function(select){
    this.configurations[select.id] = select.options[select.selectedIndex].value;
    this.setConfigChanges();
};

/** Send configuration changes to the entity */
ChatConfiguration.prototype.setConfigChanges = function(){
        this.code.innerHTML = this.getCode();
        fetch("/config/setConfig",
            {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(this.configurations)
            });
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
        ChatConfiguration.start(configData);
    }).catch(function () {
        alert('Can not load config.json')
    });
});