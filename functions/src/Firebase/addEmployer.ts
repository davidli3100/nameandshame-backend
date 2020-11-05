/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
const cors = require("cors")({ origin: true });

export const addEmployer = functions.https.onRequest(async (req, res) => {
  // set pre-fetch response headers for CORS purposes
  res.set("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
  );

  // wrap the entire function with the cors helper
  return cors(req, res, async () => {
    // set data
    const backgroundImageURL:string = req.body.backgroundImageURL;
    const imageURL:string = req.body.imageURL;
    const name:string = req.body.employer;
    const numReports:number = 0;
    const score:number = 0;
    const categories:Array<string> = [];
    let numEmployees:number = req.body.numEmployees;

    // manual override for employees
    if (numEmployees > 10000) numEmployees = 10000;

    const employersRef = admin.firestore().collection("employers");
    admin.firestore().settings({ ignoreUndefinedProperties: true })

    // now we literally just send this to firestore
    const employerID = await employersRef.add({
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

    res.status(200).send(employerID.id);
  });
});
