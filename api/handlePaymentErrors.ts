import Express, {ErrorRequestHandler,NextFunction,Request,Response} from 'express';

export function handlePaymentErrors(error:any,req:Request,res:Response,next: NextFunction): ErrorRequestHandler<any,Request,Response,NextFunction> {
    if (res.headersSent) {
        next(error);
    }
    let errorObj = JSON.parse(error);

    if (errorObj?.errors) {
        if (errorObj.errors?.detail) {
            res.json({
                        error,
                        detail: errorObj.errors.detail
            });
        }
    } else {
        res.json({
            error,
            detail: "No further given"
        })
    }
    return((void(null) as unknown) as ErrorRequestHandler<any,Request,Response,NextFunction>);
} 