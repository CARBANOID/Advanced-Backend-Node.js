/*
 Without Multi-Threading ( All Load on the Main thread)

 The V8 engine use libuv library that lets node application to create some extra hidden threads : 

Asynchronus Nature emits 
 Total : 7 Threads (1 Main thread + 2 Threads for Garbage Collector + 4 Extra when needed)
 -> 4 Extra Threads reponds when there is  I/0 operators , db call , file read/write , network data transmission
    that's why node is asynchronous 
*/

/*
when blocking page is opening , then the request to non-blocking page also gets blocked 
due to main threading being occupied with blocking page request .
*/

import Express, { type Request, type Response }  from 'express' ;
import cors from "cors"

const app = Express() ;
app.use(cors()) ;

app.get("/non-blocking",(req : Request , res : Response) =>{
    res.status(200).send("unblocked page") ;
}) ;

app.get("/blocking",(req : Request, res : Response) =>{
    let counter = 0 ; 
    for(let i = 0 ; i<20_000_000_000 ; i++){
        counter ++ ;
    }
    res.status(200).send(`result is ${counter}`) ; 
}) ;

app.listen(3000) ; 