import Square, {CatalogApi,OrdersApi} from 'square';
import {Request, Response, NextFunction, RequestHandler} from 'express';
import pg from 'pg';
import {ExpressHandler} from '../interfaces/handlers'
import nanoid from 'nanoid';
//at present, there is only one catalog item:
//{"objects":[{"type":"ITEM","id":"TVDFRE4NN4LQEYVIUFAZ3L4Y","updated_at":"2021-07-14T22:33:28.797Z","version":1626302008797,"is_deleted":false,"present_at_all_locations":true,"image_id":"NIUGWP325MGF25ADAKBKO7Y7","item_data":{"name":"standard plaque","description":"Brooklyn neighborhood historic plaque, standard size and design ","visibility":"PRIVATE","variations":[{"type":"ITEM_VARIATION","id":"Y3IROCVXXXKS4G6RNFKKFKZV","updated_at":"2021-07-14T22:33:28.797Z","version":1626302008797,"is_deleted":false,"present_at_all_locations":true,"item_variation_data":{"item_id":"TVDFRE4NN4LQEYVIUFAZ3L4Y","name":"Regular","sku":"0000100","ordinal":1,"pricing_type":"FIXED_PRICING","price_money":{"amount":3000,"currency":"USD"},"stockable":true}}],"product_type":"REGULAR","skip_modifier_screen":true,"ecom_visibility":"UNINDEXED"}}]}
type Req = {
    nonce: string,
    buyerVerificationToken: string|undefined,
    email: string;
    address: string;
}
type Res = {
    status?: Number;
    error?: string;
    orderid?: string;
}
export function createPlaqueOrderr(req:Request, res:Response, next:NextFunction): RequestHandler<Request,Response,NextFunction>  {
    let plaqueCatalogId: string;
    let catalogItemName = "Standard Plaque"
    let pgClient = new pg.Client({
        connectionString: process.env.DATABASE_URI,
        ssl: {
          rejectUnauthorized: false
        }
    })
    let reqData: Req = JSON.parse(req.body);
    let email = reqData?.email;
    let address = reqData?.address;
    let client = new Square.Client(
        {
            environment: process.env.NODE_ENV === "production"?Square.Environment.Production:Square.Environment.Sandbox,
            accessToken: process.env.ACCESS_TOKEN
        }
    )
    pgClient.connect();
    pgClient.query(`select ObjectId from SalesCatalog where name="${catalogItemName}"`).then(
        async (rset) => {
            if (rset.rowCount >= 1) {
                let resultRow = rset.rows.pop();
                for (let idx=0;idx < rset.fields.length; idx++) {
                    if (rset.fields[idx].name === "ObjectId") {
                        plaqueCatalogId = resultRow[idx];
                        break;
                    } 
                }
                const bodyOrderLineItems: Square.OrderLineItem[] = [];
    
    
    
                const bodyOrderlineItems0: Square.OrderLineItem = {
                    quantity: '1',
                };
                bodyOrderlineItems0.catalogObjectId = plaqueCatalogId;
            
                bodyOrderLineItems[0] = bodyOrderlineItems0;
            
                const bodyOrder: Square.Order = {
                    locationId: (process.env.REACT_APP_LOCATION_ID===undefined?"undefined":process.env.REACT_APP_LOCATION_ID),
                };
                bodyOrder.lineItems = bodyOrderLineItems
            
                const body: Square.CreateOrderRequest = {};
                body.order = bodyOrder
                let ordersApi = new OrdersApi(client);
                try {
                    const {result, ...httpResponse} = await ordersApi.createOrder(body)
                    const {statusCode, ...rest} = httpResponse;
                    body.idempotencyKey = nanoid.nanoid();
                    //body.order.id
                    let sqNewOrderId: string|undefined;
                    if (statusCode !== 200) {
                        console.error('bad http response status: ' + statusCode)
                        res.send({status: statusCode, error: result?.errors?.join(" ")})
                    } else {
                        sqNewOrderId = result?.order?.id
                        try {
                            await pgClient.query(`insert into CustOrders(SqOrderId,CustEmail,CustAddr) values (${sqNewOrderId},${email},${address})`);
                        } catch (error) {
                            console.error(error?.message)
                            res.send({status: 500, error: "Failed to update table CustOrders: " + error?.message})
                        }
                        next()
                    }
    
                    // Done creating Square order  
    

                } catch (error) {
                    res.send({status: 500, error: `call to Square::createOrder failed: ${error.message}`})
                }
            } else {
                res.json({status: 500, error: "failed to retrieve catalog item price"});
            }        
        }
    ).catch((error) => {
        res.json({status: 500, error: error.message})
    }
    ).finally(() => {
        pgClient.end()
    }
    );
    return;
}
export default function createPlaqueOrder(req:Request, res:Response): ExpressHandler<Request,Response>  {
    let plaqueCatalogId: string;
    let catalogItemName = "Standard Plaque"
    let pgClient = new pg.Client({
        connectionString: process.env.DATABASE_URI,
        ssl: {
          rejectUnauthorized: false
        }
    })

    let client = new Square.Client(
        {
            environment: process.env.NODE_ENV === "production"?Square.Environment.Production:Square.Environment.Sandbox,
            accessToken: process.env.ACCESS_TOKEN
        }
    )
    pgClient.connect();
    pgClient.query(`select ObjectId from SalesCatalog where name="${catalogItemName}"`).then(
        async (rset) => {
            if (rset.rowCount >= 1) {
                let resultRow = rset.rows.pop();
                for (let idx=0;idx < rset.fields.length; idx++) {
                    if (rset.fields[idx].name === "ObjectId") {
                        plaqueCatalogId = resultRow[idx];
                        break;
                    } 
                }
                const bodyOrderLineItems: Square.OrderLineItem[] = [];
    
    
    
                const bodyOrderlineItems0: Square.OrderLineItem = {
                    quantity: '1',
                };
                bodyOrderlineItems0.catalogObjectId = plaqueCatalogId;
            
                bodyOrderLineItems[0] = bodyOrderlineItems0;
            
                const bodyOrder: Square.Order = {
                    locationId: (process.env.REACT_APP_LOCATION_ID===undefined?"undefined":process.env.REACT_APP_LOCATION_ID),
                };
                bodyOrder.lineItems = bodyOrderLineItems
            
                const body: Square.CreateOrderRequest = {};
                body.order = bodyOrder
                let ordersApi = new OrdersApi(client);
                try {
                    const {result, ...httpResponse} = await ordersApi.createOrder(body)
                    const {statusCode, headers} = httpResponse;
                    body.idempotencyKey = nanoid.nanoid();
                    //body.order.id
                    let newOrderId: string|undefined;
                    if (statusCode !== 200) {
                        console.error('bad http response status: ' + statusCode)
                        res.send({status: statusCode, error: result?.errors?.join(" ")})
                    } else {
                        newOrderId = result?.order?.id
                        res.send({orderid: newOrderId})
                    }
    
                    // Done creating Square order  
    

                } catch (error) {
                    res.send({status: 500, error: `call to Square::createOrder failed: ${error.message}`})
                }
            } else {
                res.json({status: 500, error: "failed to retrieve catalog item price"});
            }        
        }
    ).catch((error) => {
        res.json({status: 500, error: error.message})
    }
    ).finally(() => {
        pgClient.end()
    }
    );
    return((void(null) as unknown) as ExpressHandler<Request,Response>);

}