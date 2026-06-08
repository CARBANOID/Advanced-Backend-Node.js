const express = require('express') ; 
const cors = require('cors') ;
const fs = require('fs') ;
const path = require('path');

const app = express() ; 
app.use(cors()) ;

// To serve file statically

/*
express.static(file_name) middleware
*/
app.use('/get-resume-latex',express.static("./my-resume.txt"))


/*
res.sendFile(filePath) 
*/

app.get('/file/get-resume-latex', (req, res) => {
    const filePath = path.join(__dirname, './my-resume.txt');

    res.sendFile(filePath, (err) => {
        if (err) res.status(404).json({ error: 'File not found' });
    });
});


app.listen(3000) ;


/* 
Both Methods automatically sets:
-> Content-Type: text/plain / image/png / application/pdf etc.
-> Cache-Control headers
-> ETag for caching
-> Supports range requests (partial downloads, video seeking)

*/