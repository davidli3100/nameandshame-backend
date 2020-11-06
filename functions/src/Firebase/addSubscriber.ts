/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
const cors = require("cors")({ origin: true });

export const addSubscriber = functions.https.onRequest(async (req, res) => {
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
    const email:string = req.body.email;
    const employer:string = req.body.employer;

    const employerRef = admin.firestore().collection("employers").doc(employer);

    // now we literally just send this to firestore
    const employerID = await employerRef.update({
      subscribers: admin.firestore.FieldValue.arrayUnion(email)
    }).catch(err => {
      console.log(err);
      res.status(500).send(err);
      throw new Error(err);
    })

    res.status(200).send(true);
  });
});
