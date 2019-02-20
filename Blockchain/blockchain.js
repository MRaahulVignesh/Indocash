 const Block = require('./block');
 const Wallet = require('../Wallet/index');
 const Transaction = require('../Wallet/transcation');
 const cryptoHash = require('../Util/cryptoHash');
 const {MINER_TRANSACTION_INPUT,MINER_REWARD} = require('../config');
 class Blockchain{
     constructor(){
         this.chain =[Block.genesis()];
     }
    
     addBlock({data}){
         const NewBlock = Block.mineBlock({lastBlock: this.chain[this.chain.length-1],data});
         this.chain.push(NewBlock);
     }

     

     static isValidChain(chain)
     {
        if(JSON.stringify(chain[0])!==JSON.stringify(Block.genesis())) 
        return false;

        for(let i=1;i<chain.length;i++)
        {
            const{timestamp,data,lastHash,hash,nonce,difficulty} = chain[i];

            const actualLastHash = chain[i-1].hash;
            const previousDifficulty = chain[i-1].difficulty;
            if(actualLastHash !==chain[i].lastHash)
            return false;

            const validatedHash = cryptoHash(timestamp,data,lastHash,nonce,difficulty);
            if(validatedHash !==chain[i].hash)
            return false;
            if(Math.abs(previousDifficulty-difficulty)>1) return false;
        }
       
       return true;
     }

     replaceChain(newChain,validateTransactions,onSuccess){
        
         if(newChain.length <= this.chain.length)
         {
            console.error('The incoming chain is not longer');
            return ;
         }

         if(!Blockchain.isValidChain(newChain))
         {
            console.error('The incoming chain is not Vaild'); 
            return ;
         }

         if(validateTransactions && !this.validTransactionData({chain:newChain}))
         {
            console.error('The Transaction data is not valid'); 
            return;
         }

         if(onSuccess)
         onSuccess();
         console.log('The incoming chain replaces the old chain');
         this.chain = newChain;
     }

     validTransactionData({chain})
     {
        for(let i=1;i<chain.length;i++)
        {
            const block = chain[i];
            const transactionSet = new Set();
            let rewardTransactionCount=0;
            for(let transaction of block.data)
            {
                if(transaction.input.address === MINER_TRANSACTION_INPUT.address){
                rewardTransactionCount++;

                if(rewardTransactionCount>1)
                {
                    console.error('Miner reward exceed limit');
                    return false;
                }

                if (Object.values(transaction.outputMap)[0] !== MINER_REWARD) {
                    console.error('Miner reward amount is invalid');
                    return false;
                  }
                }
                else 
                {
                if(!Transaction.validTranscation(transaction))
                {
                    console.error('Invalid Transaction');
                    return false;
                }

                 const originalBalance = Wallet.calculateBalance(
                    {chain: this.chain,
                     address: transaction.input.address
                    });
                    if(originalBalance !== transaction.input.amount)
                    {
                        console.error('Invalid input amount');
                        return false;
                    }
                }


                if(transactionSet.has(transaction))
                {
                    console.error('Duplicate transactions present');
                    return false;
                }
                else
                {
                    transactionSet.add(transaction);
                }
             
            }
        }
        return true;
     }
    }

 module.exports = Blockchain;
