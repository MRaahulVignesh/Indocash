const Blockchain = require('./blockchain');
const Block = require('./block');
const Transaction = require('../Wallet/transcation');
const Wallet = require('../Wallet/index');
const cryptoHash = require('../Util/cryptoHash');
let blockchain,newChain,originalChain;
describe('blockchain',()=>{
     
    let blockchain,newChain,originalChain,errorMock;
    beforeEach(()=>{
        blockchain = new Blockchain();
        newChain = new Blockchain();
        originalChain = blockchain.chain;
        errorMock = jest.fn();
        global.console.error = errorMock;
     
    });
    
    
    it('is an instance of array',()=>{
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it('starts with the genesis block',()=>{
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it('adds a new block to the chain',()=>{
        const newData ='foo-Data';
        blockchain.addBlock({data:newData});

        expect(blockchain.chain[blockchain.chain.length-1].data).toEqual(newData);
    });

    describe('isValidChain()',()=>{

        
        describe('when the chain doesnot start with genesis block',()=>{

            it('returns false',()=>{
                blockchain.chain[0] ={data:'fake-genesis'};
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });

        });
        beforeEach(()=>{
            blockchain.addBlock({data:'Hi'});
            blockchain.addBlock({data:'Hello'});
            blockchain.addBlock({data:'Greetings'});
        });
        describe('starts with genesis block and has multiple blocks',()=>{
            describe('and last reference has changed',()=>{
                it('returns false',()=>{
                    blockchain.chain[2].lastHash = 'tampered';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
                
        });
        describe('and the chain contains a block with an invalid field', () => {
            it('returns false', () => {
              blockchain.chain[2].data = 'some-bad-and-evil-data';
    
              expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
          });
            describe('and the chain doesnot contain any invalid blocks',()=>{
                it('returns true',()=>{
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
                });
            });
    
        });

        describe('a chain with a jumped difficulty',()=>{
            
             it('returns false',()=>{
                const lastBlock = blockchain.chain[blockchain.chain.length-1];
                const lastHash = lastBlock.hash;
                const timestamp =Date.now();
                const data =[];
                const nonce = 0;
                const difficulty = lastBlock.difficulty-3;
                const hash = cryptoHash(timestamp,data,lastHash,nonce,difficulty);
                const dummy = new Block({timestamp,lastHash,hash,data,nonce,difficulty});
               
                blockchain.chain.push(dummy);
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
             });
             
        });

});

   describe('replaceChain()',()=>{
    
 
    
       describe('when the new chain is not longer',()=>{
    
          beforeEach(() => {
        newChain.chain[0] = { new: 'chain' };

        blockchain.replaceChain(newChain.chain);
      });

      it('does not replace the chain and logs an error', () => {
        expect(blockchain.chain).toEqual(originalChain);
        expect(errorMock).toHaveBeenCalled();
      });

     
        
          
       });
       describe('when the new chain is longer',()=>{

        let logMock;
        beforeEach(()=>{
            newChain.addBlock({data:'hi'});
            newChain.addBlock({data:'hello'});
            newChain.addBlock({data:'greetings'});
            logMock = jest.fn();
            global.console.log = logMock;
            
        });
          
          describe('and the chain is not valid',()=>{

            beforeEach(()=>{
             newChain.chain[2].hash ='fake-Hash';
             blockchain.replaceChain(newChain.chain);
            });

            it('doesnot replace the chain and logs an error',()=>{
                expect(blockchain.chain).toEqual(originalChain);
                expect(errorMock).toHaveBeenCalled();
            });
             
          

          });

          describe('and the chain is valid',()=>{

            it('replaces the chain',()=>{
                blockchain.replaceChain(newChain.chain);
                expect(blockchain.chain).toEqual(newChain.chain);
                expect(logMock).toHaveBeenCalled();
                
            });
        });
       });

       describe('and the `validTransactions flag is true',()=>{
          it('calls validTransactionData()',()=>{
            const FunctionMock = jest.fn();
            blockchain.validTransactionData = FunctionMock;
            newChain.addBlock({data:"hello"});
            blockchain.replaceChain(newChain.chain,true);
            expect(FunctionMock).toHaveBeenCalled();  
        }); 
      });

      

   });

   describe('validTransactionData()',()=>{

    let transaction,rewardTransaction,wallet;
    beforeEach(()=>{

        wallet = new Wallet(); 
        transaction = wallet.createTranscation({recipient:"f00-recipient",amount:50});
        rewardTransaction = Transaction.rewardTransaction(wallet);
    });
    describe('and the `transaction` is valid',()=>{

       it('returns true and does not log an error',()=>{
        newChain.addBlock({data: [transaction,rewardTransaction]});
        expect(blockchain.validTransactionData({chain:newChain.chain})).toBe(true);
        expect(errorMock).not.toHaveBeenCalled();
       });
        
    });

    describe('and the `transaction` data has multiple reward transactions',()=>{

        it('returns false and logs an error',()=>{
            newChain.addBlock({data: [transaction,rewardTransaction,rewardTransaction]});
            expect(blockchain.validTransactionData({chain:newChain.chain})).toBe(false);
            expect(errorMock).toHaveBeenCalled();
           });

    });

    describe('and the `transaction` data has atleast one malformed outputMap',()=>{

       describe('and that `transaction` is not a reward transaction',()=>{
              
        it('returns false and logs an error',()=>{
            transaction.outputMap[wallet.publickey]=999999;
            newChain.addBlock({data: [transaction,rewardTransaction]});
            expect(blockchain.validTransactionData({chain:newChain.chain})).toBe(false);  
            expect(errorMock).toHaveBeenCalled(); 
        });
       
       });

       describe('and the `transaction` is a reward transaction',()=>{

        it('returns false and logs an error',()=>{
            rewardTransaction.outputMap[wallet.publickey]=999999;
            newChain.addBlock({data: [transaction,rewardTransaction]});
            expect(blockchain.validTransactionData({chain:newChain.chain})).toBe(false);
            expect(errorMock).toHaveBeenCalled();
           });
        });
    });

    describe('the `transaction` data has atleast one malformed input',()=>{

        it('return false and log an error',()=>{
           
            wallet.balance = 5600;

            const fakeoutputMap = {
                [wallet.publickey]:5400,
                fooRecipient:200
            }; 

            const fakeInput = {
                timestamp : Date.now(),
                address: wallet.publickey,
                amount:wallet.balance,
                signature:wallet.sign(fakeoutputMap)
            };
         const fakeTransaction = new Transaction(
             {senderWallet:wallet,input:fakeInput,outputMap:fakeoutputMap});
             newChain.addBlock({data:[fakeTransaction]});

        expect(blockchain.validTransactionData({chain:newChain.chain})).toBe(false);
        expect(errorMock).toHaveBeenCalled();
        });
    });

    describe('a block contain multiple identical transactions',()=>{

      it('return false and logs an error',()=>{

       newChain.addBlock({data:[transaction,transaction,transaction,rewardTransaction]});
       expect(blockchain.validTransactionData({chain:newChain.chain})).toBe(false);
        expect(errorMock).toHaveBeenCalled(); 
     });
    });


   });
        
      });

 
