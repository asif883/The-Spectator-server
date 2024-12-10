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
    // const pendingCollection = client.db('Newspaper').collection('pendingArticles');


    

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


// add articles
app.post('/add-articles', async( req , res )=>{
  const article = req.body
  const result = await allArticles.insertOne(article)
  res.send(result)
})

// get approve articles 

app.get('/articles' , async ( req, res) =>{
  const {title,  publisher, tags} = req.query 
      
        const query ={}
       
        if(title){
          query.title ={ $regex:title , $options: 'i'}
        }
        if(publisher){
          query.publisher =publisher
        }
        if(tags){
          query.tags = tags
        }

        const articles = await allArticles.find(query).toArray()
        
        const articlesData = await allArticles.find({}, { projection:{ publisher:1 , tags: 1}}).toArray();
  
        const totalArticles = await allArticles.countDocuments()
  
        const publishers = [...new Set(articlesData.map((article)=> article.publisher ))]
        const tag = [...new Set(articlesData.map((article)=> article.tags ))]
  
        res.send({articles, publishers, tag})
})

  // approve article
    app.patch('/article/admin/:id' , async ( req , res) =>{
      const id = req.params.id
      const filter = { _id: new ObjectId(id) }
      const updateDoc = {
          $set: {
              status: "approve"
          }
      }
      const result = await allArticles.updateOne(filter , updateDoc)
      res.send(result)
  })
     // Update
     app.patch('/updateArticle/:id',async (req, res)=>{
      const id =req.params.id;
      const filter= {_id: new ObjectId(id)};
      const options ={upsert: true};
      const updateArticle = req.body
      const update ={
        $set:{
          title:updateArticle.title,
          image:updateArticle.image,
          tags:updateArticle.tags,
          date:updateArticle.date, 
          publisher:updateArticle.publisher,
          description:updateArticle.description, 
          user_name:updateArticle.user_name, 
          user_email:updateArticle.user_email,  
        }
      }
      const result =await allArticles.updateOne(filter,update,options);
      res.send(result)
    })
  
 // make premium
 app.patch('/article/premium/:id' , async ( req , res) =>{
  const id = req.params.id
  const filter = { _id: new ObjectId(id) }
  const updateDoc = {
      $set: {
          isPremium: "yes"
      }
  }
  const result = await allArticles.updateOne(filter , updateDoc)
  res.send(result)
})

// delete articles
app.delete('/articles/:id', async(req , res)=>{
  const id = req.params.id;
  const query = {_id : new ObjectId(id)}
  const result =await allArticles.deleteOne(query);
  res.send(result);
})
  // find articles by email
  app.get('/my-article/:email', async (req , res) =>{
    const email= req.params.email
    const query = {user_email: email}
    const result = await allArticles.find(query).toArray()
    res.send(result)
  })
 
  app.get('/article/:id', async (req, res) => {
    const { id } = req.params;
  
    // console.log(id);
      const article = await allArticles.findOneAndUpdate(
        {_id : new ObjectId(id)}, // Filter criteria
        { $inc: { views: 1 } }, // Increment the views field
        { new: true, useFindAndModify: false }
      )
       if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.json(article);
  })

  // get Trending Articles
  app.get("/articles/trending", async (req, res) => {
  
    const trendingArticles = await allArticles.find()
      .sort({ views: -1 }) 
      .limit(5).toArray(); 

    res.json(trendingArticles);
 
  });

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