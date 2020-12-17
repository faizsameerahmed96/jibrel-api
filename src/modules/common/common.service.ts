import { Response } from 'express';

export function successResponse(message: string, data: any, res: Response) {
    res.status(200).json({
        status: 'SUCCESS',
        message: message,
        data
    });
}

export function failureResponse(message: string, data: any, res: Response) {
    res.status(200).json({
        status: 'FAILURE',
        message: message,
        data
    });
}

export function insufficientParameters(res: Response) {
    res.status(400).json({
        status: 'FAILURE',
        message: 'Insufficient parameters',
        data: {}
    });
}