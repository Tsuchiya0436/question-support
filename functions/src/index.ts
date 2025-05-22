import * as functions from "firebase-functions/v1";
import { db } from "./firebase";

/** 質問番号（#0001 等）を付与 */
export const addQuestionId = functions.firestore
  .document("questions/{docId}")
  .onCreate(async (snap) => {
    const counterRef = db.collection("counters").doc("questions");

    await db.runTransaction(async (tx) => {
      const counterDoc = await tx.get(counterRef);
      const current    = counterDoc.data()?.count ?? 0;
      const next       = current + 1;
      const formatted  = "#" + String(next).padStart(4, "0");

      tx.update(counterRef, { count: next });
      tx.update(snap.ref,  { questionId: formatted });
    });
  });

export { sendQuestionConfirmation } from "./sendQuestionConfirmation";
export { categorizeQuestion }       from "./categorizeQuestion";
