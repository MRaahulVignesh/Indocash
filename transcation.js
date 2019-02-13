const uuid = require('uuid/v1');
const {verifySignature} = require('../util');
const Wallet = require('./index');
const {MINER_REWARD, MINER_TRANSACTION_INPUT} = require('../config');

class Transcation{
  
    constructor({senderWallet,amount,recipient,input,outputMap})
  {
    this.id= uuid();
    this.outputMap = outputMap ||  this.createMap({senderWallet,amount,recipient});
    this.input = input || this.createInput({senderWallet,outputMap:this.outputMap});
  }
  createMap({senderWallet,amount,recipient})
  {
      const outputmap = {};
      outputmap[recipient] = amount;
      outputmap[senderWallet.publickey] = senderWallet.balance-amount;
      return outputmap;
  }
  createInput({senderWallet,outputMap})
  {
      return {
          timestamp : Date.now(),
          address : senderWallet.publickey,
          amount: senderWallet.balance,
          signature: senderWallet.sign(outputMap)
      };
  }
  
    static validTranscation(transcation)
    {
        const{ input:{address,amount,signature},outputMap} = transcation;
        const totalAmount =  Object.values(outputMap).reduce((total,amount)=>total+amount);
        if(totalAmount!==amount)
        {
            console.error(`invalid transcation from ${address}`);
            return false;
        }

        if(!verifySignature({publickey:address,data:outputMap,signature:signature}))
        {
            console.error(`invalid transcation from ${address}`);
            return false;
        }
        return true;
    }

    update({senderWallet,amount,recipient})
    {
        if(amount>senderWallet.balance)
        {
            throw new Error('Amount exceeds balance');
            }

        if(!this.outputMap[recipient])
          this.outputMap[recipient] = amount;
        else
           this.outputMap[recipient] =this.outputMap[recipient] + amount;
        this.outputMap[senderWallet.publickey] = 
        this.outputMap[senderWallet.publickey] - amount;
        this.input = this.createInput({senderWallet,outputMap:this.outputMap});
    }

    
    static rewardTransaction(minerWallet) {
        
       const {publickey} = minerWallet;
       return new this({
          input: MINER_TRANSACTION_INPUT,
          outputMap: { [publickey]: MINER_REWARD }
        });
         
      }

    
  }

module.exports = Transcation;