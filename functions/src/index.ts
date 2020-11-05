/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as functions from "firebase-functions";
import syncCollectionToAlgolia from "./Algolia/syncCollectionToAlgolia";
import { syncEmployerUpdates, syncReportUpdates } from "./Algolia/syncUpdates";
import { addReport } from "./Firebase/addReport";
import { addEmployer } from "./Firebase/addEmployer";
const cors = require('cors')({origin: true});

// live sync of the specified firebase collections
exports.syncEmployerUpdates = syncEmployerUpdates;
exports.syncReportUpdates = syncReportUpdates;
exports.addReport = addReport;
exports.addEmployer = addEmployer;

// sends the specified collections to algolia on a request
export const sendDatabaseToAlgolia = functions.https.onRequest(
  async (req, res) => {
    await syncCollectionToAlgolia("Employers", "employers");
    await syncCollectionToAlgolia("Reports", "reports");

    res.status(200).send("Database was indexed to Algolia successfully.");
  }
);
