const APP_SECRET = '85f7c0dc3ce2ef2fbbddaf153dda08bf';
const VALIDATION_TOKEN = 'TungHuynhToken';
const PAGE_ACCESS_TOKEN = 'EAADLFjjtKsMBACKHhBS5zP8gyzRUCZAaH5vHs3JY1vOnZAJUutXI8RheKeanp2bfKiAugZCIQbZBr7z9RoxMUReLuOMXTZBvi6mrXBb077jAWXNUsLQ4Uau1veDgHbL9vfwq5WefdOfuzYamT2yUZB2m5ckdMZAlA2JEx72FEBjqb6EA6TJZBruuA17A3VFVBuYZD';

var http = require('http');
var bodyParser = require('body-parser');
var express = require('express');

var app = express();
app.use(bodyParser.json());
var server = http.createServer(app);
var request = require("request");

app.get('/', (req, res) => {
  res.send("Home page. Server running okay.");
});

app.get('/webhook', function(req, res) { // Đây là path để validate tooken bên app facebook gửi qua
  //if (req.query['hub.verify_token'] === VALIDATION_TOKEN) {
    res.send(req.query['hub.challenge']);
 // }
 // res.send('Error, wrong validation token');
});

app.post('/webhook', function(req, res) { // Phần sử lý tin nhắn của người dùng gửi đến
console.log("=============================RECEIVE=============================");

  var entries = req.body.entry;
  console.log(entries);
  for (var entry of entries) {
    var messaging = entry.messaging;
    for (var message of messaging) {
      var senderId = message.sender.id;
      if (message.message) {
        if (message.message.text) {
          var text = message.message.text;
          sendMessage(senderId, "Hello!! I'm a bot. Your message: " + text);
        }
      }
    }
  }
  res.status(200).send("OK");
});

// Đây là function dùng api của facebook để gửi tin nhắn
function sendMessage(senderId, message) {
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {
      access_token: PAGE_ACCESS_TOKEN,
    },
    method: 'POST',
    json: {
      recipient: {
        id: senderId
      },
      message: {
        text: message
      },
    }
  });
}

app.set('port', process.env.PORT || 5000);
app.set('ip', process.env.IP || "0.0.0.0");

server.listen(app.get('port'), app.get('ip'), function() {
  console.log("Chat bot server listening at %s:%d ", app.get('ip'), app.get('port'));
});