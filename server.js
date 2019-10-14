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

var intent = [
  {"q": "what your name", "a": "My name is Robot"},
  {"q": "alo", "a": "Hi, I'm Robot. Can I help you?"},
  {"q": "hey", "a": "Hi, I'm Robot. Can I help you?"},
  {"q": "hi", "a": "Hi, I'm Robot. Can I help you?"},
  {"q": "hello", "a": "Hi, I'm Robot. Can I help you?"},
  {"q": "how old are you", "a": "I'm fine. Thanks you!"},
  {"q": "how are you", "a": "I was born a few days ago :)"}
];

app.post('/webhook', function(req, res) { // Phần sử lý tin nhắn của người dùng gửi đến
  var entries = req.body.entry;
  for (var entry of entries) {
    var messaging = entry.messaging;
    for (var message of messaging) {
      var senderId = message.sender.id;
      if (message.message) {
        if (message.message.text) {
          var text = message.message.text;
          var ans = findIntent(text);
          sendMessage(senderId, ans);
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

function findIntent(s1){
  let maxMatchRate = 0;
  let maxIntent = "";
  intent.forEach(function(item){
    let rate = similarity(s1, item.q);
    if (rate>maxMatchRate){
      maxMatchRate = rate;
      maxIntent = item.a;
    }
  });
  if (maxMatchRate>=0.7){
    return maxIntent;
  }
  return "https://www.google.com/search?q="+s1;
}

function similarity(s1, s2) {
  var longer = s1;
  var shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  var longerLength = longer.length;
  if (longerLength == 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  var costs = new Array();
  for (var i = 0; i <= s1.length; i++) {
    var lastValue = i;
    for (var j = 0; j <= s2.length; j++) {
      if (i == 0)
        costs[j] = j;
      else {
        if (j > 0) {
          var newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue),
              costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0)
      costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

app.set('port', process.env.PORT || 5000);
app.set('ip', process.env.IP || "0.0.0.0");

server.listen(app.get('port'), app.get('ip'), function() {
  console.log("Chat bot server listening at %s:%d ", app.get('ip'), app.get('port'));
});