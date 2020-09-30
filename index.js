const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

const admin = require("firebase-admin");

const serviceAccount = require("./configs/burj-al-arab-14121-firebase-adminsdk-5d2ao-057aff010e.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://burj-al-arab-14121.firebaseio.com"
});

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ioamv.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const booking = client.db("burjAlArab").collection("bookings");
    // perform actions on the collection object
    //console.log("database connected")
    app.post('/addBooking', (req, res) => {
        const newBooking = req.body;
        //console.log(newBooking);
        booking.insertOne(newBooking)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })
    app.get('/bookings', (req, res) => {
        const bearer=req.headers.authorization;
        if(bearer && bearer.startsWith('Bearer ')){
            const idToken=bearer.split(' ')[1];
            console.log({idToken});
            admin.auth().verifyIdToken(idToken)
            .then(function (decodedToken) {
                let tokenEmail = decodedToken.email;
                if(tokenEmail==req.query.email){
                    booking.find({email:req.query.email})
                    .toArray((err,document)=>{
                       res.status(200).send(document);
                    })

                }
                else{
                    res.status(401).send("un-authorised access");
                }
                
            }).catch(function (error) {
                res.status(401).send("un-authorised access")
            });
        }
        else{
            res.status(401).send("un-authorised access");
        }
    
        
             

          })
    });

    app.get('/', (req, res) => {
        res.send('hello');
    });
    app.listen(3003);