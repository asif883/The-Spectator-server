const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port= process.env.PORT || 5000;



// middleware

//Must remove "/" from your production URL
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://the-spectator-b282d.web.app",
      "the-spectator-b282d.firebaseapp.com",
    ]
  })
);
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.osztyuf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const allArticles = client.db('Newspaper').collection('article');


    // article add
    app.post('/articles', async(req, res)=>{
       const article = req.body;
       const result = await allArticles.insertOne(article);
       res.send(result)

    })
    
    app.get('/articles', async(req,res)=>{
      const cursor = allArticles.find()
      const result = await cursor.toArray()
      res.send(result)
    })
  //  find single article by id
    app.get('/details/:id', async(req , res) =>{
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const job = await allArticles.findOne(query);
      res.send(job)
  })


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res ) =>{
    res.send('Running')
})

app.listen(port, () => {
    console.log(`Server Running on the port ${port}`)
})