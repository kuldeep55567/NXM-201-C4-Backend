const express = require("express")
const weather_Router = express.Router()
const { authenticate } = require("../middleware/auth")
const {client} = require("../redis")
require("dotenv").config()
const axios= require("axios")
weather_Router.get("/weather/:city",authenticate,async (req, res) => {
    let city = req.params.city
   try {
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city},uk&APPID=${process.env.my_api_key}`)
   client.set("response",response)
   client.expire("response", 72000)
   res.send(response)
} catch (error) {
    res.send(error);
   }
})
module.exports = { weather_Router }