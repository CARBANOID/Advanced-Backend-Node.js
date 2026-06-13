import { Queue } from "bullmq";
import Redis from "ioredis";

const redis_connection = new Redis(process.env.REDIS_URL,{
    maxRetriesPerRequest : null  // retry to make connection with redis in case it fails
}) ; 

const emailQueue = new Queue("email-queue",{connection : redis_connection}) ; // Queue(queue-name,{ connection : redis_connection} )

export default emailQueue ;