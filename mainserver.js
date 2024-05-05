import express from 'express';
import mongoose, { connect } from 'mongoose';
import bodyParser from 'body-parser';
import appContent from './messagesDb.js';
import Pusher from 'pusher';
import cors from 'cors'

// подключение express
// const express = require("express");
// создаем объект приложения
const app = express();
// app.use(express.static("public"))
app.use(express.json())

// app.use(bodyParser.json())
app.use(cors({
    origin: 'http://localhost:3000' 
}));

const pusher = new Pusher({
    appId: "1794109",
    key: "5b59b479cbbe75e50159",
    secret: "2fa97cce2ba447aa3afa",
    cluster: "ap2",
    useTLS: true
  });
  

// подключение DB
const connection = "mongodb+srv://user:jCHShsqGpsUGObz2@whatsapp.tgy3je9.mongodb.net/?retryWrites=true&w=majority&appName=Whatsapp";
mongoose.connect( connection, {
    useNewUrlParser:true,
    useUnifiedTopology:true
})
const db = mongoose.connection;
db.once("open", ()=>{
    console.log("DB connected")

    const messageCollection = db.collection("appcontents");
    const changeStream = messageCollection.watch();

    changeStream.on('change', (change) =>{
        console.log(change);

        if(change.operationType === "insert") {
            const messageDetails = change.fullDocument;
            pusher.trigger("messenger-app", "inserted", {
                name: messageDetails.name,
                message: messageDetails.message,
                time: messageDetails.time,
                received: messageDetails.received,
            })
        } else {
            console.log("Error triggering Pusher")
        }
    })
})


// определяем обработчик для маршрута "/"
app.get("/", function(req, res){
    // отправляем ответ
    res.send("<h2>Привет Express!</h2>");
});

app.get('/messages/sync', async (req, res) => {
    try {
        const messages = await appContent.find();
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching messages' });
    }
});

app.post('/messages', async (req, res) => {
    const { message, name, time, received } = req.body;

    try {
        const newMessage = new appContent({ message, name, time, received });
        await newMessage.save();
        res.status(201).json({ message: 'Message saved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error saving message' });
    }
});


// app.post('/api/messages', (request, response) => {
    
//     const dbMessage = request.body;


//     messages.create(dbMessage, (err, data) =>{
//         if(err){
//             response.status(500).send(err);
//         } else{
//             response.status(201).send(data);
//         }
//     })
    // const chatMessage = request.body.message;
    // const chatName   = request.body.name;
    // const chatTime = request.body.time
    // const message = {   message: chatMessage, name: chatName, time: chatTime};

    // if(!dbMessage) { return response.sendStatus(400)}
    // const collection = request.app.locals.collection;
    // try{
    //     await collection.insertOne(message);
    //     response.send(message);
    // }
    // catch (err){
    //     console.log(err);
    //     response.sendStatus(500);
    // }
// })

// начинаем прослушивать подключения на 3001 порту
app.listen(3001);