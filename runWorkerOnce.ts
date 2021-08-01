import {worker} from './worker'
//await populateCustomersInSquare()

(async (asyncfunc: ()=>Promise<void>) => {
    await asyncfunc()
}
)(worker);