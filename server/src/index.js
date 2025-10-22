// starts http server (reads PORT, NODE_ENV)
import app from './app.js'
import { config } from './config/env.js'
import { connectDB } from './config/db.js'

const startServer = async () => {
    //before starting the server we are forcing
    //startServer function to wait for the connection of
    //backend and database before moving forward to app.listen(starting the server)
    await connectDB();
    app.listen(config.PORT, () => {
        console.log(`server running on port: ${config.PORT}`);
    })

}


startServer();