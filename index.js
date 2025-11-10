const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;


//Middleware
app.use(cors());
app.use(express.json());

//mangodb


const uri = "mongodb+srv://plateShare:p0kClqYCfBX2KR8C@cluster0.tachy23.mongodb.net/?appName=Cluster0";

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
    await client.connect();
   
    const db = client.db('plateShare-db');
    const plateConection = db.collection('plateShare');
     

    //find
    //findOne

    app.get('/plateShare', async(req, res) => {

      const result = await plateConection.find().toArray()   // await- promise reslove
      console.log(result)

      res.send(result);
    })



    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  } finally {
   
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Server is running')
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
})