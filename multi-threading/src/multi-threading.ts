import Express, { type Request, type Response }  from 'express' ;
import cors from "cors"
import { Worker } from 'worker_threads';

// Multi Threading ( Done for CPU intensive tasks)
/*
now when blocking page is opening , then the request to non-blocking page 
does not get blocked since blocking page request is being handled by worker not the main thread .
the main handles the non-blocking page request .
*/


const app = Express() ;
app.use(cors()) ;

app.get("/non-blocking",(req : Request , res : Response) =>{
    res.status(200).send("unblocked page") ;
}) ;

app.get("/blocking",(req : Request, res : Response) =>{
    const worker = new Worker("./dist/worker.js") ; // url of the created worker

    worker.on("message",(data) =>{ // data from the worker
        res.status(200).send(`result is ${data}`)
    })

    worker.on("error",(err) =>{
        res.status(404).send(`error occured : ${err}`)
    })

}) ;

app.listen(3000) ; 