import { Request,Response, RequestHandler }  from 'express'
//import { Request,Response } from '../../../../.cache/typescript/4.3/node_modules/@types/express';
import fetch from 'node-fetch';
import {ExpressHandler} from '../interfaces/handlers'
import { Payment,CreatePaymentRequest, PaymentsApi, } from 'square-connect';
import {nanoid} from 'nanoid';
//type Req = { email: string; housenumber: string; streetnumber: string; orderid: string };
export default function processPayment(req: Request,res: Response): RequestHandler<Request,Response> {
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
                res.json({message:  pymtRes?.errors?.join(" ")})
            }    
        }).catch(error => {
            console.error(error.message);
            res.json({message: `payment failed, error: ${error.message}`}) 
        });
    } catch (error) {
        console.error(error.message);
    }
    return((void(null) as unknown) as RequestHandler<Request,Response>);

}
//type Res = { message: string|undefined };
export function paymentRcvd  (req: Request,res: Response) : ExpressHandler<Request,Response> {        
    try {
        let url = 'https://connect.squareupsandbox.com/v2/payments'
        if (process.env.NODE_ENV === "production") {
            url = 'https://connect.squareup.com/v2/payments'
        }
        
        let pymt = new Payment();
        let pymtreq = new CreatePaymentRequest();
        JSON.parse(req.body).orderid;
        
        pymtreq.order_id = req.body.orderid;
        pymtreq.verification_token = 
        pymtreq.idempotency_key = nanoid();
        let paymentsApi = new PaymentsApi();

        paymentsApi.createPayment(pymtreq).then(pymtRes => {
            if (!pymtRes.hasOwnProperty("errors") || 0 === pymtRes?.errors?.length) {
                res.json({message: "payment received: " + JSON.stringify(pymtRes.payment)}) 
            } else {
                res.json({message:  pymtRes?.errors?.join(" ")})
            }    
        }).catch(error => {
            console.error(error.message);
            res.json({message: `payment failed, error: ${error.message}`}) 
        });
    } catch (error) {
        console.error(error.message);
    }
    return((void(null) as unknown) as ExpressHandler<Request,Response>);
}

export {processPayment}
