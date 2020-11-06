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
  console.log(email)
  const emailData = {
    from: `noreply@${functions.config().mailgun.domain}`,
    to: email,
    subject: `A new report submitted to ${employer}`,
    template: "report-alert",
    "v:employer": employer,
    "v:title": report.title,
    "v:employerID": employerID,
  };

  await mg.messages().send(emailData, (err: any, body: any) => {
    console.log(body);
    if (err) {
      throw new Error(err);
    }
  });

  return true;
};

const notifySubscribers = async (
  employer: string,
  report: Record<string, unknown>
) => {
  const employerData = (
    await admin.firestore().collection("employers").doc(employer).get()
  ).data();
  const subscribers = employerData?.subscribers || [];

  console.log(subscribers)

  await Promise.all(
    subscribers.map((subscriber: string) =>
      notifySubscriber(subscriber, employerData?.name, report, employer)
    )
  ).catch((err) => {
    console.log(err);
    throw new Error(err);
  });

  return true;
};

export default notifySubscribers;
