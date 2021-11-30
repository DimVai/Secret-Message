/* jshint strict:false*/
'use stict';

const express = require('express');
const server = express();
require('dotenv').config();          //it needs that! 
const {decrypt} = require('./decrypt/dim-RSA.js');  //{encrypt, decrypt}
const port = process.env.PORT || 80;
const antispam = process.env.ANTISPAM;
const fetch = require('node-fetch');   //jshint ignore:line     


let presentTime = () => new Date().toLocaleString('el-GR',{hour12: false});
/* //this is what we got from PushBullet API
let curlString = `curl --header 'Access-Token: ${proccess.env.PUSHBULLET_API_KEY}' \
--header 'Content-Type: application/json' \
--data-binary '{"body":"You have a new Secret Message","title":"Secret","type":"note"}' \
--request POST \
https://api.pushbullet.com/v2/pushes`;
*/
//converted cURL request (from PushBullet API - https://docs.pushbullet.com/#push) 
//to a Noje.js request using https://curlconverter.com/#node-fetch
let RequestToPushbullet = () => {
        fetch('https://api.pushbullet.com/v2/pushes', {
        method: 'POST',
        headers: {
            'Access-Token': process.env.PUSHBULLET_API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"body":"You have a new Secret Message","title":"Secret","type":"note"})
    });
};

//to grab post/put variables and json objects
server.use(express.urlencoded({extended: false})); 
server.use(express.json());

//static root folder
server.use(express.static('public'));  

//get the message from user
server.post('/send.html',function (req, res){
    // console.log(req.body);
    if (req.body.antispam.trim().toLowerCase() != antispam) {
        res.status(401).send('Message not sent! Antispam is not correct');
    } else {  
        let messageRecieved = req.body.message;
        let decrypted = decrypt(messageRecieved);
        let messageObject = {message:decrypted,time:presentTime()};
        console.log(messageObject);
        RequestToPushbullet();
        res.status(202).send("Your Message was sent successfully to Dimitris");
    }
});

server.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}. Started at: ${presentTime()}`);
});