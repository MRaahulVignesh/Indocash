const Wallet = require('./index');
const {verifySignature} = require('../Util');
const Transcation = require('./Transcation');
const {STARTING_BALANCE} = require('../config');
const Blockchain = require('../Blockchain/blockchain');
describe('Wallet',()=>{

    let wallet;
    beforeEach(()=>{
       wallet = new Wallet();
    });

    it('has a `balance`',()=>{
        expect(wallet).toHaveProperty('balance');
    });

    it('has a `publickey`',()=>{
        expect(wallet).toHaveProperty('publickey');
    });

    
    describe('signing data', () => {
        const data = 'foobar';
    
        it('verifies a signature', () => {
          expect(
            verifySignature({
              publickey: wallet.publickey,
              data,
              signature: wallet.sign(data)
            })
          ).toBe(true);
        });
    
        it('does not verify an invalid signature', () => {
          expect(
            verifySignature({
              publickey: wallet.publickey,
              data,
              signature: new Wallet().sign(data)
            })
          ).toBe(false);
        });
      });
     
    describe('createTranscation()',()=>{

     describe('updates the balance after every transaction',()=>{
      it('calls the calculate balance function',()=>{
         
        const calculateBalanceMock = jest.fn();
        const OriginalFunction = Wallet.calculateBalance;

        Wallet.calculateBalance = calculateBalanceMock;
        wallet.createTranscation({
          recipient:'foo',
          amount:175,
          chain:new Blockchain().chain
        });

        expect(calculateBalanceMock).toHaveBeenCalled();
        Wallet.calculateBalance = OriginalFunction;
      });
     
    });

      describe('the amount is invalid',()=>{

          it('throws an error',()=>{
              expect(()=>wallet.createTranscation({recipient:"test-recipient",amount: 99999}))
              .toThrow('amount exceeds balance');
          });
      });

      describe('the amount is valid',()=>{
      let recipient,amount,transcation;
        beforeEach(()=>{
                recipient = "test-recipient";
                amount  = 80;
                transcation = wallet.createTranscation({recipient,amount});
        });
        
        it('creates an instance of `Transcation`', () => {
          expect(transcation instanceof Transcation).toBe(true);
        });
        it('mathes the input transction input with wallet',()=>{
            expect(transcation.input.address).toEqual(wallet.publickey);
        });
      
        it('output the amount to the recipient',()=>{
            expect(transcation.outputMap[recipient]).toEqual(amount);
        });
      });
    });

    describe('calculateBalance()',()=>{
      
      let blockchain;
      beforeEach(()=>{
       
        blockchain = new Blockchain();
      
      });
      
      describe('and there are no outputs for the wallet',()=>{
      it('returns the `STARTING_BALANCE`',()=>{
         expect(Wallet.calculateBalance(
          {chain:blockchain.chain,
            address:wallet.publickey
          })).toEqual(STARTING_BALANCE);
      });
     });

      
      describe('and there are outputs for the wallet',()=>{

        let TranscationOne, TranscationTwo; 
        beforeEach(()=>{

         TranscationOne = new Wallet().createTranscation({recipient:wallet.publickey,amount:50});
         TranscationTwo = new Wallet().createTranscation({recipient:wallet.publickey,amount:150});
         blockchain.addBlock({data: [TranscationOne,TranscationTwo]});
        });

        it('adds the sum of all outputs to the wallet balance',()=>{
          expect(Wallet.calculateBalance({
              chain:blockchain.chain,
              address:wallet.publickey
            })).toEqual(
              STARTING_BALANCE+
              TranscationOne.outputMap[wallet.publickey]+
              TranscationTwo.outputMap[wallet.publickey]
              );
            });

        describe('and the wallet has made a transaction',()=>{
           let recentTranscation;
           beforeEach(()=>{
             recentTranscation = wallet.createTranscation(
               {recipient:"foo-recipient",
               amount:50});

               blockchain.addBlock({data:[recentTranscation]});
           });
        
           it('returns the output of the recent transaction',()=>{
              expect(Wallet.calculateBalance(
                {chain:blockchain.chain,
                  address:wallet.publickey}))
              .toEqual(recentTranscation.outputMap[wallet.publickey]);
           });

           describe('and there are outputs next to and after the recentTransaction',()=>{
               let sameBlockTransaction, nextBlockTransaction;

               beforeEach(()=>{

                recentTranscation = wallet.createTranscation(
                  {recipient:"after-foo-recipient",
                  amount:70});
                  
                sameBlockTransaction = Transcation.rewardTransaction(wallet);

                blockchain.addBlock({data: [recentTranscation,sameBlockTransaction]});
                  
                nextBlockTransaction = new Wallet().createTranscation(
                  {recipient:wallet.publickey,
                    amount:150});
                  
                blockchain.addBlock({data: [nextBlockTransaction]});
              });

              it('returns the output of the recent transaction',()=>{

              
                expect(Wallet.calculateBalance(
                  {chain:blockchain.chain,
                    address:wallet.publickey}))
                .toEqual(recentTranscation.outputMap[wallet.publickey]+
                         sameBlockTransaction.outputMap[wallet.publickey]+
                         nextBlockTransaction.outputMap[wallet.publickey]);
             });
           });
          });
    });




  });
});

