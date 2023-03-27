const redis = require("redis")
const client = redis.createClient();
client.on("error",err=>console.log("error while connecting to redis server",err))
client.on("connect",()=>{
    console.log("Connected to redis Server");
})
client.connect();
module.exports = {client}