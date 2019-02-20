const Transcation = require('./transcation');
const Wallet = require('./index');
const {MINER_REWARD, MINER_TRANSACTION_INPUT} = require('../config');
describe('transcation',()=>{
    let transcation,senderWallet,recipient,amount,errorMock;
    
    beforeEach(()=>{
        senderWallet = new Wallet();
        amount = 50;
        recipient = 'test-recipient';
       transcation = new Transcation({senderWallet,amount,recipient});

       errorMock =  jest.fn();
       global.console.error = errorMock;
    });
    
    it('has an uuid id',()=>{
      expect(transcation).toHaveProperty('id');
    });

    describe('outputmap',()=>{
       it('has an output map',()=>{
        expect(transcation).toHaveProperty('outputMap');
       });
       it('outputs the amount to the `recipient`',()=>{
           expect(transcation.outputMap[recipient]).toEqual(amount);
           
       });
       it('outputs the remaining amount to the sender',()=>{
        expect(transcation.outputMap[senderWallet.publickey]).toEqual(senderWallet.balance - amount);
    });
    });

    describe('input section of the transcation',()=>{
        it('has a input property',()=>{
           expect(transcation).toHaveProperty('input');
        });
        it('has a timestamp inside the input',()=>{
           expect(transcation.input).toHaveProperty('timestamp');
        });
        it('sets the amount to the senderWallet balance',()=>{
           expect(transcation.input.amount).toEqual(senderWallet.balance);
        });
        it('sets the address to the sender wallet public key',()=>{
           expect(transcation.input.address).toEqual(senderWallet.publickey)
        });

    });

    describe('validTranscation',()=>{

      describe('when the `transcation` is valid',()=>{
     
        it('returns true',()=>{
            expect(Transcation.validTranscation(transcation)).toBe(true);
        });

        
      });
      
      describe('when the `transcation` is valid',()=>{

       describe('because the `transcation` output Map is invalid',()=>{

        
        it('returns false',()=>{
            transcation.outputMap[senderWallet.publickey]=999999;
            expect(Transcation.validTranscation(transcation)).toBe(false);
        });

        
        it('logs an error',()=>{
           expect(errorMock).toHaveBeenCalled;
        });

       });
       
       describe('because the `transcation` input signature is invalid',()=>{

          
        it('returns false',()=>{
            transcation.input.signature = new Wallet().sign('data');
            expect(Transcation.validTranscation(transcation)).toBe(false);
        }); 

        
        it('logs an error',()=>{
            expect(errorMock).toHaveBeenCalled;
        });
      });
    });

    
    });

    describe('update()',()=>{

        let originalSenderOutput,originalSignature,newRecipient,newAmount;

        describe('and the amount is invaild',()=>{
            
            it('throws an error',()=>{
                   
                expect(()=>{ transcation.update({
                    recipient : "foo-recipient",
                    amount : 99999,
                    senderWallet
                })
            }).toThrow('Amount exceeds balance');
            });
        });
        
        
        describe('and the amount is valid',()=>
        {
            beforeEach(()=>{

              originalSenderOutput = transcation.outputMap[senderWallet.publickey];
              originalSignature =  transcation.input.signature;
              newAmount = 500;
              newRecipient = "new-recipient";

              transcation.update({
                senderWallet, recipient: newRecipient, amount: newAmount
              });
            });
            
            
            it('outputs the `amount` to the next `recipient`',()=>{
                 
             expect(transcation.outputMap[newRecipient]).toEqual(newAmount);
            });
    
            it('subtracts the `amount` from the original sender',()=>{
                expect(transcation.outputMap[senderWallet.publickey])
                .toEqual(originalSenderOutput-newAmount);
            });
    
            it('maintains the total output that matches the `recipient`',()=>{
                const totalAmount = Object.values(transcation.outputMap)
                .reduce((total,amount)=>total+amount);
                expect(totalAmount).toEqual(transcation.input.amount);
            });
    
            it('resigns the `transcation`',()=>{
                expect(transcation.input.signature).not.toEqual(originalSignature);
            });


            describe('and sends the amount to the same recipient again',()=>{
                let addedAmount;
                beforeEach(()=>{
                   
                   addedAmount = 80;
                   originalSenderOutput = transcation.outputMap[senderWallet.publickey];
                   transcation.update({senderWallet, recipient: newRecipient, amount: addedAmount})
                });
                 it('should output the amount to the recipient',()=>{
                    expect(transcation.outputMap[newRecipient]).toEqual(newAmount+addedAmount);
                 });
                 it('subtracts the amount from the original sender output amount',()=>{
                    expect(transcation.outputMap[senderWallet.publickey]).toEqual(originalSenderOutput-addedAmount);
                 });
            });
        });

        

       
    });
describe('rewardTransaction()', () => {
    let rewardTransaction, minerWallet;

    beforeEach(() => {
      minerWallet = new Wallet();
      rewardTransaction = Transcation.rewardTransaction(minerWallet);
      
    });

    it('creates an instance of transaction',()=>{
       expect(rewardTransaction instanceof Transcation).toBe(true);
    });

    it('creates a transaction with the reward input', () => {
      
      expect(rewardTransaction.input).toEqual(MINER_TRANSACTION_INPUT);
    });

    it('creates one transaction for the miner with the MINING_REWARD', () => {
        
        const reward = rewardTransaction.outputMap[minerWallet.publickey];
        expect(reward).toEqual(MINER_REWARD);
    });
  });
});
