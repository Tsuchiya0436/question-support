import * as functions from "firebase-functions/v1";
import sgMail from "@sendgrid/mail";
import "./firebase";

sgMail.setApiKey(functions.config().sendgrid.api_key);

export const sendQuestionConfirmation = functions.firestore
  .document("questions/{questionId}")
  .onCreate(async (snap) => {
    const data = snap.data();

    const msg = {
      to:       data.email,
      from:     "itsup2w3f02@gmail.com",
      replyTo:  "itsup2w3f02@gmail.com",
      subject:  "【質問を受け付けました】松蔭大学ITサポートデスクより",
      text: `
${data.name}さん

以下の内容で質問を受け付けました：

▼ ご質問内容
${data.questionText}

ご質問ありがとうございます。三営業日以内に返信いたしますので、回答が届くまでしばらくお待ちください。

---
このメールは自動送信です。
      `.trim(),
    };

    try {
      await sgMail.send(msg);
      console.log("確認メール送信成功！");
    } catch (error) {
      console.error("メール送信失敗:", error);
    }
  });
