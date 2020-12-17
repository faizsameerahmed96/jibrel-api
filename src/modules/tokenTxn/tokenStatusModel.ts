import  mongoose from 'mongoose'
const Schema = mongoose.Schema

const TokenStatusSchema = new Schema({
    address: { type: String, required: true },
    walletAddress: { type: String, required: true },
    lastSyncOneBlock: { type: Number, required: true, default: 0 },
    lastSyncTwoBlock: { type: Number, required: true, default: 0 },
})

const TokenTxn = mongoose.model("TokenStatus", TokenStatusSchema, 'TokenStatus');
export default TokenTxn;