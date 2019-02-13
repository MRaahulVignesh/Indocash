const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
const path = require('path');
const Blockchain = require('./blockchain/blockchain');
const PubSub = require('./app/pubsub');
const TranscationPool = require('./wallet/transcation-pool');
const Wallet = require('./wallet');
const TranscationMiner = require('./App/transaction-miner');
 
const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

const app = express();
const blockchain = new Blockchain();
const transcationPool = new TranscationPool();
const wallet = new Wallet();
const pubsub = new PubSub({ blockchain, transcationPool, wallet });
const transcationMiner = new TranscationMiner({blockchain,transcationPool,wallet,pubsub});



app.use(bodyParser.json());

app.get('/api/blocks', (req, res) => {
  res.json(blockchain.chain);
});
app.get('/api/transaction-pool-map', (req, res) => {
    res.json(transcationPool.transcationMap);
  });

app.get('/api/mine-transactions',(req,res) => {
   
  transcationMiner.mineTransaction();

  res.redirect('/api/blocks');

});

app.get('/api/wallet-info',(req,res)=>{
 
    const address = wallet.publickey;
    res.json({address,balance:Wallet.calculateBalance(
      {chain:blockchain.chain,
        address}
        )});
});

app.post('/api/mine', (req, res) => {
  const { data } = req.body;

  blockchain.addBlock({ data });

  pubsub.broadcastChain();

  res.redirect('/api/blocks');
});


app.post('/api/transact', (req, res) => {
  const { amount, recipient } = req.body;

  let transcation = transcationPool
    .existingTranscation({ inputAddress: wallet.publickey });

    console.log(transcation);

  try {
    if (transcation) {
      transcation.update({ senderWallet: wallet, recipient, amount });
    } else {
      transcation = wallet.createTranscation({
        recipient,
        amount,
        chain: blockchain.chain
      });
    }
  } catch(error) {
    return res.status(400).json({ type: 'error', message: error.message });
  }

  
  transcationPool.setTranscation(transcation);

  pubsub.broadcastTranscation(transcation);

  res.json({ type: 'success', transcation });
});



const syncWithRootState = () => {
  
  request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const rootChain = JSON.parse(body);

      console.log('replace chain on a sync with', rootChain);
      blockchain.replaceChain(rootChain);
    }
  });

  request({ url: `${ROOT_NODE_ADDRESS}/api/transaction-pool-map`},(error, response, body) => {
     if(!error && response.statusCode === 200) {
       const rootTransactionPool = JSON.parse(body);
       console.log('replacing the transaction pool',rootTransactionPool);
       transcationPool.setMap({transcationMap:rootTransactionPool});
     }
  });
}
  
let PEER_PORT;

if (process.env.GENERATE_PEER_PORT === 'true') {
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
  console.log(`listening at localhost:${PORT}`);

  if (PORT !== DEFAULT_PORT) {
    syncWithRootState();
  }
});


