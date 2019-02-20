const Block = require('./block');
const {GENESIS_DATA,MINE_RATE} = require('../config');
const cryptoHash = require('../Util/cryptoHash');
const hexToBinary = require('hex-to-binary');

describe('Block',()=>{

    const timestamp = 2000;
    const lastHash = 'foo-lastHash';
    const hash = 'foo-hash';
    const data = 'Data';
    const nonce ='0';
    const difficulty = 1;
    const block = new Block({timestamp,lastHash,hash,data,nonce,difficulty});

    it('has a timestamp,lastHash,hash,nonce,difficulty and data property',()=>{
     expect(block.timestamp).toEqual(timestamp);
     expect(block.lastHash).toEqual(lastHash);
     expect(block.hash).toEqual(hash);
     expect(block.data).toEqual(data);
     expect(block.nonce).toEqual(nonce);
     expect(block.difficulty).toEqual(difficulty);
    });

    describe('genesis()',()=>{
        const genesisBlock = Block.genesis();

        it('returns a block instance',()=>{
         expect(genesisBlock instanceof Block).toBe(true);
        });

        it('returns the genesis data',()=>{
         expect(genesisBlock).toEqual(GENESIS_DATA);
        });
    });

    describe('mineBlock()',()=>{
         const lastBlock = Block.genesis();
         const data ='Mined data';
         const MinedBlock = Block.mineBlock({lastBlock,data});

         it('returns a block instance',()=>{
            expect(MinedBlock instanceof Block).toBe(true);
           });
         it('sets the `lastHash` to be the `hash` of the last block',()=>{
            expect(MinedBlock.lastHash).toEqual(lastBlock.hash);
         }); 
         it('sets the `timestamp`',()=>{
             expect(MinedBlock.timestamp).not.toEqual(undefined);
         });
         it('sets the `data`',()=>{
             expect(MinedBlock.data).toEqual(data);
         });
         it('adjusts the `difficulty` of the Mined Block',()=>{
            const ranges = [lastBlock.difficulty+1,lastBlock.difficulty-1];
            expect(ranges.includes(MinedBlock.difficulty)).toBe(true);
         });
        
         it('sets the `hash` to the SHA 256 hashed output of the input arguements',()=>{
             expect(MinedBlock.hash).toEqual
             (
                 cryptoHash(
                     MinedBlock.timestamp,
                     lastBlock.hash,
                     data,
                     MinedBlock.nonce,
                     MinedBlock.difficulty
                     )
                );
         });

         it('sets the the hash with the defined difficulty',()=>{
             expect(hexToBinary(MinedBlock.hash).substring(0,MinedBlock.difficulty)).toEqual('0'.repeat(MinedBlock.difficulty));
         });
    });

    describe('adjustDifficulty()',()=>{
       it('has to increase the difficulty if the block is mined quickly',()=>{
           expect(Block.adjustDifficulty({previousBlock:block,timestamp:timestamp+MINE_RATE-100}))
           .toEqual(difficulty+1);
       });
       it('has to decrease the difficulty if the block is mined slowly',()=>{
        expect(Block.adjustDifficulty({previousBlock:block,timestamp:timestamp+MINE_RATE+100}))
        .toEqual(difficulty-1);
    });
       it('checks the value to be always greater than 0',()=>{
           block.difficulty = -1;
           expect(Block.adjustDifficulty({previousBlock:block})).toEqual(1);
       });
    });
});
