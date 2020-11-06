/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import notifySubscribers from "./notifySubscribers";
import isProfane from "../Moderation/moderation";
const cors = require("cors")({ origin: true });

export const addReport = functions.https.onRequest(async (req, res) => {
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
    const categories = req.body.categories;
    const date = admin.firestore.Timestamp.fromMillis(req.body.date); // using the firebase library to convert date formats
    const description = req.body.description;
    const employerRef = req.body.employerRef;
    const title = req.body.title;
    /*
    * moderation
    */
    if(isProfane(title) || isProfane(description)){
      res.status(500).send("is profane");
    }
    
    /**
     * Using batching and transactions to safely commit to multiple documents
     */
    const batch = admin.firestore().batch();
    const employersRef = admin.firestore().collection("employers");
    const reportsRef = admin.firestore().collection("reports");

    // grab the employer from firestore
    const employerData = await (
      await admin
        .firestore()
        .collection("employers")
        .doc(employerRef)
        .get()
        .catch((err) => {
          res.status(500).send(err);
          throw new Error(err);
        })
    ).data();

    // check to see if the employer record needs to have any new categories added to it from this report
    const employerCategories = employerData?.categories?.map((category:string) => category.toLowerCase())

    categories.every(async (category: string) => {
      if (!employerCategories.includes(category.toLowerCase())) {
        // this category was not found, add it to the employer doc
        batch.update(employersRef.doc(employerRef), {
          categories: admin.firestore.FieldValue.arrayUnion(category),
        });
      }
    });

    // increment the employerRef's numReports field
    batch.update(employersRef.doc(employerRef), {
      numReports: admin.firestore.FieldValue.increment(1),
    });

    // finally, add the report into firestore
    batch.create(reportsRef.doc(), {
      categories: categories,
      date: date,
      description: description,
      employer: {
        name: employerData?.name,
        numEmployees: employerData?.numEmployees,
      },
      employerRef: employerRef,
      title: title,
    });

    // commit the batched writes and updates
    await batch.commit().catch((err) => {
      console.log(err);
      res.status(500).send(err);
      throw new Error(err);
    });

    // now we send the emails to notify people
    await notifySubscribers(employerRef, {
      categories: categories,
      date: date,
      description: description,
      employer: {
        name: employerData?.name,
        numEmployees: employerData?.numEmployees,
      },
      employerRef: employerRef,
      title: title,
    }).catch(err => {
      console.error("Error in notifying subscribers: ", err);
    })

    res.status(200).send(true);
  });
});
