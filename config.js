const INITIAL_DIFFICULTY = 3;
const MINE_RATE = 1000;
const GENESIS_DATA = {
   timestamp:1,
   lastHash:"None",
   hash:'-----',
   data: [],
   nonce: 0,
   difficulty: INITIAL_DIFFICULTY
};

const STARTING_BALANCE = 1000;


const MINER_REWARD = 50;

const MINER_TRANSACTION_INPUT = { address: '*authorized-reward*' };



module.exports = {
   GENESIS_DATA,
   MINE_RATE,
   STARTING_BALANCE,
   MINER_REWARD,
   MINER_TRANSACTION_INPUT
};
