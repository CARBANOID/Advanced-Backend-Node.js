import express from 'express'
import dotenv from 'dotenv' 
import proxy from 'express-http-proxy';
dotenv.config() ; 

const port = process.env.PORT || 5000 

const app = express() ; 

app.use(express.json()) ;


/* Running in Local Machine
    API GateWay :  
        => made using the middlware
        => app.use(route,proxy(service-url)) ;

// auth service : running at port 8001
app.use("/auth",proxy("http://localhost:8001")) ; 

// order service : running at port 8002
app.use("/order",proxy("http://localhost:8002")) ; 

// payment service : running at port 8003
app.use("/payment",proxy("http://localhost:8003")) ; 

*/


/* Running inside Docker Container */

// auth service : running at auth-service container port 8001
app.use("/auth",proxy("http://auth-service:8001")) ; 

// order service : running at order-service container port 8002
app.use("/order",proxy("http://order-service:8002")) ; 

// payment service : running at payment-service container port 8003
app.use("/payment",proxy("http://payment-service:8003")) ; 


app.get("/",(req,res) => {
    return res.status(200).json({message : `hello from ${process.env.SERVER_NAME}`}) ;
})


app.listen(port ,async() => {
    console.log(`server started at port ${port}`) ; 
}) 