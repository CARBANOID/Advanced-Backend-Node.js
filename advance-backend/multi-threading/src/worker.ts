import { parentPort } from 'worker_threads' ;

let counter = 0 ; 
for(let i = 0 ; i<20_000_000_000 ; i++){
    counter ++ ;
}

// postMessage is the way to communicate with the main thread from worker or different thread
parentPort?.postMessage(counter) ; 
