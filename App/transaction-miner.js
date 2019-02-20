const Transaction = require('../Wallet/Transcation');

class TransactionMiner{

    constructor({blockchain,transcationPool,wallet,pubsub})
    {
        this.blockchain = blockchain;
        this.transcationPool = transcationPool;
        this.wallet = wallet;
        this.pubsub = pubsub;
    }
   
    mineTransaction()
    {
        const validTransactions = this.transcationPool.validTranscations();
        validTransactions.push(
            Transaction.rewardTransaction(this.wallet)
            );
        this.blockchain.addBlock({ data: validTransactions });
        this.pubsub.broadcastChain();
        this.transcationPool.clear();
    }
}


module.exports = TransactionMiner;
