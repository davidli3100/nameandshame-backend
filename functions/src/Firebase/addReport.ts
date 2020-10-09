
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();


export const addReport = functions.https.onCall((data, context) => {
    var categories = data.categories;
    var date = Date.now()
    var description = data.description
    var employer = data.employer
    var employerRef = data.employerRef
    var title = data.title;





    return admin.database().ref("/reports").push({
            c



        
    }).then(() => {
        console.log("pushed new employer to database")
    })








}
