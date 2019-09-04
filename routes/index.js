var express = require('express');
var router = express.Router();
var path = require('path');
var User = require('../entity/user');
var Chat = require('../entity/chat');
var Message = require('../entity/message');
var chatConfig = require('../config/tsChat');

var userId = 1;
var users = [];
var chats = [];

var userResponses = [];
var newMessageResponses = [0, ''];
var newUserResp;

var serverPath = __dirname.split('\\').slice(0,-1).join('\\');

/** Get operator's dashbord page */
router.get('/operator', function(req, res, next) {
  res.sendFile(path.join(serverPath,'\\views\\dashbord.html'));
});

/** Get user start page */
router.get('/chat', function(req, res, next) {
  res.sendFile(path.join(serverPath,'\\views\\userStartPage.html'));
});

/** Get user chat page */
router.get('/getUserPage', function(req, res, next) {
  res.sendFile(path.join(serverPath,'\\views\\chat.html'));
});

/** Get new message from operator */
router.get('/subscribe', function(req, res, next) {
  userResponses[req.query.id - 1] = res;
});

/** Add new user */
router.post('/addUser',  function(req, res, next) {
  chats.push(new Chat(userId));
  //newMessages.push(new Chat(userId));
  let user = new User(userId, req.body.name);
  users.push(user);
  if (newUserResp){
    newUserResp.send(user);
    newUserResp = undefined;
  }
  let id = {id: userId++};
  res.send(id);
});

/** Send message to operator */
router.post('/sendMessage',  function(req, res, next) {
  let message = new Message(req.body.id, req.body.text, req.body.userName);
  chats[req.body.id - 1].messages.push(message);
  if(newMessageResponses[0] == req.body.id){
    newMessageResponses[0] = 0;
    newMessageResponses[1].send(message);
  }
  res.end();
});

/** Get all users */
router.get('/getAllUsers',  function(req, res, next) {
  res.send(users);
});

/** Get new users */
router.get('/getNewUsers',  function(req, res, next) {
  newUserResp = res;
});

/** Get active chat */
router.get('/getChat',  function(req, res, next) {
  if(newMessageResponses[0] !== 0){
    newMessageResponses[1].end();
  }
  res.send(chats[req.query.chatId - 1]);
});

/** Get new messages from user */
router.get('/getNewMessages',  function(req, res, next) {
    newMessageResponses[0] = req.query.chatId;
    newMessageResponses[1] = res;
});

/** Send message to user */
router.post('/sendMessageToUser',  function(req, res, next) {
  let message = new Message(req.body.id, req.body.text, chatConfig.botName);
  chats[req.body.id - 1].messages.push(message);
  userResponses[req.body.id - 1].send(message);
  userResponses[req.body.id - 1] = {};
  res.end();
});

/** Get user by id*/
router.get('/getUserById',  function(req, res, next) {
  let user = users[req.query.id - 1];
  console.log(users);
  res.send(user);
});

/** Get chat by id */
router.get('/getChatById',  function(req, res, next) {
  let chat = chats[req.query.id - 1];
  res.send(chat);
});

module.exports = router;
