
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();


export const addEmployer = functions.https.onCall((data, context) => {


    var numEmployees = data.numEmployees;
    var bgURL = data.backgroundImageURL;
    var imgURL = data.imageURL;
    var name = data.name;

    return admin.database().ref("/employers").push({
        backgroundImageURL:     bgURL,
        imageURL:               imgURL,
        categories: {
            "racism" : 0
        },
        categorized_incedents:  0,
        name:                   name,
        numEmployees:           numEmployees,
        numReports: 0,
        score: 0,
    }).then(() => {
        console.log("pushed new employer to database")
    })
});





