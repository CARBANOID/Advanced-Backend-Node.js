import { workerData , parentPort } from 'worker_threads' ;

let counter = 0 ; 

// the number of worker parameter comes from main thread 
// here 4 workers will do 5_000_000_000 iterations each and send it to main thread
for(let i = 0 ; i<20_000_000_000 / workerData.thread_count ; i++){
    counter ++ ;
}

// postMessage is the way to communicate with the main thread from worker or different thread
parentPort?.postMessage(counter) ; 
