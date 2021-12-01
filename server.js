/* jshint strict:false*/
'use stict';

const express = require('express');
const server = express();
require('dotenv').config();          //it needs that! 
const fetch = require('node-fetch');   //jshint ignore:line     
const {decrypt} = require('./decrypt/dim-RSA.js');  //{encrypt, decrypt}

const port = process.env.PORT || 80;
const antispam = process.env.ANTISPAM;
const isDev = (process.env.ENVIRONMENT=='development'); 
const environment = isDev ? "Development" : "Production";
// console.log(process.env.PUBLIC_KEY);
// console.log(process.env.PRIVATE_KEY);

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
        if (!isDev) {RequestToPushbullet(decrypted)}
        res.status(202).send("Your Message was sent successfully to Dimitris");
    }
});

server.listen(port, () => {
    console.log(`\x1b[35m ${environment} server is listening at \x1b[4mhttp://localhost:${port}\x1b[0m\x1b[35m. Started at: ${presentTime()} \x1b[0m`);
});