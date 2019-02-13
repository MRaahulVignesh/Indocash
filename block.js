const {GENESIS_DATA,MINE_RATE} = require('../config');
const cryptoHash = require('../Util/cryptoHash');
const hexToBinary = require('hex-to-binary');
class Block{

    constructor({ timestamp,data,lastHash,hash,nonce,difficulty }){
             this.timestamp = timestamp;
             this.data = data;
             this.hash = hash;
             this.lastHash = lastHash;
             this.nonce = nonce;
             this.difficulty = difficulty;
    }

    static genesis() {
      return new Block(GENESIS_DATA); 
  }

    static mineBlock({lastBlock,data}){
        const lastHash = lastBlock.hash;

        let nonce,timestamp,hash,difficulty;
        nonce=0;

        do{
            nonce++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty({previousBlock:lastBlock,timestamp});
            hash = cryptoHash(timestamp,lastHash,data,nonce,difficulty);
         }while(hexToBinary(hash).substring(0,difficulty)!=='0'.repeat(difficulty));

        return new Block({
            timestamp,
            lastHash,
            data,
            hash,
            nonce,
            difficulty
        });

    }

    static adjustDifficulty({previousBlock,timestamp})
    {
         const difference = timestamp - previousBlock.timestamp;
         const {difficulty} = previousBlock;
         if(difficulty < 1) return 1;
         if(difference>MINE_RATE)
          return difficulty-1;
          return difficulty+1;

    }
}

module.exports = Block;