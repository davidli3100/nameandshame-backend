// Import all needed modules.
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import algoliasearch from 'algoliasearch';

// Set up Firestore.
admin.initializeApp();
const db = admin.firestore();

// Set up Algolia.
// The app id and API key are coming from the cloud functions environment, as we set up in Part 1, Step 3.
const algoliaClient = algoliasearch(functions.config().algolia.appid, functions.config().algolia.apikey);
// Since I'm using develop and production environments, I'm automatically defining 
// the index name according to which environment is running. functions.config().projectId is a default 
// property set by Cloud Functions.
const collectionIndexName = 'Employers';
const collectionIndex = algoliaClient.initIndex(collectionIndexName);

// Create a HTTP request cloud function.
export const sendEmployersToAlgolia = functions.https.onRequest(async (req, res) => {

	// This array will contain all records to be indexed in Algolia.
	// A record does not need to necessarily contain all properties of the Firestore document,
	// only the relevant ones. 
	const algoliaRecords : any[] = [];

	// Retrieve all documents from the COLLECTION collection.
	const querySnapshot = await db.collection('employers').get();

	querySnapshot.docs.forEach(doc => {
		const document = doc.data();
        const record = {
            objectID: doc.id,
            imageURL: document.imageURL,
						name: document.name,
						numReports: document.numReports,
						score: document.score
        };

        algoliaRecords.push(record);
    });
	
	// After all records are created, we save them to 
	collectionIndex.saveObjects(algoliaRecords, (_error: any, content: any) => {
        res.status(200).send("COLLECTION was indexed to Algolia successfully.");
		})
		.catch(err => console.error(err));
	
})