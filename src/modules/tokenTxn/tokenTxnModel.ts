import mongoose from 'mongoose'
const Schema = mongoose.Schema

const TokenTxnSchema = new Schema({
    address: { type: String, required: true },
    blockHash: { type: String, required: true },
    blockNumber: { type: Number, required: true },
    logIndex: { type: Number, required: true },
    removed: { type: 'boolean', required: true },
    transactionHash: { type: String, required: true, unique: true },
    transactionIndex: { type: Number, required: true },
    id: { type: String, required: true },
    returnValues: {
        type: 'mixed'
    },
    event: { type: String, required: true },
    signature: { type: String, required: true },
    raw: {
        data: { type: String, required: true },
        topics: [String]
    }
})

const TokenTxn = mongoose.model("TokenTxns", TokenTxnSchema, 'TokenTxns');
export default TokenTxn;