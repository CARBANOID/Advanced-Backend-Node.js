const fs = require('fs') ;
  
/* Readable Streams */

/*

const readable = fs.createReadStream("./my-resume.txt" , {
    highWaterMark : 20 // limit of the buffer : 20 BYTES CHUNK // sending 20 Bytes at a time 
}) ;

let chunkCount = 0 ;

readable.on("data",(chunk) =>{
    if(chunkCount == 2){
        readable.pause() ; // pauses the stream , can also be paused with AbortController
        setTimeout(() =>{
            readable.resume() ; // to resume/start the stream again
        },3000)
    }
    console.log("New Chunk : ",chunk.toString()) ; 
    chunkCount++ ;
})


// using asynchronous method with top level await approach
(async () => {
    for await (const chunk of readable){
        console.log("New chunk :",chunk.toString()) ;
    }
})()

*/
  



/* Writable Streams */

/*
const writable = fs.createWriteStream("./my-new-file.txt") ;
writable.write("hello,") 
writable.end("world!") ;
*/


/* Duplex Streams  : Most used Version*/

const { Transform , pipeline , Readable , Writable , PassThrough } = require('stream') ;
const writable = fs.createWriteStream("./my-new-file.txt") ;
const readable = fs.createReadStream("./my-resume.txt" , {
    highWaterMark : 20 // limit of the buffer : 20 BYTES CHUNK
}) 

const upperCase = new Transform({
    transform(chunk,encoding,callback){
        // callback(error_object,operation)
        callback(null,chunk.toString().toUpperCase()) ;
    },
})

// pipes : bad with memory leak , if first pipe fails then second pipe is left hanging in the memory 
// readable.pipe(upperCase).pipe(writable) ;

// pipeline are more efficient and has a single error handing callback unlike pipe where you have create a error callback for each pipe
pipeline(readable,upperCase,writable,(error) => {
    if(error){
        console.error(error) ;
    }
})

// pipeline and pipes can transform things along the way but not PassThrough


// More on Streams : with express

// const zlib = require("zlib") ; // compress your file
// const crypto = require("crypto") ; // encrypt your file

// app.get("/*",async(req,res) =>{
//     const proxy = await fetch(`${origin}${req.path}`) 
//     res.writeHead(proxy.res.statusCode) 
//     proxy.res.pipe(res) ;
// // })