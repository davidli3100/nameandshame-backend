// Import all needed modules.
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import algoliasearch from "algoliasearch";
import { error } from "firebase-functions/lib/logger";

// Set up Firestore.
admin.initializeApp();
const db = admin.firestore();

// Set up Algolia.
const algoliaClient = algoliasearch(
  functions.config().algolia.appid,
  functions.config().algolia.apikey
);

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

// Create a HTTP request cloud function.
export const sendEmployersToAlgolia = functions.https.onRequest(
  async (req, res) => {
		await syncCollectionToAlgolia('Employers', 'employers');
		await syncCollectionToAlgolia('Reports', 'reports');

		res.status(200).send("Database was indexed to Algolia successfully.");
  }
);
