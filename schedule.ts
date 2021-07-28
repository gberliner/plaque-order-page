import schedule from 'node-schedule'
import {worker} from './worker';
schedule.scheduleJob('* * * * *', ()=>{
    // Execute something every 15 minutes
    worker();
});