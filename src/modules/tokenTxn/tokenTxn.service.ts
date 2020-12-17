import TokenTxn from './tokenTxnModel'
import TokenStatus from './tokenStatusModel'
import abi from './erc20abi.json'

const Web3 = require('web3')
let web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/26f2fdf6ec3e4920968dbdfd6c786180'))


export default class TokenTxnService {
    public async syncTxnsFromBlockchain(contractAddress: string, walletAddress: any, tokenStatus: any) {
        let to = await web3.eth.getBlockNumber()

        if (!tokenStatus) tokenStatus = { lastSyncOneBlock: 0, lastSyncTwoBlock: 0 }

        let contractInstance = new web3.eth.Contract(abi, contractAddress)

        const sync1 = async (from, to) => {
            //Transfers from + Approval owner
            try {
                let result = await contractInstance.getPastEvents(null, {
                    fromBlock: tokenStatus.lastSyncOneBlock,
                    toBlock: to,
                    topics: [
                        ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925'],
                        [web3.utils.padLeft(walletAddress, 64)]
                    ],
                })

                try {
                    await TokenTxn.insertMany(result.map(txn => {
                        if (txn.returnValues.from) txn.returnValues.from = txn.returnValues.from.toLowerCase()
                        if (txn.returnValues.to) txn.returnValues.to = txn.returnValues.to.toLowerCase()
                        if (txn.returnValues.owner) txn.returnValues.owner = txn.returnValues.owner.toLowerCase()
                        if (txn.returnValues.spender) txn.returnValues.spender = txn.returnValues.spender.toLowerCase()
                        txn.address = txn.address.toLowerCase()

                        return txn
                    }), { ordered: false })
                } catch (err) {
                    //Ignored for failed updates, TODO check reason and handle appropriately 
                }
            } catch (err) {
                if (err.message == 'Returned error: query returned more than 10000 results') {
                    let mid = Math.floor((from + to) / 2)
                    await sync1(mid + 1, to)
                    await sync1(from, mid)
                }
                //TODO Maintain a log of failing block range, store in db, write job to sync later
                throw err
            }
        }

        const sync2 = async (from, to) => {
            //Transfers to approvals spender
            try {
                let result = await contractInstance.getPastEvents(null, {
                    fromBlock: from,
                    toBlock: to,
                    topics: [
                        ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925'],
                        null,
                        [web3.utils.padLeft(walletAddress, 64)]
                    ],
                })

                try {
                    await TokenTxn.insertMany(result.map(txn => {
                        if (txn.returnValues.from) txn.returnValues.from = txn.returnValues.from.toLowerCase()
                        if (txn.returnValues.to) txn.returnValues.to = txn.returnValues.to.toLowerCase()
                        if (txn.returnValues.owner) txn.returnValues.owner = txn.returnValues.owner.toLowerCase()
                        if (txn.returnValues.spender) txn.returnValues.spender = txn.returnValues.spender.toLowerCase()
                        txn.address = txn.address.toLowerCase()

                        return txn
                    }), { ordered: false })
                } catch (err) {
                    //Ignored for failed updates, TODO check reason and handle appropriately 
                }

            } catch (err) {
                if (err.message == 'Returned error: query returned more than 10000 results') {
                    let mid = Math.floor((from + to) / 2)
                    await sync1(mid + 1, to)
                    await sync1(from, mid)
                }
                //TODO Maintain a log of failing block range, store in db, write job to sync later
                throw err
            }
        }

        await TokenStatus.updateOne({ address: contractAddress, walletAddress }, { address: contractAddress, walletAddress, lastSyncOneBlock: to }, { upsert: true, setDefaultsOnInsert: true })
        await sync1(tokenStatus.lastSyncOneBlock, to)
        await TokenStatus.updateOne({ address: contractAddress, walletAddress }, { address: contractAddress, walletAddress, lastSyncTwoBlock: to }, { upsert: true, setDefaultsOnInsert: true })
        await sync2(tokenStatus.lastSyncTwoBlock, to)
    }

    public async getTokenStatus(contractAddress: string, walletAddress: string) {
        let status = await TokenStatus.findOne({ address: contractAddress, walletAddress })
        return status
    }

    public async getTokenTxnsFromDatabase(contractAddress: string, walletAddress: string, page: number) {
        walletAddress = walletAddress.toLowerCase()
        if (!page) page = 0

        const limit = 20

        return await TokenTxn.find({
            address: contractAddress.toLowerCase(), $or: [
                { "returnValues.from": walletAddress }, { "returnValues.to": walletAddress }, { "returnValues.owner": walletAddress }, { "returnValues.spender": walletAddress }
            ]
        }).sort({ blockNumber: -1, transactionIndex: -1, logIndex: -1 }).limit(limit).skip(page * limit).exec()
    }
}