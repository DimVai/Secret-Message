'use strict';
const express = require('express');
const server = express();
require('dotenv').config();                         //it needs that! 
const fetch = require('node-fetch');                //jshint ignore:line   
const rateLimit = require('express-rate-limit');
const {decrypt} = require('./decrypt/dim-RSA.js');  //{encrypt, decrypt}

const port = process.env.PORT || 80;
const antispam = process.env.ANTISPAM;
const environment = process.env.ENVIRONMENT;
const isDev = (environment=='Development');     //boolean

//Greek time
let presentTime = () => new Date().toLocaleString('el-GR',{hour12: false});

//notify me with pushBullet
//converted cURL request (from PushBullet API - https://docs.pushbullet.com/#push) 
//to a Noje.js request using https://curlconverter.com/#node-fetch. Check notes.txt for more
let RequestToPushbullet = (messageBody) => {
        fetch('https://api.pushbullet.com/v2/pushes', {
        method: 'POST',
        headers: {
            'Access-Token': process.env.PUSHBULLET_API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"body":messageBody,"title":"Secret message","type":"note"})
    });
};

//Rate limiting
const limiter = rateLimit({
    windowMs: 2 * 60 * 60 * 1000, // 2 hours
    max: 3     // limit each IP to 3 requests per 2 hours
    //pass: 1 req every 40+ minutes
});

//to grab post/put variables and json objects
server.use(express.urlencoded({extended: false})); 
server.use(express.json());

//static root folder
server.use(express.static('public'));  

//get the message from user
server.post('/send',limiter,function(req,res){
    // console.log(req.body);
    if (req.body.antispam.trim().toLowerCase() != antispam) {
        res.status(401).send('Message not sent! Antispam is not correct');
    } else {  
        let messageRecieved = req.body.message;
        let decrypted = decrypt(messageRecieved);
        let messageObject = {message:decrypted,time:presentTime()};
        console.log(messageObject);
        if (!isDev) {RequestToPushbullet(decrypted)}
        res.status(202).send("Your Message was sent successfully to Dimitris");
    }
});

//send current public key to browser
server.get('/publicKey',function(req,res){
    res.send(process.env.PUBLIC_KEY);
});

server.listen(port, () => {
    console.log(`\x1b[35m ${environment} server is listening at \x1b[4m http://localhost:${port} \x1b[0m\x1b[35m. Started at: ${presentTime()} \x1b[0m`);
});