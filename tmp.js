// https://itnext.io/building-a-serverless-restful-api-with-cloud-functions-firestore-and-express-f917a305d4e6

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const firebaseHelper = require("firebase-functions-helper/dist");
const express = require("express");
const bodyParser = require("body-parser");

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();
const contactsCollection = "contacts";
const firestore = firebaseHelper.firestore;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Hello World");
});

const api = express();
app.use("/api/v1", api);

api.get("/", (req, res) => {
  res.send("Welcome to JAG REST API..");
});

// Add headers
api.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  ); // If needed
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  ); // If needed
  res.setHeader("Access-Control-Allow-Credentials", true); // If needed

  // Pass to next layer of middleware
  next();
});

// Add new contact
api.post("/contacts", async (req, res) => {
  console.log("post:contacts", JSON.stringify(req.body));
  try {
    const contact = {
      firstName: req.body["firstName"],
      lastName: req.body["lastName"],
      email: req.body["email"]
    };
    const newDoc = await firestore.createNewDocument(
      db,
      contactsCollection,
      contact
    );

    console.log("success: post:contacts");
    res.status(201).send({ id: newDoc.id, ...contact });
  } catch (error) {
    console.log("err: post:contacts", error);
    res
      .status(400)
      .send(`Contact should only contains firstName, lastName and email!!!`);
  }
});
// Update new contact
api.patch("/contacts/:contactId", async (req, res) => {
  const { firstName, lastName, email } = req.body;
  const updatedContact = { firstName, lastName, email };
  const updatedDoc = await firestore.updateDocument(
    db,
    contactsCollection,
    req.params.contactId,
    updatedContact
  );
  res.status(204).send(`Update a new contact: ${updatedDoc.id}`);
});
// View a contact
api.get("/contacts/:contactId", (req, res) => {
  const id = req.params.contactId;
  firestore
    .getDocument(db, contactsCollection, id)
    .then(doc => res.status(200).send({ id, ...doc }))
    .catch(error => res.status(400).send(`Cannot get contact: ${error}`));
});
// View all contacts
api.get("/contacts", (req, res) => {
  firestore
    .backup(db, contactsCollection)
    .then(data => {
      const contacts = Object.keys(data.contacts).map(id => ({
        id,
        ...data.contacts[id]
      }));
      return res.status(200).send(contacts);
    })
    .catch(error => res.status(400).send(`Cannot get contacts: ${error}`));
});

// Delete a contact
api.delete("/contacts/:contactId", async (req, res) => {
  const deletedContact = await firestore.deleteDocument(
    db,
    contactsCollection,
    req.params.contactId
  );
  res.status(204).send(`Contact is deleted: ${deletedContact}`);
});

exports.webApi = functions.https.onRequest(app);

// app.listen(8080, () => { console.log("Server started"); });

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
