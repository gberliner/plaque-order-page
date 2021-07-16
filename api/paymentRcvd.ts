import { Request,Response }  from 'express'
import { RequestHandler } from 'express';
//import { Request,Response } from '../../../../.cache/typescript/4.3/node_modules/@types/express';
import fetch from 'node-fetch';
import {ExpressHandler} from '../interfaces/handlers'
import { Payment,CreatePaymentRequest, PaymentsApi, } from 'square-connect';
import nanoid from 'nanoid';
type Req = { email: string; housenumber: string; streetnumber: string; orderid: string };

type Res = { message: string };
export const paymentRcvd: ExpressHandler<Req,Res> = async (req,res) => {        
    try {
        let url = 'https://connect.squareupsandbox.com/v2/payments'
        if (process.env.NODE_ENV === "production") {
            url = 'https://connect.squareup.com/v2/payments'
        }
        
        let pymt = new Payment();
        let pymtreq = new CreatePaymentRequest();
        pymtreq.order_id = req.body.orderid;
        pymtreq.idempotency_key = nanoid.nanoid();
        let paymentsApi = new PaymentsApi();

        let pymtRes = await paymentsApi.createPayment(pymtreq);
        if (!pymtRes.hasOwnProperty("errors") || 0 === pymtRes.errors.length) {
            res.json({message: "payment received: " + JSON.stringify(pymtRes.payment)}) 
        } else {
            res.json({message:  pymtRes.errors.join(" ")})
        }
    } catch(error) {
        console.error(error.message);
        res.json({message: `payment failed, error: ${error.message}`}) 
    }
}