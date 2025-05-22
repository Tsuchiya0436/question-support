import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

interface QuestionData {
  name: string;
  faculty: string;
  grade: string;
  email: string;
  questionText: string;
  topic: string;
  status: string;
  submittedAt: any;
  repliedBy?: string;
  repliedAt?: any;
  reply?: string;
}

export default function AdminQuestionDetail() {
  const { id } = useParams();
  const db = getFirestore();

  const [data, setData] = useState<QuestionData | null>(null);
  const [replyText, setReplyText] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const docRef = doc(db, "questions", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const docData = docSnap.data() as QuestionData;
        setData(docData);
        setReplyText(docData.reply || ""); // ← 回答を初期表示
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async () => {
    if (!id || !data) return;

    const docRef = doc(db, "questions", id);
    await updateDoc(docRef, {
      reply: replyText,
      repliedAt: serverTimestamp(),
      repliedBy: "管理者", // ここは後でログインユーザー名にしてもいい
      status: "replied",
    });

    await addDoc(collection(db, "archives"), {
      topic: data.topic,
      grade: data.grade,
      questionText: data.questionText,
      submittedAt: data.submittedAt,
    });

    alert("回答を送信しました！");
    window.location.href = "/admin/dashboard";
  };

  if (!data) return <div className="p-4">読み込み中...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">質問詳細</h1>
      <p><strong>名前:</strong> {data.name}</p>
      <p><strong>学科:</strong> {data.faculty}</p>
      <p><strong>学年:</strong> {data.grade}</p>
      <p><strong>カテゴリ:</strong> {data.topic}</p>
      <p><strong>質問内容:</strong> {data.questionText}</p>

      {data.status === "replied" && (
        <p>
          <strong>回答内容（回答者: {data.repliedBy || "不明"}）:</strong>
        </p>
      )}

      <textarea
        className="w-full border p-2"
        rows={10}
        placeholder="ここに回答を記入"
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        readOnly={data.status === "replied"}
      />

      {data.status !== "replied" && (
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          回答を送信する
        </button>
      )}
        <div className="flex justify-center">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            戻る
          </button>
        </div>
    </div>
  );
}
