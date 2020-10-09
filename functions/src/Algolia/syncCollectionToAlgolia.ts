import * as functions from "firebase-functions";
import algoliasearch from "algoliasearch";
import { error } from "firebase-functions/lib/logger";
import * as admin from "firebase-admin";


// Set up Firestore.
admin.initializeApp();
const db = admin.firestore();

// Set up Algolia.
const algoliaClient = algoliasearch(
  functions.config().algolia.appid,
  functions.config().algolia.apikey
);

/**
 * Syncs a given firebase collection to an algolia index
 * @param collectionName name of the algolia index being synced to
 * @param firebaseCollectionName name of the firebase collection being synced
 * @returns {boolean} returns true/false depending on the success of the sync op,
 */
const syncCollectionToAlgolia = async (
  collectionName: string,
  firebaseCollectionName: string
) => {
  const collectionIndexName = collectionName;
  const collectionIndex = algoliaClient.initIndex(collectionIndexName);

  const algoliaRecords: any[] = [];

  // Retrieve all documents from the firebase collection.
  const querySnapshot = await db.collection(firebaseCollectionName).get();

  querySnapshot.docs.forEach((doc) => {
    const document = doc.data();
    let record = {};
    switch (firebaseCollectionName) {
      case "employers":
        record = {
          objectID: doc.id,
          imageURL: document.imageURL,
          name: document.name,
          numReports: document.numReports,
          score: document.score,
          categorized_incidents: document.categorized_incidents,
          numEmployees: document.numEmployees,
          categories: document.categories
				};
				break;
      case "reports":
        record = {
					objectID: doc.id,
					date: document.date.toDate(),
					dateMillis: document.date._seconds * 1000,
          description: document.description,
          employer: document.employer,
          title: document.title,
          categories: document.categories,
          employerRef: document.employerRef,
				};
				break;
			default:
				error('oops, an unhandled collection was called')
    }
    algoliaRecords.push(record);
  });

  // After all records are created, we save them to
  collectionIndex
    .saveObjects(algoliaRecords, (_error: any, content: any) => {
      return true;
    })
    .catch((err) => {
      console.error(err);
      return false;
    });
};

export default syncCollectionToAlgolia;
