import {exec ,execFile ,spawn ,fork } from "child_process" ;
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url)) ;

// There a 2 Ways to Create a Child Process

/*
1) exec(command,callback) :
* Spawns a shell then executes the command within that shell, buffering any generated output.
* buffers entire output in memory, gives it to you all at once 
* good for small output (dir listing, git status)
* this did not spin up a new child process cause we are simply executing a command in command line , we are not targeting a node process
*/

// exec('dir',(error , stdout , stderr) => {
//     if(error) {
//         console.error(`error : ${error.message}`) ; 
//         return ; 
//     }

//     if(stderr) {
//         console.error(`stderr : ${stderr}`) ; 
//         return ; 
//     }

//     console.log(`stdout :\n${stdout}`)
// });



// ----------------------------------------------



/*
2) execFile(command,args,callback) : Use when you want to run a external script and file 
*/

// const fileProcessorPath = path.resolve(__dirname,'execFileProcessor.js') ; // path resolver

// here command is to run this file (node execFileProcessor.js)
// execFile('node',[fileProcessorPath],(error, stdout, stderr) =>{
//     if(error) {
//         console.error(`error : ${error.message}`) ; 
//         return ; 
//     }

//     if(stderr) {
//         console.error(`stderr : ${stderr}`) ; 
//         return ; 
//     }

//     console.log(`stdout :\n${stdout}`)
// });



// ----------------------------------------------



/*
spawn(command,options) :
* streams daat chunk by chunk via stdout readable stream
* good for large output (find, logs, ffmpeg, video processing)
* event driven (callback are asynchronous since they are pushed into event loops)
* The spawn() method spawns a new process using the given command, with command-line arguments in args. If omitted, args defaults to an empty array.
*/

// const spawnedChild = spawn('dir', ['/s', '/b'],  { shell: true }) ;

// spawnedChild.stdout.on('data',(data) =>{
//     console.log(`stdout :\n${data}`)
    
// })

// spawnedChild.stderr.on('data',(data) =>{
//     console.error(`stderror : ${data}`) ; 
// })

// spawnedChild.on('error',(error) =>{
//     console.error(`error : ${error.message}`) ; 
// })

// spawnedChild.on('close',(code) =>{
//     console.log(`child process exited with code :\n${code}`)
    
// })



// ----------------------------------------------



/*
fork : allows the child process to communicate each other

*/

const forkProcessorPath = path.resolve(__dirname,'forkProcessor.js') ;
const forkChild = fork(forkProcessorPath) ; 

forkChild.on('message',(msg) =>{
    console.log('Message from data processor exchange',msg) ;
})

// sending message to another child process
forkChild.send({hello : 'world'}) ;

