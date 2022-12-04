const express = require("express")
const app = express()
const dotenv = require("dotenv").config()
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")

const port = process.env.PORT

const cors = require("cors")
const bodyParser = require("body-parser")

const User = require("./models/user")

app.use(cors())
app.use(bodyParser.json())

mongoose.connect(`${process.env.MONGODB_URI}`)

mongoose.connection.on("connected", () => {
  console.log("Mongo connected")
})

app.get("/", (req, res) => {
  res.send("Hello World!")
})

const bcrypt = require("bcrypt")
const saltRounds = 10

const generateAccessToken = (username) => {
  return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: "1800s" })
}

app.post("/user/signup", async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      console.log("Username or password is missing")
      return res.status(400).json({ message: "Please enter all fields" })
    }

    let hashedPassword

    try {
      hashedPassword = await bcrypt.hash(password, saltRounds)
    } catch (err) {
      console.log(err)
      res.send(500)
    }

    const user = await User.create({
      username,
      password: hashedPassword,
    })

    const token = generateAccessToken({ username: username })

    console.log("Generated token: " + token)

    res.status(200).json({
      message: "Account created",
      token: token,
    })

    console.log("Account created")
  } catch (err) {
    console.log(err)
    return res.status(400).json({ message: "Something went wrong" })
  }
})

app.post("/user/login", async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      console.log("Username or password is missing")
      return res.status(400).json({ message: "Please enter all fields" })
    }

    const user = await User.findOne({ username })

    if (!user) {
      console.log("User does not exist")
      return res.status(400).json({ message: "User does not exist" })
    }

    try {
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          console.log("Login failed")
          return res.status(200).json({
            message: "Log in failed",
          })
        }
        if (!result) {
          console.log("Login failed")
          return res.status(200).json({
            message: "Log in failed",
          })
        }
        console.log("Login successful")
        const token = generateAccessToken({ username: username })
        console.log("Generated token: " + token)

        res.status(200).json({
          message: "Log in successful",
          token: token,
        })
      })
    } catch (err) {
      res.status(200).json({
        message: "Log in failed",
        token: token,
      })
    }
  } catch (err) {
    res.status(200).json({
      message: "Log in failed",
      token: token,
    })
  }
})

app.post("/user/verify", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (token == null) {
      console.log("Verification failed")
      res.status(401).json({ message: "Please provide a token" })
    }

    jwt.verify(token, String(process.env.TOKEN_SECRET), (err, user) => {
      console.log(user.username)
      res.status(200).json(user.username)
    })
  } catch (err) {
    console.log("Verification Failed")
    res.status(401).json({ message: "Something went wrong" })
  }
})

app.get(
  "/user/auth",
  async (req, res, next) => {
    let token

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        token = req.headers.authorization.split(" ")[1]
        jwt.verify(token, String(process.env.TOKEN_SECRET), (err, user) => {
          console.log("Successfully authenticated " + user.username)
          res
            .status(200)
            .json({ message: "Successfully authenticated " + user.username })
        })

        next()
      } catch (err) {
        console.log("Authentification failed")
        res.status(401).json({
          error: "Unauthorized access",
          messege: err,
        })
        return
      }
    } else {
      console.log("Authentification failed")
      res.status(401).json({
        error: "Please send token properly",
      })
      return
    }

    if (!token) {
      console.log("Authentification failed")
      res.status(401).json({
        error: "Unauthorized - no token found",
      })
      return
    }
  },
  async (req, res) => {
    console.log("Authentication successful")
  }
)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
