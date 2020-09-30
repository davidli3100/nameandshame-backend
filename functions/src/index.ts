import * as functions from "firebase-functions";
import syncCollectionToAlgolia from './Algolia/syncCollectionToAlgolia';

// Create a HTTP request cloud function.
export const sendDatabaseToAlgolia = functions.https.onRequest(
  async (req, res) => {
		await syncCollectionToAlgolia('Employers', 'employers');
		await syncCollectionToAlgolia('Reports', 'reports');

		res.status(200).send("Database was indexed to Algolia successfully.");
  }
);
