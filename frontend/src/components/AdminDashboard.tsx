import { useEffect, useState } from "react";
import { getFirestore, collection, query, onSnapshot } from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

interface Question {
  id: string;
  questionId: string;
  faculty: string;
  grade: string;
  topic: string;
  submittedAt: any;
  status: string;
  repliedBy?: string;
}

export default function AdminDashboard() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const { user, loading } = useAuth();

  const db = getFirestore();
  const navigate = useNavigate();

  /* 質問一覧取得（ログイン確定後） */
  useEffect(() => {
    if (loading || !user) return;

    const q = query(collection(db, "questions"));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Question[];

      setQuestions(
        list.sort(
          (a, b) =>
            (parseInt(b.questionId?.replace("#", "") ?? "0") || 0) -
            (parseInt(a.questionId?.replace("#", "") ?? "0") || 0)
        )
      );
    });

    return unsub;
  }, [loading, user, db]);

  /* ローディング or 未ログイン判定 */
  if (loading) return <div>読み込み中...</div>;
  if (!user) return <Navigate to="/login" replace />;

  /* ここから本画面 */
  return (
    <div className="p-6 relative">
      {/* ログアウト */}
      <button
        onClick={() => {
          signOut(getAuth()).then(() => navigate("/login", { replace: true }));
        }}
        className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded"
      >
        ログアウト
      </button>

      {/* ユーザー名 */}
      <div className="absolute top-4 left-4 text-sm text-gray-600">
        {user.displayName ?? user.email ?? "ユーザー"}
      </div>

      <h1 className="text-xl font-bold mb-4 text-center">質問一覧</h1>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">カテゴリ</th>
            <th className="border px-4 py-2">学科</th>
            <th className="border px-4 py-2">学年</th>
            <th className="border px-4 py-2">投稿日時</th>
            <th className="border px-4 py-2">ステータス</th>
            <th className="border px-4 py-2">対応者</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q) => (
            <tr
              key={q.id}
              className={`cursor-pointer hover:bg-gray-100 ${
                q.status === "replied" ? "text-gray-400" : ""
              }`}
              onClick={() =>
                navigate(`/admin/dashboard/detail/${q.id}`, { replace: true })
              }
            >
              <td className="border px-4 py-2">{q.questionId}</td>
              <td className="border px-4 py-2">{q.topic}</td>
              <td className="border px-4 py-2">{q.faculty}</td>
              <td className="border px-4 py-2">{q.grade}</td>
              <td className="border px-4 py-2">
                {q.submittedAt?.toDate().toLocaleString([], {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </td>
              <td className="border px-4 py-2">
                {q.status === "replied" ? "対応済み" : "未対応"}
              </td>
              <td className="border px-4 py-2">{q.repliedBy || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
