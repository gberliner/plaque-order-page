import schedule from 'node-schedule'
import {worker} from './worker';
schedule.scheduleJob('*/15 * * * *', ()=>{
    // Execute something every 15 minutes
    worker();
});