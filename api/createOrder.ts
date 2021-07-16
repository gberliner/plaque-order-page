import Square, {CatalogApi,OrdersApi} from 'square';
import pg from 'pg';
import {ExpressHandler} from '../interfaces/handlers'
import nanoid from 'nanoid';
//at present, there is only one catalog item:
//{"objects":[{"type":"ITEM","id":"TVDFRE4NN4LQEYVIUFAZ3L4Y","updated_at":"2021-07-14T22:33:28.797Z","version":1626302008797,"is_deleted":false,"present_at_all_locations":true,"image_id":"NIUGWP325MGF25ADAKBKO7Y7","item_data":{"name":"standard plaque","description":"Brooklyn neighborhood historic plaque, standard size and design ","visibility":"PRIVATE","variations":[{"type":"ITEM_VARIATION","id":"Y3IROCVXXXKS4G6RNFKKFKZV","updated_at":"2021-07-14T22:33:28.797Z","version":1626302008797,"is_deleted":false,"present_at_all_locations":true,"item_variation_data":{"item_id":"TVDFRE4NN4LQEYVIUFAZ3L4Y","name":"Regular","sku":"0000100","ordinal":1,"pricing_type":"FIXED_PRICING","price_money":{"amount":3000,"currency":"USD"},"stockable":true}}],"product_type":"REGULAR","skip_modifier_screen":true,"ecom_visibility":"UNINDEXED"}}]}
type Req = {
    email: string;
    housenumber: string;
    streetname: string;
}
type Res = {
    status?: Number;
    error?: string;
    orderid?: string;
}
export const createPlaqueOrder: ExpressHandler<Req,Res> = async (req, res) => {
    let plaqueCatalogId;
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
    await pgClient.connect();
    const rset = await pgClient.query('select ObjectId from SalesCatalog where name="standard plaque"');
    
    if (rset.rowCount >= 1) {
        let resultRow = rset.rows.pop();
        for (let idx=0;idx < rset.fields.length; idx++) {
            if (rset.fields[idx].name === "ObjectId") {
                plaqueCatalogId = resultRow[idx];
                break;
            } 
        }
    }
    pgClient.end();
    if (plaqueCatalogId === undefined) {
        let capi = new CatalogApi(client);
        try {
            const {result,...httpResponse} = await capi.listCatalog("","ITEM_VARIATION");
            let r = result;
            if (httpResponse.statusCode !== 200) {
                console.error("http response status: error " + httpResponse.statusCode)
                res.send({
                    status: httpResponse.statusCode,
                    error: JSON.stringify(httpResponse.body)
                })
            } else {
                //let item: Square.CatalogObject;
                let price_money;
                let objectId;
                let item: Square.CatalogObject
                do {
                    item = r.objects.pop()
                     if (item.itemVariationData.name === "Regular Plaque") {
                        price_money = item.itemVariationData.priceMoney.amount;
                        objectId = item.id;
                        plaqueCatalogId = item.id;
                        break;
                     }
                } while (item !== null);
                if (price_money === null) {
                    console.error("Couldn't find standard catalog item price");
                }
    
     
            }
    
        
        } catch (error) {
            console.error(error.message);
        }
    }
    const bodyOrderLineItems: Square.OrderLineItem[] = [];
    
    
    
    const bodyOrderlineItems0: Square.OrderLineItem = {
        quantity: '1',
    };
    bodyOrderlineItems0.catalogObjectId = plaqueCatalogId;

    bodyOrderLineItems[0] = bodyOrderlineItems0;

    const bodyOrder: Square.Order = {
        locationId: process.env.REACT_APP_LOCATION_ID,
    };
    bodyOrder.lineItems = bodyOrderLineItems

    const body: Square.CreateOrderRequest = {};
    body.order = bodyOrder
    let ordersApi = new OrdersApi(client);
    const {result, ...httpResponse} = await ordersApi.createOrder(body)
    const {statusCode, headers} = httpResponse;
    body.idempotencyKey = nanoid.nanoid();
    //body.order.id
    let newOrderId: string;
    if (statusCode !== 200) {
        console.error('bad http response status: ' + statusCode)
        res.send({status: statusCode, error: result.errors.join(" ")})
    } else {
        newOrderId = result.order.id
        res.send({orderid: newOrderId})
    }
}