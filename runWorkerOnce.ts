import {reportNewOrders} from './worker'
//await populateCustomersInSquare()

(async (asyncfunc: ()=>Promise<void>) => {
    await asyncfunc()
}
)(reportNewOrders);