const PubNub = require('pubnub');

const credentials = {
  publishKey: 'pub-c-1ef1f1fc-9857-4543-b3d6-b9c34c624267',
  subscribeKey: 'sub-c-bbc9e210-0d0d-11e9-8ebf-6a684a5fb351',
  secretKey: 'sec-c-NDcxOTYyMmUtZjE1Yy00MjBhLTk5YzctMTgxNjRkN2Q5N2Ix'
};

const CHANNELS = {
  TEST: 'TEST',
  BLOCKCHAIN: 'BLOCKCHAIN',
  TRANSACTION: 'TRANSACTION'
};

class PubSub {
  constructor({ blockchain, transcationPool, wallet }) {
    this.blockchain = blockchain;
    this.transcationPool = transcationPool;
    this.wallet = wallet;

    this.pubnub = new PubNub(credentials);

    this.pubnub.subscribe({ channels: [Object.values(CHANNELS)] });

    this.pubnub.addListener(this.listener());
  }

  broadcastChain() {
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain)
    });
  }

  broadcastTranscation(transcation) {
    this.publish({
      channel: CHANNELS.TRANSACTION,
      message: JSON.stringify(transcation)
    });
  }

  subscribeToChannels() {
    this.pubnub.subscribe({
      channels: [Object.values(CHANNELS)]
    });
  }

  listener() {
    return {
      message: messageObject => {
        const { channel, message } = messageObject;

        console.log(`Message received. Channel: ${channel}. Message: ${message}`);
        const parsedMessage = JSON.parse(message);

        switch(channel) {
          case CHANNELS.BLOCKCHAIN:
            
            this.blockchain.replaceChain(parsedMessage, true, ()=>{
              this.transcationPool.clearBlockchainTranscations(
                {chain:parsedMessage}
                );
            });
             break;
          case CHANNELS.TRANSACTION:
            if (!this.transcationPool.existingTranscation({
              inputAddress: this.wallet.publickey
            })) {
              this.transcationPool.setTranscation(parsedMessage);
            }
            break;
          default:
            return;
        }
      }
    }
  }

  publish({ channel, message }) {
    this.pubnub.publish({ message, channel });
  }

 
}

module.exports = PubSub;
