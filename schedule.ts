import schedule from 'node-schedule'
import {worker, populateCustomersInSquare} from './worker';
schedule.scheduleJob('*/5 * * * *', async ()=>{
    // Execute every 5 minutes
    await worker();
});
schedule.scheduleJob('*/7 * * * *', async ()=>{
    // Execute every 7 minutes
    await populateCustomersInSquare();
});