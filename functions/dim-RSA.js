/**
 * @file dim-RSA.js.
 * @description Implements encrypt, decrypt in node.js
 * @author Dimitris Vainanidis,
 * @copyright Dimitris Vainanidis, 2021
 */

'use strict';

require('dotenv').config();   //or else, this command will be required to run before this file (in server.js)
const crypto = require("crypto");
const privateKey = process.env.PRIVATE_KEY;
const publicKey = process.env.PUBLIC_KEY;

function encrypt(textToEncrypt) {
    const buffer = Buffer.from(textToEncrypt, 'utf8');
    const encrypted = crypto.publicEncrypt(
        { 
            key: publicKey, 
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256"
        }, 
        buffer
    );
    return encrypted.toString('base64');
}

function decrypt(textToDecrypt) {
    const buffer = Buffer.from(textToDecrypt, 'base64');
    const decrypted = crypto.privateDecrypt(
        {
            key: privateKey.toString(),
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: "sha256"
        },
        buffer
    );
    return decrypted.toString('utf8');
}

function testCryptoAlgorithms(){
    //testing algorithms 
    let encryptionTestingString = "Cryptography algorithms have been tested and they are working properly!";
    let enc = "something";
    let dec = "something different";
    try{
        enc = encrypt(encryptionTestingString);
        dec = decrypt(enc);
    }catch(e){
        console.error(e);
    }
    if (encryptionTestingString==dec){
        console.log("\x1b[32m", encryptionTestingString,'\x1b[0m');  
        return true;
    } else {
        console.error("\x1b[31m Cryptography algorithms are not working properly \x1b[0m"); 
        return false;       
    }
}

module.exports = {encrypt,decrypt,testCryptoAlgorithms};

