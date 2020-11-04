/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
const cors = require("cors")({ origin: true });

export const addReport = functions.https.onRequest(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
  return cors(req, res, async () => {
    console.log(req.body.categories);
    const categories = req.body.categories;
    const date = admin.firestore.Timestamp.fromMillis(req.body.date);
    const description = req.body.description;
    const employerRef = req.body.employerRef;
    const title = req.body.title;

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
    categories.every(async (category: string) => {
      if (!employerData?.categories?.includes(category)) {
        // this category was not found
        await admin
          .firestore()
          .collection("employers")
          .doc(employerRef)
          .update({
            categories: admin.firestore.FieldValue.arrayUnion(category),
          })
          .catch((err) => {
            res.status(500).send(err);
            throw new Error(err);
          });
      }
    });

    // increment the employerRef's numReports field
    await admin
      .firestore()
      .collection("employers")
      .doc(employerRef)
      .update({
        numReports: admin.firestore.FieldValue.increment(1),
      })
      .catch((err) => {
        res.status(500).send(err);
        throw new Error(err);
      });

    admin
      .firestore()
      .collection("reports")
      .add({
        categories: categories,
        date: date,
        description: description,
        employer: {
          name: employerData?.name,
          numEmployees: employerData?.numEmployees,
        },
        employerRef: employerRef,
        title: title,
      })
      .then((id) => {
        console.log(`New report with id ${id} added`);
        res.status(200).send(id.id);
        return id;
      })
      .catch((err) => {
        res.status(500).send(err);
        throw new Error(err);
      });
  });
});
