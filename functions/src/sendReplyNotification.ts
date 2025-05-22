import * as functions from "firebase-functions/v1";
import sgMail from "@sendgrid/mail";
import "./firebase";

sgMail.setApiKey(functions.config().sendgrid.api_key);

export const sendReplyNotification = functions.firestore
  .document("questions/{questionId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // ステータスが "pending" → "replied" に変わった時だけ送信
    if (before.status === "pending" && after.status === "replied") {
      const msg = {
        to:       after.email,
        from:     "itsup2w3f02@gmail.com",
        replyTo:  "itsup2w3f02@gmail.com",
        subject:  "【回答をお届けします】松蔭大学ITサポートデスクより",
        text: `
${after.name}さん

以下のご質問に対して、サポートデスクより回答いたします。

▼ ご質問ID
#${context.params.questionId}

▼ ご質問
${after.questionText}

▼ 回答
${after.reply}

---

もし回答が不十分な場合は、再度フォームからご質問ください。
その際、質問文の最初に以下のように質問IDを記入してください：

#${context.params.questionId}
（ここに再質問内容を続けて記入）

---
このメールは自動送信です。
        `.trim(),
      };

      try {
        await sgMail.send(msg);
        console.log("回答通知メール送信成功！");
      } catch (error) {
        console.error("メール送信失敗:", error);
      }
    }
  });
