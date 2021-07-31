import pg from 'pg';
import Square, {CatalogApi,OrdersApi,CustomersApi   } from 'square';
import {nanoid} from 'nanoid';
import {sendemail,EmailBody,EmailHeader} from './sendemail'
import { v1PhoneNumberSchema } from 'square/dist/models/v1PhoneNumber';
import legit from 'legit'

const notificationEmail = process.env.NOTIFICATION_RECIPIENT || 'guy.berliner@gmail.com'

const configSandbox: Partial<Square.Configuration> = {
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: Square.Environment.Sandbox,
    customUrl: "https://connect.squareupsandbox.com"
}
const configProd: Partial<Square.Configuration> = {
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: Square.Environment.Production
}
let configSquare = configSandbox;
if (process.env.NODE_ENV === "production" && process.env.STAGING !== 'true') {
    configSquare = configProd
}

async function checkForAndCreateCustomerInSquare(row: any,client: Square.Client, pgclient: pg.Client,rowFromCustomer: boolean) {
    let email = row['email'];
    let legitRes = await legit(email);
    if (!legitRes.isValid) {
        console.error(`Skipping customer email address ${email}, no valid mx!`)
        return
    }

    let searchFilter: Square.SearchCustomersRequest = {

    }
    
    let emailQuery: Square.CustomerQuery = {

    }
    let emailQueryFilter: Square.CustomerFilter = {
        emailAddress: {
            exact: email
        }
    }
    emailQuery.filter = emailQueryFilter
    searchFilter.query = emailQuery;
    searchFilter.limit = BigInt(1);
    let customerRes = await client.customersApi.searchCustomers(searchFilter)
    let phone: string = ""
    let customerLocal;
    let firstname: string = ""
    let lastname: string = ""

    if (rowFromCustomer) {
        phone=row['phone']
        firstname=row['firstname']
        lastname=row['lastname']
    }

    if (!rowFromCustomer) {
        customerLocal = await pgclient.query(`select * from Customer where email='${email}'`)
        if (customerLocal.rowCount >= 1) {
            phone = customerLocal.rows[0]['phone']
        }    
    }
    if (rowFromCustomer || 0 === customerRes.result.customers?.length) {
        
        let createCustomerRequest: Square.CreateCustomerRequest = {

        }
        createCustomerRequest.address = {
            addressLine1: row["address"],
            firstName: firstname,
            lastName: lastname,
        }
        createCustomerRequest.emailAddress = email
        createCustomerRequest.phoneNumber = "1" + phone
        createCustomerRequest.givenName = firstname
        createCustomerRequest.familyName = lastname
        let sqCustRes = await client.customersApi.createCustomer(createCustomerRequest)
        let sqid = ""
        if (sqCustRes?.result !== undefined && sqCustRes?.result?.customer !== undefined && sqCustRes?.result?.customer.id !== undefined) {
            sqid = sqCustRes.result.customer.id;
        }
        await pgclient.query(`update customer set sqid='${sqid}' where email='${email}'`)
    }
}

export async function populateCustomersInSquare() {
    const sqClient = new Square.Client(configSquare)
    
    let connectionString = process.env.DATABASE_URL 
    let pgClient = new pg.Client({
        connectionString,
        connectionTimeoutMillis: 20000,
        ssl: {
            rejectUnauthorized: false
        }
    })
    try{
        await pgClient.connect()

        let res = await pgClient.query("select * from customer where sqid is null")
 
        if (res.rowCount > 0) {
            await res.rows.forEach(async row=>{
                await checkForAndCreateCustomerInSquare(row,sqClient,pgClient,true)
            })
        }
    
    } finally {
        await pgClient.end()
    }
}

// to be run as scheduled job
export async function worker(){

    let connectionString = process.env.DATABASE_URL 
    let pgClient = new pg.Client({
        connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    })
    let newOrders:  string[] = []
 
    let sqClient = new Square.Client(configSquare)

    try {
        await pgClient.connect();

        let results = await pgClient.query(`select * from custorders where status='new';`)
        results.rows.forEach(async (row) => {
            let squrderid = row["sqorderid"];
            newOrders.push(squrderid);
            await checkForAndCreateCustomerInSquare(row,sqClient,pgClient,false)
        })
        if (results.rows.length < 3) {
            throw(new Error('too few orders to act on'))            
        }

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
                sender: 'chair@brooklyn-neighborhood.org',
                subject: "New plaque orders ready for review"
            }, {
                text: "The following orders have come in and await your approval. Please log into the order system and mark them \"in progress\" or \"complete\" as appropriate:  " + newOrders.join("\n"),
                html: `The following orders have come in and await your approval:<br>
                    <ul><li>${newOrders.join('</li><li>')}</li></ul><br>Please log into the order system and move them to 'in progress' or 'completed' as appropriate.
                `
            })
            await pgClient.query(`update custorders set status='t_notified' where status='new'`);
        }

    } catch (error) {
        console.error("Error updating Square orders: " + error)
        if (undefined !== error.body) {
            console.error(error.body)
        }
    } finally {
        pgClient.end()
    }

}
