// functions/src/index.ts
import * as functions from "firebase-functions/v1";
import * as admin     from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

export const addQuestionId = functions.firestore
.document("questions/{docId}")
.onCreate(async (snap, context) => {
    // counters/questions ドキュメントをトランザクションでインクリメント
    const counterRef = db.collection("counters").doc("questions");
    await db.runTransaction(async (tx) => {
        const counterDoc = await tx.get(counterRef);
        const current = counterDoc.data()?.count ?? 0;
        const next    = current + 1;
        const formattedId = "#" + String(next).padStart(4, "0");

        tx.update(counterRef, { count: next });
        tx.update(snap.ref,  { questionId: formattedId });
    });
});
