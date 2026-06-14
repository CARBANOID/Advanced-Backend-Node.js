import Express, { type Request, type Response }  from 'express' ;
import cors from "cors"
import { Worker } from 'worker_threads';

const app = Express() ;
const THREAD_COUNT = 4 ;  // Using 4 Cores

function createWorker(){
    return new Promise((resolve,reject) =>{
        const worker = new Worker("./dist/4-workers.js",{
            workerData : {thread_count : THREAD_COUNT}
        }) ; 

        worker.on("message",(data) =>{
            resolve(data) ; 
        })

        worker.on("error",(err) =>{
            reject(`error occured : ${err}`)
        })
    })
}

app.use(cors()) ;

app.get("/non-blocking",(req : Request , res : Response) =>{
    res.status(200).send("unblocked page") ;
}) ;

app.get("/blocking",async(req : Request, res : Response) =>{
    const workerPromises = [] ; // array of worker promises
   
    for(let i = 0 ; i<THREAD_COUNT ; i++){
        workerPromises.push(createWorker()) ;
    }

    const thread_results : any[] = await Promise.all(workerPromises) ; 
    const total = 
        thread_results[0] +  // 5_000_000_000
        thread_results[1] +  // 5_000_000_000
        thread_results[2] +  // 5_000_000_000
        thread_results[3] ;  // 5_000_000_000

    res.status(200).send(`result is ${total}`)
}) ;

app.listen(3000) ; 