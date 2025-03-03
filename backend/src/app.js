const express = require("express")
const cors = require("cors")
const { authRouter } = require("./routes/auth")
const { chatRouter } = require("./routes/chat")
const customResponseRouter = require("./routes/customResponse")
const { errorHandler } = require("./middleware/errorHandler")

const engineeringRouter = require("./routes/engineering")
const productionRouter = require("./routes/production")


const app = express()

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json())

app.use("/api/auth", authRouter)
app.use("/api/chat", chatRouter)
app.use("/api/custom-responses", customResponseRouter)

app.use("/api/engineering", engineeringRouter)
app.use("/api/production", productionRouter)


app.use(errorHandler)

module.exports = app