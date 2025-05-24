import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
} from "firebase/firestore";
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
  const { user, loading } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const db       = getFirestore();
  const navigate = useNavigate();

  /* 質問一覧取得 */
  useEffect(() => {
    if (loading || !user) return;

    const q     = query(collection(db, "questions"));
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

  /* ガード */
  if (loading) return <div className="p-4">読み込み中...</div>;
  if (!user)   return <Navigate to="/login" replace />;

  /* JSX */
  return (
    <div className="p-4 sm:p-6">
      {/* 上部バー */}
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs sm:text-sm text-gray-600">
          {user.displayName ?? user.email ?? "ユーザー"}
        </span>
        <button
          onClick={() =>
            signOut(getAuth()).then(() => navigate("/login", { replace: true }))
          }
          className="bg-red-500 text-white px-3 py-2 rounded text-xs sm:text-sm"
        >
          ログアウト
        </button>
      </div>

      <h1 className="text-lg sm:text-xl font-bold mb-3 text-center">
        質問一覧
      </h1>

      {/* テーブル */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse border border-gray-300 text-sm sm:text-base">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1 sm:px-4 sm:py-2 w-20">ID</th>
              <th className="border px-2 py-1 sm:px-4 sm:py-2">カテゴリ</th>
              {/* 以下はモバイル非表示 */}
              <th className="border px-2 py-1 sm:px-4 sm:py-2 hidden md:table-cell">
                学科
              </th>
              <th className="border px-2 py-1 sm:px-4 sm:py-2 hidden md:table-cell">
                学年
              </th>
              <th className="border px-2 py-1 sm:px-4 sm:py-2 hidden lg:table-cell">
                投稿日時
              </th>
              <th className="border px-2 py-1 sm:px-4 sm:py-2 hidden lg:table-cell">
                ステータス
              </th>
              <th className="border px-2 py-1 sm:px-4 sm:py-2 hidden xl:table-cell">
                対応者
              </th>
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
                  navigate(`/admin/dashboard/detail/${q.id}`, { replace: false })
                }
              >
                <td className="border px-2 py-1 sm:px-4 sm:py-2">{q.questionId}</td>
                <td className="border px-2 py-1 sm:px-4 sm:py-2">{q.topic}</td>

                {/* モバイル非表示列 */}
                <td className="border px-2 py-1 sm:px-4 sm:py-2 hidden md:table-cell">
                  {q.faculty}
                </td>
                <td className="border px-2 py-1 sm:px-4 sm:py-2 hidden md:table-cell">
                  {q.grade}
                </td>
                <td className="border px-2 py-1 sm:px-4 sm:py-2 hidden lg:table-cell whitespace-nowrap">
                  {q.submittedAt?.toDate().toLocaleString([], {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </td>
                <td className="border px-2 py-1 sm:px-4 sm:py-2 hidden lg:table-cell">
                  {q.status === "replied" ? "対応済み" : "未対応"}
                </td>
                <td className="border px-2 py-1 sm:px-4 sm:py-2 hidden xl:table-cell">
                  {q.repliedBy || ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
