import cluster from 'node:cluster' ; 
import os from 'node:os' ;
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const  __dirname = dirname(fileURLToPath(import.meta.url)) ;

const cpuCount = os.cpus().length ;

console.log(`Total number of CPUs is ${cpuCount}`) ;
console.log(`Primary pid = ${process.pid}`) ;

// setting up the cluster 
cluster.setupPrimary({
    exec : __dirname + "/index.js" 
}) ;

// creating instances of node js as many as cpu cores 
for(let i = 1 ; i <= cpuCount ; i++){
    cluster.fork() ;  // creates worker process (node js instances)
}

// when instance is crashed or killed 
cluster.on("exit",(worker , code , signal) =>{
    console.log(`worker ${worker.process.pid} has been killed`) ; 
    console.log('Starting another worker') ; 
    cluster.fork() ; 
})