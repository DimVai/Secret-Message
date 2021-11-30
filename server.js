/* jshint strict:false*/
'use stict';

const express = require('express');
const server = express();
require('dotenv').config();          //it needs that! 
const {decrypt} = require('./decrypt/dim-RSA.js');  //{encrypt, decrypt}
const port = process.env.PORT || 80;
const antispam = process.env.ANTISPAM;

let presentTime = () => new Date().toLocaleString('el-GR',{hour12: false});

//to grab post/put variables and json objects
server.use(express.urlencoded({extended: false})); 
server.use(express.json());

//static root folder
server.use(express.static('public'));  

//get the message from user
server.post('/send.html',function (req, res){
    // console.log(req.body);
    if (req.body.antispam != antispam) {
        res.status(401).send('message not sent! Antispam is not correct');
    } else {  
        let messageRecieved = req.body.message;
        let decrypted = decrypt(messageRecieved);
        let messageObject = {message:decrypted,time:presentTime()};
        console.log(messageObject);
        res.status(202).send("Your Message was sent successfully to Dimitris");
    }
});


server.listen(port, () => {
    
    console.log(`Server is listening at http://localhost:${port}. Started at: ${presentTime()}`);
});