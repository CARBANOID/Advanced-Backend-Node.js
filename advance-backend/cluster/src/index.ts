import Express, { type Request, type Response }  from 'express' ;
import cors from "cors"

const app = Express() ;
const port = 3000 ;

app.use(cors()) ;


app.get("/heavy",(req : Request, res : Response) =>{
    let total = 0 ; 
    for(let i = 0 ; i<50_000_000 ; i++){
        total ++ ;
    }
    res.status(200).send(`result of CPU intensive task is ${total}\n`) ; 
}) ;

app.listen(port,() =>{
    console.log(`Server is running on port ${port}`) ;
    console.log(`worker pid = ${process.pid}`) ;
}) ; 