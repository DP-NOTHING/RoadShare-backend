const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const env = require("dotenv").config();
const path = require("path");
const app = express();

var admin = require("firebase-admin");
let serviceAccount = require('./gasup-c156c-firebase-adminsdk-nsg9q-6205a9e642.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function decodeIDToken(req, res, next) {
  if (
    req &&
    req.headers &&
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    const idToken = req.headers.authorization.split("Bearer ")[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log(decodedToken);
      req["currentUser"] = decodedToken;
    } catch (err) {
      console.log(err);
    }
  }
  next();
}

app.use(decodeIDToken); // for firebase authentication.

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  next();
});

const driveAPIs = require("./apis/SessionApi.js");
const carAPIs = require("./apis/CarApi.js");
const routeAPIs = require("./apis/RouteApi.js");
const signupAPIs = require("./apis/SignUpApi.js");
const profileAPIs = require("./apis/ProfileApi.js");

driveAPIs.apis(app, admin);
carAPIs.apis(app, admin);
routeAPIs.apis(app, admin);
signupAPIs.apis(app, admin);
profileAPIs.apis(app, admin);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
