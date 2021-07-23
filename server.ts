import express from 'express';
import path from 'path';
import processPayment from './api/paymentRcvd.js';
import {createPlaqueOrder} from './api/createOrder';
    import {checkPrice} from './api/checkPrice';
const app = express();
app.use(express.static(path.join(import.meta.url, 'build')));


app.use(express.json());
app.get('/ping', function (req, res) {
 return res.send('pong');
});

app.post('/api/process-payment', createPlaqueOrder, processPayment);
app.get('/api/check-price', checkPrice);
app.get('/', (request, response) => {
	response.sendFile(path.join(import.meta.url, 'build', 'index.html'));
});
app.get('/*', (request, response) => {
	response.sendFile(path.join(import.meta.url, 'build', 'index.html'));
});
app.listen(process.env.NODE_ENV === "production" ? parseInt(process?.env?.PORT as string): 8080);
