import schedule from 'node-schedule'
import {worker, populateCustomersInSquare} from './worker';
schedule.scheduleJob('*/5 * * * *', ()=>{
    // Execute every 5 minutes
    worker();
});
schedule.scheduleJob('*/7 * * * *', ()=>{
    // Execute every 7 minutes
    populateCustomersInSquare();
});