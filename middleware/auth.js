const jwt = require("jsonwebtoken")
require("dotenv").config()
const {client} = require("../redis")
const authenticate = async (req,res,next)=>{
    const token = await client.get("token")
    let blacklisted = await client.get("blacklisted");
    if(!token){
        return res.send({"mssg":"Login Again"})
    }
    if(token===blacklisted){
        res.send({"mssg":"login again please"})
    }
    jwt.verify(token,process.env.secret,(error,decode)=>{
        if(decode){
            req.body.userId = decode.userId
            next()
        }else if(error){
            return res.send({"mssg":error.message})
        }
    })
}
module.exports = {authenticate}