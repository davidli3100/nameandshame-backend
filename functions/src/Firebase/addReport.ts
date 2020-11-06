import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const addReport = functions.https.onCall(async (data, context) => {
  const categories = data.tags;
  const date = admin.firestore.FieldValue.serverTimestamp();
  const description = data.description;
  const employerRef = data.employerRef;
  const title = data.title;

  // grab the employer from firestore
  const employerData = await (
    await admin.firestore().collection("employers").doc(employerRef).get()
  ).data();
  
  // check to see if the employer record needs to have any new categories added to it from this report
  categories.every(async (category: string) => {
    if (!employerData?.categories.includes(category)) {
      // this category was not found
      await admin
        .firestore()
        .collection("employers")
        .doc(employerRef)
        .update({
          categories: admin.firestore.FieldValue.arrayUnion(category),
        })
        .catch((err) => {
          throw new Error(err);
        });
    }
  });

  // increment the employerRef's numReports field
  await admin
    .firestore()
    .collection("employer")
    .doc(employerRef)
    .update({
      numReports: admin.firestore.FieldValue.increment(1),
    })
    .catch((err) => {
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
      //TODO update categories and numreports in employers
      console.log(`New report with id ${id} added`);
      return id;
    })
    .catch((err) => {
      throw new Error(err);
    });
});
