const express = require('express')
const app = express()
const cors = require('cors')
const port= process.env.PORT || 5000;


// pass:wmdPrTPmPstOpKf4
// user:News

// middleware

app.use(cors());
app.use(express.json());

app.get('/', (req, res ) =>{
    res.send('Running')
})

app.listen(port, () => {
    console.log(`Server Running on the port ${port}`)
})