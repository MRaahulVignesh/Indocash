const EC = require('elliptic').ec;
const cryptoHash = require('./cryptoHash');
const ec = new EC('secp256k1');
const verifySignature = ({publickey,data,signature})=>{

   const keyFromPair = ec.keyFromPublic(publickey,'hex');
   return keyFromPair.verify(cryptoHash(data),signature);
};
module.exports = {ec,verifySignature,cryptoHash};
