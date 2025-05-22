import * as functions from "firebase-functions/v1";
import "./firebase";

export const categorizeQuestion = functions.firestore
  .document("questions/{docId}")
  .onCreate(async (snap) => {
    const { questionText = "" } = snap.data() as { questionText?: string };

    if (questionText.startsWith("#")) {
      await snap.ref.update({ topic: "再投稿" });
      console.log("再投稿として分類 (LLM スキップ)");
      return;
    }

    const modelName = "gemini-1.5-pro-latest"; // 使用するモデル
    const prompt = `
あなたは大学向け IT サポートデスクの自動分類器です。
与えられた質問を **必ず下記 7 つのラベルのうち 1 つだけ** で分類してください。
出力はラベル名のみ、追加情報は一切不要です。

【ラベル一覧】
- メール・Google系
- ソフトウェア操作
- ネットワーク接続
- セキュリティ対策
- PC・端末トラブル
- アカウント・ログイン
- その他

【質問】
「${questionText}」
`.trim();

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${functions.config().gemini.api_key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              response_mime_type: "application/json",
              responseSchema: {
                type: "string",
                enum: [
                  "メール・Google系", "ソフトウェア操作", "ネットワーク接続",
                  "セキュリティ対策", "PC・端末トラブル", "アカウント・ログイン", "その他"
                ]
              }
            },
            safetySettings: []
          }),
        }
      );

      // パースする前にステータスと生のテキストを確認
      console.log("API Response Status:", res.status);
      const rawText = await res.text();
      console.log("API Raw Response Text:", rawText);

      let json: any;
      if (res.ok && rawText) {
        try {
          json = JSON.parse(rawText);
        } catch (parseError) {
          console.error("APIレスポンスのJSONパースに失敗:", parseError, "Raw text:", rawText);
          await snap.ref.update({ topic: "その他" });
          return;
        }
      } else {
        console.error("APIリクエスト失敗または空レスポンス。 Status:", res.status, "Raw text:", rawText);
        await snap.ref.update({ topic: "その他" });
        return;
      }
      
      // パース後のJSONオブジェクト全体をログに出力
      console.log("Parsed API Response JSON:", JSON.stringify(json, null, 2));

      let category = "その他"; // デフォルトカテゴリ
      const validCategories = [
        "メール・Google系", "ソフトウェア操作", "ネットワーク接続",
        "セキュリティ対策", "PC・端末トラブル", "アカウント・ログイン", "その他"
      ];

      // プライマリパス: candidates構造からテキストを抽出
      if (json?.candidates?.[0]?.content?.parts?.[0]?.text) {
        let extractedText = json.candidates[0].content.parts[0].text.trim();

        // モデルがカテゴリ名を二重引用符で囲んで返す場合があるため、それを処理します。
        // 例: "\"カテゴリ名\"" -> "カテゴリ名"
        if (extractedText.startsWith('"') && extractedText.endsWith('"')) {
          try {
            // JSONエンコードされた文字列をデコード
            extractedText = JSON.parse(extractedText);
          } catch (e) {
            // JSON.parseに失敗した場合 (通常は発生しにくいが、念のため)
            console.warn(
              `引用符付き文字列のJSON.parseに失敗しました。単純な引用符除去を試みます。テキスト: "${json.candidates[0].content.parts[0].text}", エラー: ${e}`
            );
            extractedText = extractedText.substring(1, extractedText.length - 1);
          }
        }

        // 抽出・整形したテキストが定義済みの有効なカテゴリに含まれるか確認
        if (validCategories.includes(extractedText)) {
          category = extractedText;
        } else {
          // 有効なカテゴリリストにない場合、警告を出力
          console.warn(
            `LLMが予期しないカテゴリ文字列を返しました（整形後）: "${extractedText}". 元のテキスト: "${json.candidates[0].content.parts[0].text}"`
          );
          // category は "その他" のまま
        }
      }
      // フォールバックパス: APIレスポンス全体がカテゴリ文字列そのものである場合
      else if (typeof json === 'string') {
        const trimmedJsonString = json.trim();
        if (validCategories.includes(trimmedJsonString)) {
          category = trimmedJsonString;
        } else {
          console.warn(
            `APIレスポンスが文字列でしたが、有効なカテゴリではありませんでした: "${trimmedJsonString}"`
          );
          // category は "その他" のまま
        }
      }
      // 上記のいずれの構造にも当てはまらなかった場合
      else {
        console.warn(
          "LLMのレスポンスから有効なカテゴリを抽出できませんでした。レスポンス構造が予期しないものです。レスポンス:",
          JSON.stringify(json, null, 2) // 予期しない構造をログに出力
        );
        // category は "その他" のまま
      }

      await snap.ref.update({ topic: category });
      console.log("カテゴリ分類成功:", category);

    } catch (err) {
      console.error("カテゴリ分類失敗 (Outer catch):", err);
      if (err instanceof Error) {
        console.error("Error name:", err.name, "Error message:", err.message, "Error stack:", err.stack);
      } else {
        console.error("Caught non-Error object:", err);
      }
      await snap.ref.update({ topic: "その他" });
    }
  });