import pg from 'pg';
import Square, {CatalogApi,OrdersApi} from 'square';
import {nanoid} from 'nanoid';
import {sendemail,EmailBody,EmailHeader} from './sendemail'

const notificationEmail = process.env.NOTIFICATION_RECIPIENT || 'treasurer@brooklyn-neighborhood.org'

export async function worker(){

    let connectionString = process.env.DATABASE_URL 
    let pgClient = new pg.Client({
        connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    })
    let newOrders:  string[] = []
    pgClient.connect();
    try {
        let results = await pgClient.query(`select * from custorders where status='new';`)
        results.rows.forEach((row) => {
            let squrderid = row["sqorderid"];
            newOrders.push(squrderid);
        })
        if (results.rows.length < 3) {
            throw(new Error('too few orders to act on'))            
        }

        let configSandbox: Partial<Square.Configuration> = {
            accessToken: process.env.SQUARE_ACCESS_TOKEN,
            environment: Square.Environment.Sandbox,
            customUrl: "https://connect.squareupsandbox.com"
        }
        let configProd: Partial<Square.Configuration> = {
            accessToken: process.env.SQUARE_ACCESS_TOKEN,
            environment: Square.Environment.Production
        }
        let configSquare = configSandbox;
        if (process.env.NODE_ENV === "production" && process.env.STAGING !== 'true') {
            configSquare = configProd
        }
        let sqClient = new Square.Client(configSquare)
        let retrieveOrderRequest: Square.BatchRetrieveOrdersRequest = {
            orderIds: newOrders
        }

        console.error(`Orders ${newOrders.join(" ")} ready for treasurer review`)
        let newSqOrders = await sqClient.ordersApi.batchRetrieveOrders(retrieveOrderRequest)
        let idx = 0
        newSqOrders?.result?.orders?.forEach(order => {
            if (order.fulfillments !== undefined && order.fulfillments[0].pickupDetails !== undefined) {
                (order.fulfillments[0].pickupDetails.note as string) = newOrders[idx]
            }

            idx++
            let updateOrderRequest: Square.UpdateOrderRequest = {
                idempotencyKey: nanoid(),
                order
            }
        })

        if (newOrders.length >= 3) {
            await sendemail({
                recipient: notificationEmail,
                sender: notificationEmail,
                subject: "New plaque orders ready for view"
            }, {
                text: "The following orders have come in and await your approval. Please log into the order system and mark them \"in progress\" or \"complete\" as appropriate:  " + newOrders.join("\n"),
                html: ""
            })
        }
        await pgClient.query(`update custorders set status='t_notified' where status='open'`);

    } catch (error) {
        console.error("Error updating Square orders: " + error)
        if (undefined !== error.body) {
            console.error(error.body)
        }
    } finally {
        pgClient.end()
    }
}
