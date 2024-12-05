const express = require('express')
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken');
require('dotenv').config()
const port= process.env.PORT || 5000;



// middleware


app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://the-spectator-b282d.web.app",
      "https://the-spectator-b282d.firebaseapp.com",
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
    await client.connect();

    const allArticles = client.db('Newspaper').collection('article');
    const allUsers = client.db('Newspaper').collection('users');
    const publisherCollection = client.db('Newspaper').collection('publishers');
    const pendingCollection = client.db('Newspaper').collection('pendingArticles');


    // // article add
    // app.post('/articles', async(req, res)=>{
    //    const article = req.body;
    //    const result = await allArticles.insertOne(article);
    //    res.send(result)

    // })
    
    // app.get('/articles', async(req,res)=>{
    //   const cursor = allArticles.find()
    //   const result = await cursor.toArray()
    //   res.send(result)
    // })
  //  find single article by id

    app.get('/details/:id', async(req , res) =>{
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const job = await allArticles.findOne(query);
      res.send(job)
  })

  // add user

  app.post('/users' , async ( req , res) =>{
    const user = req.body
    const result = await allUsers.insertOne(user)
    res.send(result)
  })
  // get all users
  app.get('/allUsers', async (req ,res) =>{
    const result = await allUsers.find().toArray()
    res.send(result)
  })

  // get user by email
  app.get('/user/:email' , async ( req, res )=>{
    const query = {email: req.params.email}
    const user = await allUsers.findOne(query)
    res.send(user)   
  })

    // make admin
    app.patch('/users/admin/:id' , async ( req , res) =>{
      const id = req.params.id
      const filter = { _id: new ObjectId(id) }
      const updateDoc = {
          $set: {
              role: "admin"
          }
      }
      const result = await allUsers.updateOne(filter , updateDoc)
      res.send(result)
  })

      // delete 
      app.delete('/users/:id', async(req , res)=>{
        const id = req.params.id;
        const query = {_id : new ObjectId(id)}
        const result =await allUsers.deleteOne(query);
        res.send(result);
      })

    // add publisher
    app.post('/publisher', async (req, res) =>{
      const info = req.body
      const result = await publisherCollection.insertOne(info)
      res.send(result)
    })

  //  get publisher
  app.get('/all-publisher' , async ( req, res) =>{
      const publisher = await publisherCollection.find().toArray()
      res.send(publisher)
  })

// pending articles
app.post('/pending-articles', async( req, res )=>{
  const article = req.body
  const result = await pendingCollection.insertOne(article)
  res.send(result)
})

// get pending articles
app.get('/all-pending-articles' , async( req , res) =>{
  const result = await pendingCollection.find().toArray()
  res.send(result)
})
// delete article
app.delete('/all-pending-articles/:id', async(req , res)=>{
  const id = req.params.id;
  const query = {_id : new ObjectId(id)}
  const result =await pendingCollection.deleteOne(query);
  res.send(result);
})

// approve articles
app.post('/approve', async( req , res )=>{
  const article = req.body
  const result = await allArticles.insertOne(article)
  res.send(result)
})

// get approve articles 
app.get('/articles' , async ( req, res) =>{
  const articles = await allArticles.find().toArray()
  res.send(articles)
})

  // jwt   
app.post('/authentication', async ( req , res )=>{
  const userEmail = req.body;
  const token = jwt.sign(userEmail , process.env.ACCESS_TOKEN, 
    { expiresIn: '1d'})
    res.send({token})
 })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
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