/**
 * @file dim-RSA.js.
 * @description Implements encrypt, decrypt in node.js
 * @author Dimitris Vainanidis,
 * @copyright Dimitris Vainanidis, 2021
 */

/* jshint strict:false*/
'use stict';

const crypto = require("crypto");
const path = require("path");
const fs = require('fs');

const privateKeyPath = path.resolve(__dirname,'./private.pem');
const publicKeyPath = path.resolve(__dirname,'./public.pem');
const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
const publicKey = fs.readFileSync(publicKeyPath, 'utf8');
// console.log(path.resolve(__dirname,'./private.pem'));
// console.log(privateKey);
// console.log(publicKey);

function encrypt(textToEncrypt) {
    const buffer = Buffer.from(textToEncrypt, 'utf8');
    const encrypted = crypto.publicEncrypt({ key: publicKey, padding: 
        crypto.constants.RSA_PKCS1_PADDING }, buffer);
    return encrypted.toString('base64');
  }



function decrypt(textToDecrypt) {
    const buffer = Buffer.from(textToDecrypt, 'base64');
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey.toString(),
        passphrase: '',
        padding:crypto.constants.RSA_PKCS1_PADDING
      },
      buffer,
    );
    return decrypted.toString('utf8');
  }

  //Just for testing 
  /*
  let enc = encrypt("Testing encryption and decryption by Dimitris... Success!");
  console.log(enc);
  let dec = decrypt(enc);
  console.log(dec);
  */

 module.exports = {encrypt,decrypt};

