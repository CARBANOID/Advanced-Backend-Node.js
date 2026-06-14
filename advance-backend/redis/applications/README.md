### Packages to install 
* express  : to create http server
* mongoose : to use mongodb
* ioredis  : to use redis 

### To install all package
```bash
npm install
```

---
### To run the code
```bash
npm run dev
```

---
### Booting
* Run the `docker-compose.yml` to start the redis

```sh
docker compose up
```


* start the express server
```sh
npm run dev
```

---

### Redis (How to use to store the API Data) 

* Store the url of redis in the .env file  

    ```sh
    REDIS_URL : redis://localhost:<port>
    ```
    *here the redis is running on port `6379` , therefore redis url is*

    ```
    REDIS_URL=redis://localhost:6379
    ```
---

* import the `Redis` from `ioreds` module

```js
import Redis from 'ioredis'
```

---

* create an instance of redis and pass REDIS_URL inside it

```js
const redis = new Redis(process.env.REDIS_URL) ;
```

> **Note** : use `redis` to store the frequently used data 

---

* how to store the data in redis 

```js
await redis.set('key' , 'value') ;
```
**key : string , value : string** 

> NOTE : *redis stores the data in string format*  

---
* how to get the data from redis 

```js
const value = await redis.get('key') ;
```

---
* Redis Example : Storing API Data (GET /users.with-redis) in Redis Cache 

    [index.js](index.js)
    ```js

    import Redis from 'ioredis'

    const redis = new Redis(process.env.REDIS_URL) ;

    app.get("/user.with-redis",async(req,res) =>{
        // Find in redis
        const cached_users = await redis.get("user:all") ; 
        if(cached_users){  
            return res.json(JSON.parse(cached_users)) ; // data is found in redis
        }

        // data not found in cache 
        const users = await User.find({}) ; // get data from db
        await redis.set("user:all",JSON.stringify(users)) ; // store data in redis
        return res.json(users) ; 
    })

    ```

### Issue with redis 

* Redis store the `cached data` , but if the data get `updated` in the future then redis will provide the `old cached data` , therefore the data must refreshed in some time , it is also called `TTL(Time to Live)` .

    ## How to prevent this ? 

    **1) By Deleting the cached data after updating the data in db**
    - how to delete the cached data from redis
        ```js
        await redis.del('key') ;
        ```
    - example : [index.js](index.js)
        ```js
        app.post("/user",async(req,res) =>{
            const {name , email , password} = req.body ;
            const user = await User.create({
                name , email , password
            })

            redis.del("user:all") ; // delete the cached data from redis after updating the data in db

            return res.json(user) ; 
        })
        ```

    ---
    
    ### OTP Verification (By generating temporary codes for a specific period of time)

    ---

    **2) By setting the TTL for the cached data**
    - **Use Case : `OTP Verification` (By generating temporary codes for a specific period of time)** 
        *   store the data in redis with TTL
            ```js
            await redis.set('key' , 'value', 'EX' , TTL_IN_SECONDS) ; 
            ```
        
        * example : [index.js](index.js)
            ```js
            app.post("/send-otp",async(req,res) =>{
                const {email} = req.body ; 
                const otp  = Math.floor(Math.random() * 10000000).toString() ;
                await redis.set(`otp:${email}`,otp,"EX",30) ;  // TTL: 30 second 
                return res.send(otp) ;
            })

            app.post("/verify-otp",async(req,res) =>{
                const {email , code} = req.body ; 
                const otp = await redis.get(`otp:${email}`) ;

                if(!otp){
                    return res.json({
                        status : "OTP Expired"
                    }) ;    
                }

                res.del(`otp:${email}`) ;
                
                return res.json({
                    status : (otp == code) ? "correct" : "incorrect"
                }) ;
            })
            ```

---

### Session Management (By generating temporary session for a specific period of time and store it in redis) 

```js
const token = jwt.sign(
    {userId : user._id} , 
    process.env.JWT_SECRET_KEY
) ;

await redis.set(
    `session:${token}`,
    user._id.toString(),
    "EX",
    3600 // TTL : 1 hour
) ; 

res.cookie("token",token,{
  httpOnly: true,   // not accessible via JS (XSS safe)
  secure: true,     // HTTPS only
  sameSite: "strict" // CSRF protection
}) ;
```

---

### Rate Limiting (Allowing Limited amount of request for a specific period of time) 

* **Usecase** : to prevent
    * **Brute Force Atta**ck (password guess)
    * **Spam** (API spam)
    * **DDOS** (server overload)
    * **Bot Abuse** (fake traffic)  
  
* **Redis Command Used :**
    * **INCR** : to increment the count of requests
    * **EXPIRE** : to reset the count after passing  TTL

* **How to use ?** : 
    * Create a middleware to handle the rate limiting logic
    * Attach the middleware to those routes(API) which you want to protect from abuse

    * [rateLimiter.js](middleware/rateLimiter.js) : Rate Limiting Middleware
        ```js
            import { redis } from "../index.js";

            const rateLimiter = async (req,res,next) =>{
                const ip = req.ip ; 
                const key = `rate_limit:${ip}` ;
                const requests = await redis.incr(key) ;  // at starting(when first request comes) the count is 0 

                if(requests == 1){
                    await redis.expire(key,60) ;  // reset the count to 0
                }

                const ttl = await redis.ttl(key) ; // for how much time , this key is valid

                if(requests > 5){
                    return res.status(429).json({
                        message : "Too Many Requests",
                        retryAfter : ttl 
                    })
                }

                next() ;
            }

            export default rateLimiter ;
        ```

    * [index.js](index.js) : Attaching the Rate Limiting Middleware to the API Route
        ```js
            app.post("/login",rateLimiter,async(req,res) =>{
                const { email , password } = req.body ; 
                const user = await User.findOne({
                    email
                })

                if(user.password != password){
                    return res.status(403).json({
                        message : "incorrect password !!"
                    })
                }

                return res.status(200).json({
                    message : "login successfull"
                })
            })
        ```

---

### Queues
* waiting line in which backend tasks are stored which are executed in the background by workers without making the user wait .

* **Application :**
    * Sending an email to the user after signup
    * Notification
    * Analytics

    [sendEmail.js](lib/sendEmail.js) : Function to send email
    ```js
    const sendEmail = async() =>{
        await new Promise((resolve) =>{
            setTimeout(resolve,5000) ;
        })   
        
        console.log("Task Completed") ;
    }

    export default sendEmail ;
    ```

    **eg : without `queue`**
    ```js
    app.post("/signup",async(req,res) =>{
        const {name , email , password} = req.body ;

        const user = await User.create({
            name , email , password
        }) ;
         
        await sendEmail() ; // sending email

        res.json({
            message : "Signup Successfull"
        })
    })

    ```

    **eg : with `queue`**
    ```js
    app.post("/signup",async(req,res) =>{
        const {name , email , password} = req.body ;

        const user = await User.create({
            name , email , password
        }) ;
         
        await emailQueue.add( // sending email in background
            "send-email",{
                email : user.email ,
            }
        ) ; 

        res.json({
            message : "Signup Successfull"
        })
    })

    ```
    
    ---

    ### BullMQ (Redis-based Queue Management Library)
    [https://docs.bullmq.io/readme-1]
    
    * **Components** 
        * **Queue** : Jobs Store
        * **Job** : Task
        * **Worker** : jobs process

    * Install the `bullmq` package 

        ```sh
            npm install bullmq
        ```

    * How to to create a Queue
        * Syntax : 
        
            ```js
            import { Queue } from "bullmq" ;

            const redis_connection = new Redis(process.env.REDIS_URL,{
                maxRetriesPerRequest : null  
            }) ; 

            new Queue(queue_name,{
                connection : redis_connection
            }) ;
            ```
        
        * example : [queue.js](queue.js)
            ```js
            import { Queue } from "bullmq";
            import Redis from "ioredis";

            const redis_connection = new Redis(process.env.REDIS_URL,{
                maxRetriesPerRequest : null  
            }) ; 

            const emailQueue = new Queue("email-queue",{connection : redis_connection}) ; 

            export default emailQueue ;
            ```

    * Adding Job to Queue (emailQueue)
        * Syntax

            ```js
            emailQueue.add(job-name,data-to-send-to-worker)
            ```

        * example : [index.js](index.js)
            ```js
            app.post("/signup",async(req,res) =>{
                const {name , email , password} = req.body ;
                const user = await User.create({
                    name , email , password
                })

                await emailQueue.add("send-email",{ // to add the job in queue
                    email
                }) ; // .add(job-name,data-to-send-to-worker)

                redis.del("user:all") ;

                return res.json(user) ; 
            })
            ```

    * Creating the Worker for emailQueue

        * Syntax
            ```js
            Worker(queue-name,(job) =>{},{connection : redis-connection}) 
            ```
            *job is the task sended to the queue with it's data*

        * [worker.js](worker.js)

            ```js
            import { Worker } from "bullmq";
            import sendEmail from "./lib/sendEmail.js";
            import Redis from "ioredis";

            const redis_connection = new Redis(process.env.REDIS_URL,{
                maxRetriesPerRequest : null  
            }) ; 

            const emailWorker = new Worker('email-queue',async(job) =>{
                console.log("Job Started") ;
                const email = job.data.email ;
                await sendEmail(email) ;
                console.log("Job Completed") ;
            },{connection : redis_connection})   ;
            ```
        
        * Run the worker seprately

            ```sh 
            node worker.js
            ```
            
        * Run the server

            ```sh
            npm run dev
            ```