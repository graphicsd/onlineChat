

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/',function (req, res) {
   res.sendFile(__dirname+'/chat.html');
});


var users = {
    tany:{
        socket:null,
        online:false
    },
   madan:{
        socket:null,
        online:false
    },
    yangyj:{
        socket:null,
        online:false
    }
}

function getOnlineUsers(){
    var online = [], i;
    for(i in users){
        if(users[i].online === true){
            online.push(i);
        }
    }

    return online;
};

app.post('/login',function (req, res) {
    //console.log(req.body);
    if(req.body.username in users){
        res.json('true');
    } else {
        res.json('false');
    }
})

io.on('connection',function (socket) {

    socket.on('login',function (data) {
        //console.log(data.username);
            users[data.username].online = true;
            users[data.username].socket = socket;
            socket.emit('loginSuccess',{username:data.username,allusers:getOnlineUsers()});
            socket.broadcast.emit('enterChat',{username:data.username,allusers:getOnlineUsers()});
    });

    socket.on('disconnect',function(){
        var user;
        for (user in users){
            if(users[user].socket == socket){
                users[user].online = false;
                socket.broadcast.emit('leaveChat',{username:user,allusers:getOnlineUsers()});
                return;
            }
        }
    });


    socket.on('chat message',function (data) {
        io.emit('chat message',data);
    });

});


http.listen(8000,function () {
    console.log('listening on port:8000');
})