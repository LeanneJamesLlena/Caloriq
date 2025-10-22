// builds the Express app (middleware, routes)
import express from 'express'
import routes from './routes/index.js'
const app = express();

//middlewares
//help express application parse json format into javascript object
app.use(express.json());
//help express application parse html form format into javascript object
app.use(express.urlencoded({ extended: false }));

//connect routes
// all routes starts with /api will be handled by the router routes
//meaning mount all subroutes that starts with /api
app.use('/api', routes);



export default app;