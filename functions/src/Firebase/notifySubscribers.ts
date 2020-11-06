/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
const mailgun = require("mailgun-js");
const mg = mailgun({
  apiKey: functions.config().mailgun.apikey,
  domain: functions.config().mailgun.domain,
});

const notifySubscriber = async (
  email: string,
  employer: string,
  report: Record<string, unknown>,
  employerID: string
) => {
  const emailData = {
    from: `noreply@${functions.config().mailgun.domain}`,
    to: email,
    subject: `A new report submitted to ${employer}`,
    text: `
      A new report with the title ${report.title} was submitted to NameandShame just now!

      Please go to <a href="https://name-and-shame.netlify.app/employer/${employerID}">https://name-and-shame.netlify.app/employer/${employerID}</a> to view the report.
    `,
  };

  await mg.messages().send(emailData, (err: any, body: any) => {
    console.log(body);
    if (err) {
      throw new Error(err);
    }
  })

  return true
};

const notifySubscribers = async (
  employer: string,
  report: Record<string, unknown>
) => {
  const employerData = (
    await admin.firestore().collection("employers").doc(employer).get()
  ).data();
  const subscribers = employerData?.subscribers;

  await Promise.all(
    subscribers.map((subscriber: string) =>
      notifySubscriber(subscriber, employerData?.name, report, employer)
    )
  );

  return true;
};

export default notifySubscribers;
