import { Request,Response, RequestHandler, NextFunction }  from 'express'
import { Payment,CreatePaymentRequest, PaymentsApi,ApiClient } from 'square-connect';
import {nanoid} from 'nanoid';
import Square from 'square';
type OrderReceipt = {
    orderId: string;
    price: number;
    date: Date;
}

//type Req = { email: string; housenumber: string; streetnumber: string; orderid: string };
export default function processPayment(req: Request,res: Response, next: NextFunction): RequestHandler<Request,Response,NextFunction> {
    try {
        let url = 'https://connect.squareupsandbox.com/v2/payments'
        if (process.env.NODE_ENV === "production") {
            url = 'https://connect.squareup.com/v2/payments'
        }
        
        let pymt = new Payment();
        //let pymtreq = new CreatePaymentRequest();
        let pymtreq: Square.CreatePaymentRequest = {
            sourceId: req.body.nonce,
            idempotencyKey: nanoid(),
            amountMoney: {
                amount: BigInt(parseInt(req.body.price)),
                currency: 'USD'
            },
            locationId: process.env.REACT_APP_LOCATION_ID,
            orderId: req.body.orderid
        }
        let apiClient = new ApiClient();
        
        let client = new Square.Client(
            {
                customUrl: "https://connect.squareupsandbox.com",
                environment: process.env.NODE_ENV === "production"?Square.Environment.Production:Square.Environment.Sandbox,
                accessToken: process.env.SQUARE_ACCESS_TOKEN
            }
        )

        const paymentsApi = client.paymentsApi;
        
        paymentsApi.createPayment(pymtreq).then(pymtRes => {
            if (!pymtRes.hasOwnProperty("errors") || 0 === pymtRes.result.errors?.length) {
                res.json({
                        orderId: pymtreq.orderId,
                        price: parseInt(req.body.price),
                        date: Date.now(),
                        vendorInfo: JSON.stringify(pymtRes.body)
                    }) 
            } else {
                next("error calling paymentsApi.createPayment: " + pymtRes.result.errors?.join(" "))
            }    
        }).catch(error => {
            console.error(error.message);
            if (undefined !== error.xbody) {
                console.error(error.body);
            }
            next(`payment failed, error: ${error.message}`) 
        });
    } catch (error) {
        console.error(error.message);
        if (undefined !== error.body) {
            console.error(error.body);
        }
        next(error)
    }
    return((void(null) as unknown) as RequestHandler<Request,Response>);

}

export {processPayment}
