## Streams
- Comes in use when you are working with file system, network, or console logs (uses streams under the hood).
- used when you have to download a large file like a webplayer (like youtube) downloads a video file 

- Data in streams are transferred in chunks of some size .

    ### Types of Streams with code and example
    - *[stream.js](stream.js)* : **Readable , Writeable and Duplex Streams**  

    ---

    - **`Readable Stream`** : A stream that can be read from. It emits data events when data is available to read.  
      
        > **Example** : Readable stream with `event listeners`
        ```js
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
        ```  


        > **Example** : Readable stream using `asynchronous method` with `top level await` approach
        ```js

        const readable = fs.createReadStream("./my-resume.txt" , {
            highWaterMark : 20 // limit of the buffer : 20 BYTES CHUNK // sending 20 Bytes at a time 
        }) ;

        (async () => {
            for await (const chunk of readable){
                console.log("New chunk :",chunk.toString()) ;
            }
        })()
        ```  

    ---

    - **`Writable Stream`** : A stream that can be written to.  

        > **Example** :
        ```js 
            const writable = fs.createWriteStream("./my-new-file.txt") ;
            writable.write("hello,") 
            writable.end("world!") ;
        ```  

    ---

    - **`Duplex Stream`** : A stream that can be both read from and written to. It is the most used version

        `Transform` is a module that helps to transform the data as it is being read or written. It is a type of duplex stream that allows you to modify the data as it passes through the stream.

        >**Example** : using `pipe` ( pipes bad with memory leak , if first pipe fails then second pipe is left hanging in the memory )

         ```js
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

        readable.pipe(upperCase).pipe(writable) ;  
        ```  


        > **Example** : using `pipeline` (pipeline are more efficient and has a single error handing callback unlike pipe where you have create a error callback for each pipe)
        ```js

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

        pipeline(readable,upperCase,writable,(error) => {
            if(error){
                console.error(error) ;
            }
        })
        ```


---

## Sending File over HTTP Server (Express) using Streams

* **Manual Streaming** :   
    * Done by creating a readable stream and piping it to the response object of the server.
    * Manual streaming is useful when you need custom logic like auth checks, rate limiting per chunk, or transforming data mid-stream.

        > **Note** :
        In case of HTTP connection , first `handshaking` is performed and `acknowlegdement` is recieved and then request is sent
       ` Express uses HTTP/1.1` by default the connection stays open for multiple requests , 
        res.send() finalizes the HTTP response on first call —
        it cannot be called multiple times for the same request.
        So we pipe the readable stream into res (a writable stream) using pipe or pipeline ,
        which sends each chunk automatically and 
        calls res.end() when the file is fully transferred. 

        ---

        **Example** : [send-file-manually.js](send-file-manually.js)
        ```js
        const express = require('express') ; 
        const cors = require('cors') ;
        const fs = require('fs') ;

        const app = express() ; 
        app.use(cors()) ;

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
            // here we are piping readStream directly into the response object (res) which is a writable stream
            readStream.pipe(res);

            // handle stream errors (file deleted mid-read, etc.)
            readStream.on('error', (err) => {
                res.status(500).json({ error: err.message });
            });

        })

        ```

---
* **Static File Serving :**
    
    * **using `express.static(path)` middleware**
        * Express has a built-in middleware called `express.static(path)` that serves a specified static file or all the static files from a specified directory path. 
        * It automatically handles streaming the file to the client at the specified route when requested, along with proper headers and error handling.


            **Example** : [send-file-statically.js](send-file-statically.js)
            ```js
                const express = require('express') ; 
                const cors = require('cors') ;
                const fs = require('fs') ;

                const app = express() ; 
                app.use(cors()) ;


                // serving static file : using express.static(file_name) middleware
                app.use('/get-resume-latex',express.static("./my-resume.txt"))

                app.listen(3000) ;
            ```
    ---
    * **using `res.sendFile()`**
        * Another way to serve static files in Express is by using the `res.sendFile()` method. 
        * Used to serve a specific file when a certain route is hit.

            **Example** : [send-file-statically.js](send-file-statically.js)
            ```js
                const express = require('express') ; 
                const cors = require('cors') ;
                const fs = require('fs') ;
                const path = require('path') ;

                const app = express() ; 
                app.use(cors()) ;

                app.get('/file/get-resume-latex', (req, res) => {
                    const filePath = path.join(__dirname, './my-resume.txt');

                    res.sendFile(filePath, (err) => {
                        if (err) res.status(404).json({ error: 'File not found' });
                    });
                });


                app.listen(3000) ;
            ```
        ---  

        > **Note** : Both Methods (`express.static` and `res.sendFile`) automatically sets:
        >- Content-Type: text/plain / image/png / application/pdf etc.
        >- Cache-Control headers
        >- ETag for caching
        >- Supports range requests (partial downloads, video seeking)