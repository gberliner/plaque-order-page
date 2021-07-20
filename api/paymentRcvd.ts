import { Request,Response, RequestHandler, NextFunction }  from 'express'
import { Payment,CreatePaymentRequest, PaymentsApi, } from 'square-connect';
import {nanoid} from 'nanoid';
//type Req = { email: string; housenumber: string; streetnumber: string; orderid: string };
export default function processPayment(req: Request,res: Response, next: NextFunction): RequestHandler<Request,Response,NextFunction> {
    try {
        let url = 'https://connect.squareupsandbox.com/v2/payments'
        if (process.env.NODE_ENV === "production") {
            url = 'https://connect.squareup.com/v2/payments'
        }
        
        let pymt = new Payment();
        let pymtreq = new CreatePaymentRequest();
        let paymentRequestObj = JSON.parse(req.body);
        JSON.parse(req.body).orderid;
        pymtreq.order_id = paymentRequestObj.orderid;
        pymtreq.verification_token = paymentRequestObj.buyerVerificationToken;
        pymtreq.idempotency_key = nanoid();
        let paymentsApi = new PaymentsApi();

        paymentsApi.createPayment(pymtreq).then(pymtRes => {
            if (!pymtRes.hasOwnProperty("errors") || 0 === pymtRes?.errors?.length) {
                res.json({message: "payment received: " + JSON.stringify(pymtRes.payment)}) 
            } else {
                next("error calling paymentsApi.createPayment: " + pymtRes?.errors?.join(" "))
            }    
        }).catch(error => {
            console.error(error.message);
            next(`payment failed, error: ${error.message}`) 
        });
    } catch (error) {
        console.error(error.message);
        next(error)
    }
    return((void(null) as unknown) as RequestHandler<Request,Response>);

}

export {processPayment}
