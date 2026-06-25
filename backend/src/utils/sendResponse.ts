export const sendResponse = (
    res: Response,
    statusCode: number,
    message: string,
    data?: unknown,
    meta?: unknown
) => {

    return res.status(statusCode).json({
        success: true,
        message,
        data,
        meta
    });

};