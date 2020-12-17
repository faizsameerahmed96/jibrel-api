import  express from 'express'
import { Request, Response } from 'express'
import IControllerBase from 'interfaces/IControllerBase.interface'
import { insufficientParameters, successResponse } from '../modules/common/common.service'

import TokenTxnService from '../modules/tokenTxn/tokenTxn.service'

class TokenController implements IControllerBase {
    public path = '/'
    public router = express.Router()

    private tokenTxnService = new TokenTxnService()

    constructor() {
        this.initRoutes()
    }

    public initRoutes() {
        this.router.get('/token/:token/logs', this.getTokenLogs)
    }

    getTokenLogs = async (req: Request, res: Response) => {
        let forAddress: string = req.query.forAddress as string
        let page = parseInt(req.query.page as string)
        if (!forAddress) return insufficientParameters(res)
        let tokenStatus = await this.tokenTxnService.getTokenStatus(req.params.token, forAddress)
        await this.tokenTxnService.syncTxnsFromBlockchain(req.params.token, req.query.forAddress, tokenStatus)
        let result = await this.tokenTxnService.getTokenTxnsFromDatabase(req.params.token, forAddress, page)

        successResponse('', result, res)
    }
}

export default TokenController