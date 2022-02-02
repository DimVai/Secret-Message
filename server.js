'use strict';
const express = require('express');
const server = express();
const helmet = require("helmet");
require('dotenv').config();                         //it needs that! 
const fetch = require('node-fetch');                //jshint ignore:line   
const rateLimit = require('express-rate-limit');
const {decrypt} = require('./decrypt/dim-RSA.js');  //{encrypt, decrypt}

const port = process.env.PORT || 80;
const antispam = process.env.ANTISPAM || "";
const environment = process.env.ENVIRONMENT || '';
const isDev = (environment=='Development');     //boolean
//Greek time
let presentTime = () => new Date().toLocaleString('el-GR',{hour12: false});

// use helmet security headers
server.use(
    helmet({
        contentSecurityPolicy:     
            {directives: 
                {
                    "script-src": [ "'self'","'unsafe-inline'","ajax.googleapis.com"],
                    "style-src": ["*","'unsafe-inline'"],
                    "script-src-attr": ["'none'"],  // prevent scripts in (image) attributes
                    "img-src": ["*"]
                },
            },
            referrerPolicy: {policy: "same-origin"},   // strict-origin-when-cross-origin (default) |  same-origin
            frameguard: {action: "deny"},           // X-Frame-Options
            // hsts: false,                            // enable on Firebase projects 
            // crossOriginEmbedderPolicy: false,       // everything on my page is CORS (crossorigin="anonymous")
      })
);

server.use(function(req, res, next) {
    res.header('Permissions-Policy', "camera=(),microphone=(),fullscreen=*");       // do not allow these
    res.header('Access-Control-Allow-Origin', "*");       // it is safe, unless you run it on an intranet 
    next();
});

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

// notify me with pushBullet. Check pushbullet notes.txt
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
            if (!isDev) {RequestToPushbullet(decrypted)}
            // res.status(202).send("Your Message was sent successfully to Dimitris!");
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