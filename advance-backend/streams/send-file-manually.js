const express = require('express') ; 
const cors = require('cors') ;
const fs = require('fs') ;

const app = express() ; 
app.use(cors()) ;


// Manual Streaming

/*
In case of HTTP connection , first handshaking is performed and acknowlegdement is recived and then request is sent
Express uses HTTP/1.1 by default the connection stays open for multiple requests
res.send() finalizes the HTTP response on first call —
it cannot be called multiple times for the same request.
So we pipe the readable stream into res (a writable stream) using pipe or pipeline ,
which sends each chunk automatically and 
calls res.end() when the file is fully transferred.
*/

app.get('/file/:name',(req,res) =>{
    let file_name = req.params.name ;
    file_name = `./${file_name}` ;

    console.log(file_name) ;


    // check if file exists first
    if (!fs.existsSync(file_name)) {
        return res.status(404).json({ error: "File not found" });
    }

    const readStream = fs.createReadStream(file_name,{
        highWaterMark : 400
    }) ;

    // set the header so client knows what's coming
    res.setHeader('Content-Type', 'text/plain');


    // Manual Streaming
    // Manual streaming is useful when you need custom logic like auth checks, rate limiting per chunk, or transforming data mid-stream.
    // here we are piping stream directly into the response
    readStream.pipe(res);

    // handle stream errors (file deleted mid-read, etc.)
    readStream.on('error', (err) => {
        res.status(500).json({ error: err.message });
    });

})

// serving static file : using express.static(file_name) middleware
app.use('/get-resume-latex',express.static("./my-resume.txt"))

app.listen(3000) ;
