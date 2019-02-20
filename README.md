# INDO-CASH

##### Cryptocurrency project.

Indo-Cash(IC) is a bitcoin coin based cryptocurrency which is specially designed to suit the indian market.
If Peer A wants to transfer cash to Peer B, then he will use the public key of Peer B to transfer the credit. Each wallet consists of public key and private key. One peer can access his wallet only with the private key. All the keys are cryptographically hashed to secure the transactions.The proof-of-work algoritm has been incorporated to secure the transaction network. There is a transaction pool which contains all the non-validated transactions. Every peer(Miner) in the network can competate to validate the transactions. When the Miner can find the Nonce for the block(which ultimately gets added to the blockchain) and validate transactions, he will be awarded with the transaction reward.

######### Mining reward: IC 50.
######### Mining Time: 1 min.



### Highlights:
1. Uses SHA-256 Hashing algorithm.
2. Proof-of-work is implemented.
3. Miner has to mine the transactions only then a transactions will be valid.
4. All transactions done are cryptographically Hashed.
5. Difficulty level for each block is dynamic and depends on the previous block.

### End call Apis:

1. https://localhost:3000/api/blocks 
2. https://localhost:3000/api/wallet-info
3. https://localhost:3000/api/transaction-pool-map
4. https://localhost:3000/api/mine-transactions
5. https://localhost:3000/api/mine





