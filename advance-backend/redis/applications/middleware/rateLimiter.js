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