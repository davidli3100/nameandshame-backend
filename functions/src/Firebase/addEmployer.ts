
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();


export const addEmployer = functions.https.onCall((data, context) => {


    const numEmployees = data.numEmployees;
    const bgURL = data.backgroundImageURL;
    const imgURL = data.imageURL;
    const name = data.name;

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

