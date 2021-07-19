import pg from 'pg'
import { NextFunction, Request,Response, RequestHandler }  from 'express'

import {ExpressHandler} from '../interfaces/handlers'
import Square, {CatalogApi,OrdersApi} from 'square';
type Req = {

}
type Res = {
    status: Number;
    error?: string;
    price?: BigInt;
}
//export default void function paymentRcvd  (req: Request,res: Response) : ExpressHandler<Request,Response> {        
export default function checkPrice(req: Request, res: Response, next: NextFunction): RequestHandler<Request,Response,NextFunction> {
    let connectionString = process.env.DATABASE_URI;
    let pgClient = new pg.Client({
        connectionString,
        ssl: {
            rejectUnauthorized: false,
        }
    });
    pgClient.connect();
    pgClient.query("select price from catalog where name='Regular Plaque'").then(
        async (resultSet) => {
            let locallyAvailable = true;
            let price_money: BigInt | undefined;
            let plaqueCatalogId: string|undefined;
            let plaqueItemName = "Regular Plaque"
            if (resultSet.rowCount >= 1) {
                // Good: we already have the results in the local db
                res.json({status: 200, price: resultSet.rows[0].price});
            } else {
                locallyAvailable = false;
                // Reach out to Square, then cache our results locally
                let sqClient = new Square.Client(
                    {
                        environment: process.env.NODE_ENV === "production"?Square.Environment.Production:Square.Environment.Sandbox,
                        accessToken: process.env.ACCESS_TOKEN
                    }
                );
        
                let capi = new CatalogApi(sqClient);
                try {
                    const {result,...httpResponse} = await capi.listCatalog("","ITEM_VARIATION");
                    let r = result;
                    let objectId: string|undefined;

                    if (httpResponse.statusCode !== 200) {
                        console.error("http response status: error " + httpResponse.statusCode)
                        res.json({
                            status: httpResponse.statusCode,
                            error: JSON.stringify(httpResponse.body)
                        });
                    } else {
                        let item: Square.CatalogObject|undefined;
                        do {
                            item = r?.objects?.pop()
                            if (item?.itemVariationData?.name === plaqueItemName) {
                                price_money = item?.itemVariationData?.priceMoney?.amount;
                                objectId = item.itemVariationData.itemId
                                plaqueCatalogId = objectId;
                                break;
                            }
                        } while (item !== null)
                        //Report back our results
                        res.json({status: 200, price: price_money});

                        //Now we cache the results locally
                        if (undefined !== plaqueCatalogId) {
                            pgClient.query(`insert into catalog values (${plaqueCatalogId},${plaqueItemName},${price_money})`).then(onFulfilled => {}).catch(
                                (error) => {
                                    console.error(error.message)
                                }
                            )    
                        }
                    }
                    if (price_money === undefined) {
                        console.error("Couldn't find standard catalog item price")
                        res.json({status: 500, error: "Couldn't find standard catalog item price"});
                    } else {
                        
                        console.log(`Ùpdated database with current price info`);
                    }
                } catch(error) {
                    console.error(error.message)
                    res.send({status: 500, error: error.message})
                }

        }}).catch((error)=>{
            res.send({status: 500, error: error.message})
        }).finally(()=>{
            pgClient.end();
        });
    return((void(null) as unknown) as RequestHandler<Request,Response>);

} 
export function checkPriceeee(req: Request,res: Response): ExpressHandler<Request,Response> {
    let connectionString = process.env.DATABASE_URI;
    let pgClient = new pg.Client({
        connectionString,
        ssl: {
            rejectUnauthorized: false,
        }
    });
    pgClient.connect();
    pgClient.query("select price from catalog where name='Regular Plaque'").then(
        async (resultSet) => {
            let locallyAvailable = true;
            let price_money: BigInt | undefined;
            let plaqueCatalogId: string|undefined;
            let plaqueItemName = "Regular Plaque"
            if (resultSet.rowCount >= 1) {
                // Good: we already have the results in the local db
                res.json({status: 200, price: resultSet.rows[0].price});
            } else {
                locallyAvailable = false;
                // Reach out to Square, then cache our results locally
                let sqClient = new Square.Client(
                    {
                        environment: process.env.NODE_ENV === "production"?Square.Environment.Production:Square.Environment.Sandbox,
                        accessToken: process.env.ACCESS_TOKEN
                    }
                );
        
                let capi = new CatalogApi(sqClient);
                try {
                    const {result,...httpResponse} = await capi.listCatalog("","ITEM_VARIATION");
                    let r = result;
                    let objectId: string|undefined;

                    if (httpResponse.statusCode !== 200) {
                        console.error("http response status: error " + httpResponse.statusCode)
                        res.json({
                            status: httpResponse.statusCode,
                            error: JSON.stringify(httpResponse.body)
                        });
                    } else {
                        let item: Square.CatalogObject|undefined;
                        do {
                            item = r?.objects?.pop()
                            if (item?.itemVariationData?.name === plaqueItemName) {
                                price_money = item?.itemVariationData?.priceMoney?.amount;
                                objectId = item.itemVariationData.itemId
                                plaqueCatalogId = objectId;
                                break;
                            }
                        } while (item !== null)
                        //Report back our results
                        res.json({status: 200, price: price_money});

                        //Now we cache the results locally
                        if (undefined !== plaqueCatalogId) {
                            pgClient.query(`insert into catalog values (${plaqueCatalogId},${plaqueItemName},${price_money})`).then(onFulfilled => {}).catch(
                                (error) => {
                                    console.error(error.message)
                                }
                            )    
                        }
                    }
                    if (price_money === undefined) {
                        console.error("Couldn't find standard catalog item price")
                        res.json({status: 500, error: "Couldn't find standard catalog item price"});
                    } else {
                        
                        console.log(`Ùpdated database with current price info`);
                    }
                } catch(error) {
                    console.error(error.message)
                    res.send({status: 500, error: error.message})
                }

        }}).catch((error)=>{
            res.send({status: 500, error: error.message})
        }).finally(()=>{
            pgClient.end();
        });
    return((void(null) as unknown) as ExpressHandler<Request,Response>);
}
    
export {checkPrice}