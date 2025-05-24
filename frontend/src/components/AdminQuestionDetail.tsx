// src/components/AdminQuestionDetail.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../AuthContext";

interface QuestionData {
  name: string;
  faculty: string;
  grade: string;
  studentId: string;
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
  const { id }               = useParams();
  const navigate             = useNavigate();
  const db                   = getFirestore();
  const { user, loading }    = useAuth();

  const [isAdmin, setIsAdmin]         = useState<boolean | null>(null);
  const [data, setData]               = useState<QuestionData | null>(null);
  const [replyText, setReplyText]     = useState("");

  /* ① Firestore で権限チェック */
  useEffect(() => {
    if (!user) { setIsAdmin(null); return; }
    (async () => {
      const ok = (await getDoc(doc(db, "allowedAdmins", user.email!))).exists();
      setIsAdmin(ok);
    })();
  }, [user, db]);

  /* ② 質問ドキュメント取得 */
  useEffect(() => {
    if (!id || !isAdmin) return;
    (async () => {
      const snap = await getDoc(doc(db, "questions", id));
      if (snap.exists()) {
        const d = snap.data() as QuestionData;
        setData(d);
        setReplyText(d.reply || "");
      }
    })();
  }, [id, isAdmin, db]);

  /* ---------- ガード ---------- */
  if (loading || isAdmin === null) return null;
  if (!user || !isAdmin)           return <Navigate to="/login" replace />;
  if (!data)                       return <div className="p-4">読み込み中...</div>;

  /* ③ 回答送信 */
  const handleSubmit = async () => {
    await updateDoc(doc(db, "questions", id!), {
      reply: replyText,
      repliedAt: serverTimestamp(),
      repliedBy: user.displayName ?? user.email ?? "管理者",
      status: "replied",
    });
    await addDoc(collection(db, "archives"), {
      topic: data.topic,
      grade: data.grade,
      questionText: data.questionText,
      submittedAt: data.submittedAt,
    });
    alert("回答を送信しました！");
    navigate("/admin/dashboard");
  };

  /* ---------- 画面 ---------- */
  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-lg sm:text-xl font-bold">質問詳細</h1>

      {/* 基本情報 */}
      <div className="space-y-1 text-sm sm:text-base">
        <p>
          <strong>名前:</strong> {data.name}
          {data.grade !== "教職員" && data.studentId && ` (${data.studentId})`}
        </p>
        <p><strong>学科:</strong> {data.faculty}</p>
        <p><strong>学年:</strong> {data.grade}</p>
        <p><strong>カテゴリ:</strong> {data.topic}</p>
        <p className="whitespace-pre-line">
          <strong>質問内容:</strong>
          <br />
          {data.questionText}
        </p>
      </div>

      {/* 回答済み表示 */}
      {data.status === "replied" && (
        <div className="text-sm sm:text-base text-green-700">
          <strong>回答内容（回答者: {data.repliedBy ?? "不明"}）:</strong>
        </div>
      )}

      {/* 回答入力 */}
      <textarea
        rows={10}
        className="w-full border p-3 sm:p-2 text-sm sm:text-base rounded"
        placeholder="ここに回答を記入"
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        readOnly={data.status === "replied"}
      />

      {/* ボタン */}
      {data.status !== "replied" && (
        <div className="sm:flex sm:space-x-4">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="w-full sm:w-auto mb-2 sm:mb-0 bg-gray-500 text-white px-4 py-3 rounded"
          >
            戻る
          </button>
          <button
            onClick={handleSubmit}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-3 rounded"
          >
            回答を送信する
          </button>
        </div>
      )}
    </div>
  );
}
