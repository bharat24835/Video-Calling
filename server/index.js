const express = require('express');
const bodyParser = require('body-parser');
const{Server} =  require('socket.io');
const e = require('express');

const io = new Server(
    {cors: true}
);
const app = express();

// middlewares
app.use(bodyParser.json());

const emailToSocketMapping = new Map();
const socketToEmailMapping = new Map();


io.on('connection'  , (socket)=>{
           socket.on('join-room' , (data) =>{
            console.log("New Connection");
            const {roomId , emailId} = data;
            console.log("User" , emailId , "Joined Room" , roomId);
            emailToSocketMapping.set(emailId , socket.id)
            socketToEmailMapping.set(socket.id  , emailId);
            socket.join(roomId);
            socket.emit('joined-room' , {roomId})
            socket.broadcast.to(roomId).emit('user-joined' , {emailId});


           });


           socket.on('call-user'  ,(data)=>{
            const{emailId , offer} = data;
            const fromEmail  = socketToEmailMapping.get(socket.id); 

            // we want to send this offer to particular email id server
            const socketId = emailToSocketMapping.get(emailId);
            socket.to(socketId).emit('incoming-call' , {from : fromEmail , offer});
           })


           socket.on('call-accepted' , (data)=>{
            const{emailId , answer} = data;
            const socketId = emailToSocketMapping.get(emailId);

            socket.to(socketId).emit('call-accepted'   , {answer});
           })
});



app.listen(8000 , ()=>{
    console.log(`HTTP sever is running at port 8000`);
})
io.listen(8001);
