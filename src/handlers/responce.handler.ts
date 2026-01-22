export const SendResponse = (
    res: any,
    statusCode = 200,
    flag = true,
    message = "",
    data: any = {}
) => {
    try {
        return res.status(statusCode).json({
            code: statusCode,
            success: flag,
            message,
            data,
        });
    } catch (error) {
        console.error(error);
    }
};
