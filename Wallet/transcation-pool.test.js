
  const Blockchain =  require('../Blockchain/blockchain');
  const TranscationPool = require('./transcation-pool');
  const Transcation = require('./transcation');
  const SenderWallet = require('./index');
  
  describe('transcationPool',()=>{
  
      let transcationPool,transcation,senderWallet,amount,recipient;
      beforeEach(()=>{
       
         transcationPool = new TranscationPool();
         amount = 100;
         recipient = 'test-recipient';
         senderWallet = new SenderWallet();
         transcation = new Transcation({senderWallet,amount,recipient});
         
      });
      describe('setTranscation()',()=>{
  
         it('creates a transcations and maps the data to the transcation pool map',()=>{
            transcationPool.setTranscation(transcation); 
            expect(transcationPool.transcationMap[transcation.id]).toBe(transcation);
         });
      });
      
      describe('existingTranscation()',()=>{
          it('should check for existing transcations',()=>{
            transcationPool.setTranscation(transcation); 
            expect(transcationPool
                  .existingTranscation({inputAddress: senderWallet.publickey}))
              .toBe(transcation);
          });
      });

      describe('validTranscations()',()=>{

        let validTranscations =[],errorMock;
        
        beforeEach(()=>{
          
            errorMock = jest.fn();
            global.console.error = errorMock;
           for(let i =1;i<10;i++)
           {
               transcation = new Transcation(
                   {senderWallet, amount : 100, recipient : 'test-recipient'});
                
                if(i%3===0)
                {
                     transcation.outputMap[recipient] = 99;
                }
                else if(i%3===1)
                {
                     transcation.input.signature = new SenderWallet().sign('dummy-data');
                }
                else
                {
                    validTranscations.push(transcation);
                }

                transcationPool.setTranscation(transcation);
           }
        });

        it('returns valid transactions',()=>{

         expect(transcationPool.validTranscations()).toEqual(validTranscations);
        });

        it('logs an error',()=>{
          transcationPool.validTranscations();
          expect(errorMock).toHaveBeenCalled();
        });
    });

    describe('clear()',()=>{
        it('clears the transaction pool map',()=>{
        transcationPool.setTranscation(transcation);
        transcationPool.clear();
       expect(transcationPool.transcationMap).toEqual({})  
    });
    });

    describe('clearBlockchainTranscations()',()=>{
         it('clears the transaction pool from the transactions recorded in the blockchain',()=>{
   
            const blockchain = new Blockchain();
            const transactionMap = {};
    
            for(let i =0;i<6;i++)
            {
                  const transcation = new Transcation({senderWallet,amount:50,recipient:'foo-recipient'});
                  transcationPool.setTranscation(transcation);
    
                  if(i%2==0)
                  {
                      blockchain.addBlock({data:[transcation]});
                  }
                  else
                  {
                      transactionMap[transcation.id]= transcation;
                  }
                }
            transcationPool.clearBlockchainTranscations({chain:blockchain.chain});
            expect(transcationPool.transcationMap).toEqual(transactionMap);
         
        
    
    });
    
    });
  
  });
