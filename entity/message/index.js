
function Message(chatId, text, sender) {
    this.chatId = chatId;
    this.content = text;
    this.senderName = sender;
    this.date = new Date();

}

module.exports = Message;