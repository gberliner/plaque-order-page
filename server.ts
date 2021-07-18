import express from 'express';
import path from 'path';
import {processPayment} from './api/paymentRcvd';
import createOrder from './api/createOrder'
import checkPrice from './api/checkPrice'
const app = express();
app.use(express.static(path.join(__dirname, 'build')));

app.get('/ping', function (req, res) {
 return res.send('pong');
});

app.post('/api/process-payment', createOrder, processPayment);
app.get('/check-price', checkPrice);
app.listen(process.env.EXPRESS_PORT || 8080);
