import schedule from 'node-schedule'
import {populateCustomersInSquare, generateVendorOrder, reportNewOrders} from './worker';
const workerSchedule = process.env.REPORT_SCHEDULE || 5;
const uploadSchedule = process.env.UPLOAD_SCHEDULE || 22;
const vendorSchedule = process.env.VENDOR_SCHEDULE || 6;
const workerCronSchedule = `*/${workerSchedule} * * * *`
const uploadCronSchedule = `*/${uploadSchedule} * * * *`
const vendorCronSchedule = `*/${vendorSchedule} * * * *`
// setting these environment variables to zero turns off 
// the job in question
if (workerSchedule !== "0") {
    schedule.scheduleJob(workerCronSchedule, async ()=>{
        //run every 5 minutes by default
        await reportNewOrders();
    });
}

if (uploadSchedule !== "0") {
    schedule.scheduleJob(uploadCronSchedule, async ()=>{
        //run every 22 minutes by default
        await populateCustomersInSquare();
    });
}
if (vendorSchedule !== "0") {
    schedule.scheduleJob(vendorCronSchedule, async()=>{
    await generateVendorOrder();
})}