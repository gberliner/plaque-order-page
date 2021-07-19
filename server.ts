import express from 'express';
import path from 'path';
import processPayment from './api/paymentRcvd.js';
import {createPlaqueOrder} from './api/createOrder';
    import {checkPrice} from './api/checkPrice';
const app = express();
app.use(express.static(path.join(import.meta.url, 'build')));

app.get('/ping', function (req, res) {
 return res.send('pong');
});

app.post('/api/process-payment', createPlaqueOrder, processPayment);
app.get('/api/check-price', checkPrice);
app.listen(process.env.EXPRESS_PORT || 8080);
