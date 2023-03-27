const express = require("express")
const { userModel } = require("../model/user.model")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
require("dotenv").config()
const { client } = require("../redis")
const userRouter = express.Router()
userRouter.get("/",(req,res)=>{
    res.send({"mssg":"Welcome to Backend-Server"})
})
userRouter.post("/register", async (req, res) => {
    const { name, email, password } = req.body
    try {
        const ifExists = await userModel.findOne({ email })
        if (ifExists) {
            return res.send({ "mssg": 'User Already exists' })
        }
        let hashed = bcrypt.hashSync(password, 10)
        const user = await new userModel({ name, email, password: hashed })
        user.save()
        res.send({ "mssg": "user registered successfully" })
    } catch (error) {
        res.send({ "mssg": error.message })
    }
})
userRouter.post("/login", async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await userModel.findOne({ email })
        if (user) {
            const isEqual = await bcrypt.compare(password, user.password)
            if (isEqual) {
                let token = jwt.sign({ userId: user._id }, process.env.secret, { expiresIn: "1hr" })
                let refresh_token = jwt.sign({ userId: user._id }, process.env.refresh_secret, { expiresIn: "24hr" })
                await client.set("token", token)
                await client.expire("token", 900)
                await client.set("refresh_token", refresh_token)
                await client.expire("token", 9000)
                res.send({ "mssg": "Login successfull" })
            } else {
                res.send({ "mssg": "Wrong Credentials" })
            }
        } else {
            res.send({ "mssg": "login-first" })
        }
    } catch (error) {
        res.send({ "mssg": error.message })
    }
})
userRouter.get("/logout", async (req, res) => {
    const token = await client.get("token")
    try {
        await client.set("blacklisted", token)
        res.send({ "mssg": "Logout Successfull" })
    } catch (error) {
        res.send({ "mssg": error.message })
    }
})
userRouter.get("/refresh", async (req, res) => {
    try {
        const refresh_token = await client.get("refresh_token")
        let decode = jwt.verify(refresh_token, process.env.refresh_secret)
        if (decode) {
            let token = jwt.sign({ userId: decode.userId }, process.env.secret, { expiresIn: "5m" })
            await client.set("token", token)
            await client.expire("token", 10)
            res.send({ "mssg": "Login Successfull again" })
        } else {
            res.send({ "mssg": "login again" })
        }
    } catch (error) {
        res.send({ "mssg": error.message })
    }
})
module.exports = { userRouter }