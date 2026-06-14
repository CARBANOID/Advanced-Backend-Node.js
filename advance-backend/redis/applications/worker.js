import { Worker } from "bullmq";
import sendEmail from "./lib/sendEmail.js";
import Redis from "ioredis";

const redis_connection = new Redis(process.env.REDIS_URL,{
    maxRetriesPerRequest : null  
}) ; 

// Worker(queue-name,(job) =>{},redis-connection) // job is the task sended to the queue with it's data
const emailWorker = new Worker('email-queue',async(job) =>{
    console.log("Job Started") ;
    const email = job.data.email ;
    await sendEmail(email) ;
    console.log("Job Completed") ;
},{connection : redis_connection})   ;
