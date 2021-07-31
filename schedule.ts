import schedule from 'node-schedule'
import {worker, populateCustomersInSquare} from './worker';
const workerSchedule = process.env.WORKER_SCHEDULE || 5;
const uploadSchedule = process.env.UPLOAD_SCHEDULE || 22;
const workerCronSchedule = `*/${workerSchedule} * * * *`
const uploadCronSchedule = `*/${uploadSchedule} * * * *`
// setting these environment variables to zero turns off 
// the job in question
if (workerSchedule !== "0") {
    schedule.scheduleJob(workerCronSchedule, async ()=>{
        //run every 5 minutes by default
        await worker();
    });
}

if (uploadSchedule !== "0") {
    schedule.scheduleJob(uploadCronSchedule, async ()=>{
        //run every 22 minutes by default
        await populateCustomersInSquare();
    });
}
