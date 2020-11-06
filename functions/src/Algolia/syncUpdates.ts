import * as functions from "firebase-functions";
import algoliasearch from "algoliasearch";
import * as admin from "firebase-admin";

// Set up Firestore.
const db = admin.firestore();

const env = functions.config();

const client = algoliasearch(env.algolia.appid, env.algolia.apikey);
const employersIndex = client.initIndex(`Employers`);
const reportsIndex = client.initIndex(`Reports`);

/**
 * Syncs the employers collection on firestore to algolia
 */
export const syncEmployerUpdates = functions.firestore
  .document(`employers/{doc}`)
  .onWrite(async (change, _context) => {
    const oldData = change.before;
    const newData = change.after;
    const data = newData.data();
    const objectID = newData.id;

    if (!oldData.exists && newData.exists) {
      // object is new, therefore we have to create a new record in algolia
      return employersIndex.saveObject(
        Object.assign(
          {},
          {
            objectID,
          },
          data
        )
      );
    } else if (!newData.exists && oldData.exists) {
      // if the firestore record isnt there anymore, delete from algolia
      return employersIndex.deleteObject(oldData.id);
    } else {
      // else, the is probably an update to the record, update the algolia record
      return employersIndex.saveObject(
        Object.assign(
          {},
          {
            objectID,
          },
          data
        )
      );
    }
  });

  export const syncReportUpdates = functions.firestore
  .document(`reports/{doc}`)
  .onWrite(async (change, _context) => {
    const oldData = change.before;
    const newData = change.after;
    const data = newData.data();
    const objectID = newData.id;

    if (!oldData.exists && newData.exists) {
      // creating report
      return reportsIndex.saveObject(
        Object.assign(
          {},
          {
            objectID,
          },
          data,
          {
            dateMillis: data?.date?._seconds * 1000,
          }
        )
      );
    } else if (!newData.exists && oldData.exists) {
      // deleting report

      // first decrement the report's employer's numReports field
      db.collection('employers').doc(oldData?.data()?.employerRef).update({
        numReports: admin.firestore.FieldValue.increment(-1)
      })

      return reportsIndex.deleteObject(objectID);
    } else {
      // updating
      return reportsIndex.saveObject(
        Object.assign(
          {},
          {
            objectID,
          },
          data,
          {
            dateMillis: data?.date?._seconds * 1000
          }
        )
      );
    }
  });
