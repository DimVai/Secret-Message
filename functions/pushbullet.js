'use strict';
require('dotenv').config();
const fetch = require('node-fetch');                //jshint ignore:line   



/*

    this is what we got from PushBullet API (curl request)

    let curlString = `curl --header 'Access-Token: ${proccess.env.PUSHBULLET_API_KEY}' \
    --header 'Content-Type: application/json' \
    --data-binary '{"body":"You have a new Secret Message","title":"Secret","type":"note"}' \
    --request POST \
    https://api.pushbullet.com/v2/pushes`; 

    converted cURL request (from PushBullet API - https://docs.pushbullet.com/#push) 
    to a "Node.js" request using https://curlconverter.com/#node-fetch

*/



// notify me with pushBullet. Check pushbullet notes.txt
exports.RequestToPushbullet = (messageBody) => {
    fetch('https://api.pushbullet.com/v2/pushes', {
        method: 'POST',
        headers: {
            'Access-Token': process.env.PUSHBULLET_API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"body":messageBody,"title":"Secret message","type":"note"})
    });
};