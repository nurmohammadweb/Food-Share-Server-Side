const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;


//Middleware
app.use(cors());
app.use(express.json());




const uri = "mongodb+srv://plateShare-db:CTbV0usTalCDvRel@cluster0.tachy23.mongodb.net/?appName=Cluster0";


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
    const plateConection = db.collection('foods');
     

    //find
    //findOne
    // allfoods
    app.get('/foods', async(req, res) => {

      const result = await plateConection.find().toArray()   // await- promise reslove
      console.log(result)

      res.send(result);
    })
    
    //top food quantity foods
    app.get('/foods/top', async (req, res) => {
      try {
        const result = await plateConection
          .find()
          .sort({ food_quantity: -1 })
          .limit(6)
          .toArray();

        res.send(result);
      } catch (error) {
        console.error("Error fetching top foods:", error);
        res.status(500).send({ message: "Failed to load top foods" });
      }
    });

  

    app.get('/foods/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id)
      const object =   new ObjectId(id)

       const result = await plateConection.findOne({_id:object})

      res.send({
        success: true,
        result
      })
    } )
     

   // ManageMyFoods 
   app.get("/foods", async (req, res) => {
    const email = req.query.email;
    const query = email ? { donator_email: email } : {};
    const result = await plateConection.find(query).toArray();
     res.send(result);
   });


    //insertmany
    //insertOne
    //add food 

    
        app.post('/foods', async (req, res) => {
    
       const data = req.body;
       console.log(' Received data:', data);

       const result = await plateConection.insertOne(data);
       res.send({
       success: true,
       result
      });
    
  
    })
   




   
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
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