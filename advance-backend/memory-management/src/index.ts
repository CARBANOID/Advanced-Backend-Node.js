import express, { type Request, type Response } from "express" ; 
import EventEmitter from "events" ;
const eventEmitter = new EventEmitter() ;

const port = 3000 ; 
const app = express() ;

/*
Global variable 
    -> causes memory leaks because it is attached at the root level (window in browser and global in Node.js) 
       and will not be garbage collected until the application is terminated
    -> the GC does not know whether the variable is needed or not because they are attached to the root.
    -> if more than one route access this task array (Global variable) then the memory will get stuck for sure
*/
let tasks = [] ; 


app.get("/" , (req : Request , res : Response) => {
    /*
        closures with an external variable (tasks) reference
            -> callbacks are ambigious for the GC 
            -> because GC do not know whether the callback is finished or not .
    */
    tasks.push(function(){
        return req.headers ;
    })


    /* 
        too much data 
            -> use some in memory cache such as node-cache or memcached or redis to store the data instead of keeping it in memory

    */
    const hugeArray = new Array(1000000000).fill(req) ;


    /*
     Self referencing object (cycic references)
        -> Garbage collector in Node js is smart enough to handle cyclic references 
    */
   
    req.body.user = {
        id : 1 ,
        name : "John Doe",
        hugeArray 
    }

    req.body.badObject = req ; // self referencing object (cyclic reference)

    

    const onStart = () => { console.log("Event emitted") }

    // works like eventListener and will be called when the event is emitted
    eventEmitter.on('start', onStart)

    // if you don't remove emitter listener it will get stuck in the memory
    // eventEmitter.removeListener('start', onStart)

    // Timeout : if you set a timeout and never clear it on cleanup, it leaks memory
    const reswithTimeOut = setTimeout(() =>{
        res.send("Hello World") ;
    },3000) 

    // if you don't clear the timeout it will get stuck in the memory
    // clearTimeout(reswithTimeOut) ;

}) ;

app.listen(port , () => {
    console.log(`Server is running on port = ${port}`) ;
})