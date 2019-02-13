const Transcation = require('./Transcation');
const { STARTING_BALANCE } = require('../config');
const  {ec,cryptoHash} = require('../util');


class Wallet {
  constructor() {
    this.balance = STARTING_BALANCE;
    this.keyPair = ec.genKeyPair();
    this.publickey = this.keyPair.getPublic().encode('hex');
     }

     sign(data){
       return this.keyPair.sign(cryptoHash(data));
    }

    createTranscation({recipient, amount,chain}) {
      
      if(chain)
      {
      this.balance = Wallet.calculateBalance(
        {chain,
         address:this.publickey
        });
      }
      
      if (amount > this.balance) {
        throw new Error('amount exceeds balance');
      }

      
  
      let transcation = new Transcation({ senderWallet: this, recipient, amount }); 
              return transcation;
    }

    static calculateBalance({chain,address})
    {
      let hasConductedTransaction = false;
      let outputTotals = 0;
      for(let i=chain.length-1;i>0;i--)
      {
        const block = chain[i];

        for(let transcation of block.data)
        {
          if(transcation.input.address === address)
          hasConductedTransaction = true;
          const temp = transcation.outputMap[address];
          if(temp)
          outputTotals = outputTotals + temp;
         
        }

        if(hasConductedTransaction)
        break;
      }
      return hasConductedTransaction?outputTotals:STARTING_BALANCE+outputTotals;
    }

   
}

module.exports = Wallet;