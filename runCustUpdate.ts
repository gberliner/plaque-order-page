import {populateCustomersInSquare} from './worker'
//await populateCustomersInSquare()

(async (asyncfunc: ()=>Promise<void>) => {
    await asyncfunc()
}
)(populateCustomersInSquare);