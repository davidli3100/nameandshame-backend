/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
const cors = require("cors")({ origin: true });

export const addEmployer = functions.https.onRequest(async (req, res) => {
  // set pre-fetch response headers for CORS purposes
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
  );

  // wrap the entire function with the cors helper
  return cors(req, res, async () => {
    // set data
    const backgroundImageURL:string = req.body.backgroundImageURL;
    const imageURL:string = req.body.imageURL;
    const name:string = req.body.name;
    const numEmployees:string = req.body.numEmployees;
    const numReports:number = 0;
    const score:number = 0;
    const categories:Array<string> = [];

    const employersRef = admin.firestore().collection("employers");

    // now we literally just send this to firestore
    await employersRef.add({
      backgroundImageURL,
      imageURL,
      name,
      numEmployees,
      numReports,
      score,
      categories,
    }).catch(err => {
      console.log(err);
      res.status(500).send(err);
      throw new Error(err);
    })

    res.status(200).send(true);
  });
});
