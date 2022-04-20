'use strict';
const express = require('express');
const server = express();

const rateLimit = require('express-rate-limit');
const {decrypt} = require('./functions/dim-RSA.js');  //{encrypt, decrypt}
const {RequestToPushbullet} = require('./functions/pushbullet.js');

require('dotenv').config();                         //it needs that! 
const port = process.env.PORT || 80;
const antispam = process.env.ANTISPAM || "";
const environment = process.env.ENVIRONMENT || '';
const isDev = (environment=='Development');     //boolean


//Greek time
let presentTime = () => new Date().toLocaleString('el-GR',{hour12: false});



// Dim standard security  
server.use(require('./functions/security.js'));

// grab post/put variables and json objects
server.use(express.urlencoded({extended: false})); 
server.use(express.json());

// static root folder
server.use(express.static('public'));  

// Rate limiting
const limiter = rateLimit({
    windowMs: 2 * 60 * 60 * 1000, // 2 hours
    max: 3     // limit each IP to 3 requests per 2 hours
    // pass: 1 req every 40+ minutes
    // if antispam is not correct, it still counts as request!
});




/***********************           Routing          *************************/

// receive the message from user
server.route('/send')
    .post(limiter,(req,res)=>{
        if (req.body.antispam.trim().toLowerCase() != antispam) {
            res.status(401).send('Message not sent! Antispam is not correct!');
        } else {  
            let messageRecieved = req.body.message;
            let decrypted = decrypt(messageRecieved);
            let messageObject = {message:decrypted,time:presentTime()};
            console.log(messageObject);
            if (!isDev) {
                RequestToPushbullet(decrypted);
                console.log(`Message sent to pushbullet`);
            }
            res.status(202).redirect('/ok');        // redirect so user can't refresh!
        }
    })
    .get((req,res)=>res.status(405).send("405: Method GET not allowed"));       

// response ok
server.get('/ok',(req,res)=>{res.status(202).send("Your Message was sent successfully to Dimitris!")});


// send current public key to browser
server.get('/publicKey',function(req,res){
    res.send(process.env.PUBLIC_KEY);
});
    


// start server
server.listen(port, () => {
    console.log(`\x1b[35m ${environment} server is listening at \x1b[4m http://localhost:${port} \x1b[0m\x1b[35m. Started at: ${presentTime()} \x1b[0m`);
});