import express from 'express'
import dotenv from 'dotenv' 
import connectDB  from './lib/db.js'
import User from './model/user.model.js'
import Redis from 'ioredis'
import rateLimiter from './middleware/rateLimiter.js'
import sendEmail from './lib/sendEmail.js'
import emailQueue from './queue.js'

dotenv.config() ; 

const port = process.env.PORT || 5000 

const app = express() ; 

export const redis = new Redis(process.env.REDIS_URL,{
    maxRetriesPerRequest : null  // retry to make connection with redis in case it fails
}) ;

app.use(express.json()) ;

app.get("/",(req,res) => {
    return res.status(200).json({message : `hello from backend ${process.env.SERVER_NAME}`})
})

app.post("/user",async(req,res) =>{
    const {name , email , password} = req.body ;
    const user = await User.create({
        name , email , password
    })

    redis.del("user:all") ;

    return res.json(user) ; 
})

app.get("/user.without-redis",async(req,res) =>{
    const user = await User.find({}) ;
    return res.json(user) ; 
})

// 
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


app.listen(port ,async() => {
    await connectDB() ;
    console.log(`server started at port ${port}`) ; 
}) 