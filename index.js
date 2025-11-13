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
    const requestsCollection = db.collection('requests');

     

    
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
     

    app.get('/foods', async (req, res) => {
  const email = req.query.email;
  const query = email ? { donator_email: email } : {};
  const result = await plateConection.find(query).toArray();
  res.send(result);
  });

   
    // request get
    // Get all requests for a specific user
   app.get('/foodRequests', async (req, res) => {
  const userEmail = req.query.userEmail;
  if (!userEmail) return res.status(400).json({ error: "userEmail required" });

  try {
    const requests = await requestsCollection
      .aggregate([
        { $match: { userEmail } },  
        {
          $lookup: {
            from: "foods",
            localField: "food_id",
            foreignField: "_id",
            as: "food"
          }
        },
        { $unwind: { path: "$food", preserveNullAndEmptyArrays: true } },
        { $sort: { createdAt: -1 } }
      ])
      .toArray();

    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});
  

    // Get requests for a specific food owner
  app.get('/requests', async (req, res) => {
  const ownerEmail = req.query.ownerEmail;  // Food Owner email
  const foodId = req.query.foodId;          // Optional filter by food

  const query = { food_owner_email: ownerEmail };
  if (foodId) query.food_id = foodId;

  const result = await requestsCollection.find(query).toArray();
  res.send(result);
  });


  

    
        app.post('/foods', async (req, res) => {
    
       const data = req.body;
       console.log(' Received data:', data);

       const result = await plateConection.insertOne(data);
       res.send({
       success: true,
       result
      });
    
  
    })
    
    // requests POST
 app.post('/requests', async (req, res) => {
  const requestData = req.body;
  console.log('Received request:', requestData);

  const result = await requestsCollection.insertOne({
    ...requestData,
    userEmail: requestData.requester_email, 
    status: 'pending',
    createdAt: new Date()
  });

  res.send({ success: true, result });
  });
 
    
    // Delete 
    app.delete("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await plateConection.deleteOne  (query);
      res.send(result);
    });
    
    
   
    app.delete('/foodRequests/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await requestsCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: "Request not found" });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete request" });
  }
 });


    //request put
    // Accept or Reject a request
 app.put('/requests/:id', async (req, res) => {
  const requestId = req.params.id;
  const { status } = req.body; // 'accepted' বা 'rejected'

  const requestObjectId = new ObjectId(requestId);

  // Update request status
  const result = await requestsCollection.updateOne(
    { _id: requestObjectId },
    { $set: { status } }
  );

  //  accepted 
  if (status === 'accepted') {
    const request = await requestsCollection.findOne({ _id: requestObjectId });
    await plateConection.updateOne(
      { _id: new ObjectId(request.food_id) },
      { $set: { food_status: 'donated' } }
    );
  }

  res.send(result);
 }); 

     

     // UPDATE: Update a food by ID
    app.put("/foods/:id", async (req, res) => {
    const id = req.params.id;
    const updatedFood = req.body;
    const query = { _id: new ObjectId(id) };

    const updateDoc = {
    $set: {
      food_name: updatedFood.food_name,
      food_image: updatedFood.food_image,
      food_quantity: updatedFood.food_quantity,
      pickup_location: updatedFood.pickup_location,
      expire_date: updatedFood.expire_date,
      additional_notes: updatedFood.additional_notes,
     },
   };

  const result = await plateConection.updateOne(query, updateDoc);
  res.send(result);
 });
 
   
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