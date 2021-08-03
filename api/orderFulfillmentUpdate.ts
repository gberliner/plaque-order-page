import {Request, Response, NextFunction, RequestHandler} from 'express';
import {Convert as JSONtoOrderUpdateObj} from './orderUpdateWebhookPayload'
import {createHmac} from 'crypto'
import pg from 'pg';
/* example json payload 
{
    "merchant_id": "5S9MXCS9Y99KK",
    "type": "order.fulfillment.updated",
    "event_id": "b3adf364-4937-436e-a833-49c72b4baee8",
    "created_at": "2020-04-16T23:16:30.789Z",
    "data": {
      "type": "order",
      "id": "eA3vssLHKJrv9H0IdJCM3gNqfdcZY",
      "object": {
        "order_fulfillment_updated": {
          "created_at": "2020-04-16T23:14:26.129Z",
          "fulfillment_update": [
            {
              "fulfillment_uid": "VWJ1N9leLqjSDLvF2hvYjD",
              "new_state": "RESERVED",
              "old_state": "PROPOSED"
            }
          ],
          "location_id": "FPYCBCHYMXFK1",
          "order_id": "eA3vssLHKJrv9H0IdJCM3gNqfdcZY",
          "state": "OPEN",
          "updated_at": "2020-04-16T23:16:30.789Z",
          "version": 6
        }
      }
    }
  } */

//TODO: change this to pick up from process.env
const NOTIFICATION_URL = 'https://dementia-praecox.herokuapp.com/order-fulfillment-updated';

const connectionString = process.env.DATABASE_URL
const pgClient = new pg.Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
})

function isFromSquare(request: Request, sigKey: string) {
  const hmac = createHmac('sha1', sigKey);
  hmac.update(NOTIFICATION_URL + JSON.stringify(request.body));
  const hash = hmac.digest('base64');
  return request.get('X-Square-Signature') === hash;
}

export async function handleOrderFulfillmentUpdate(req: Request, res: Response, next: NextFunction) {
  // verify legit request
  //TODO: add this config var!:
  if (!isFromSquare(req,process.env.ORDERUPDATE_WEBHOOK_SIGKEY as string)) {
    console.error("unauthorized request origin, not originating from square!")
    next("call to order-fulfillment-updated from unauthorized source")
  }
  let fulfillmentUpdateJson = req.body;

  let orderUpdateObj = JSONtoOrderUpdateObj.toOrderUpdateWebhookPayload(fulfillmentUpdateJson)
  if (orderUpdateObj?.type === "order") {
    let sqOrderId = orderUpdateObj.data.id
    let fulfillmentUpdateObj = orderUpdateObj.data.object.orderFulfillmentUpdated.fulfillmentUpdate[0]
    let newState = fulfillmentUpdateObj.newState;
    let oldState = fulfillmentUpdateObj.oldState;
    try {
      await pgClient.connect()
      console.warn(`Updating order status for order ${sqOrderId} from ${oldState} to ${newState}`)
      await pgClient.query(`update custorders set status='${newState}' where sqorderid='${sqOrderId}'`)
      next()
    } catch (error) {
      console.error(`Error updating local db with order fulfillment change on order ${sqOrderId}: `)
      console.error(error)
      next(error)
    } finally {
      pgClient.end()
    }
  }
}