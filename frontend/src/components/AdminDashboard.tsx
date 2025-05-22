import { useEffect, useState } from "react";
import { getFirestore, collection, query, where, onSnapshot } from "firebase/firestore";

interface Question {
  id: string;
  questionId: string;
  faculty: string;
  grade: string;
  topic: string;
  submittedAt: any; // Firestore Timestamp
  status: string;
  repliedBy?: string;
}

export default function AdminDashboard() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const db = getFirestore();

  useEffect(() => {
    const q = query(collection(db, "questions"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Question[];

      // questionIdの数値部分で降順ソート
      const sorted = list.sort((a, b) =>
        parseInt(b.questionId.replace("#", "")) - parseInt(a.questionId.replace("#", ""))
      );

      setQuestions(sorted);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">質問一覧</h1>
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
            className={`cursor-pointer hover:bg-gray-100 ${q.status === "replied" ? "text-gray-400" : ""}`}
            onClick={() => {
              window.location.href = `/admin/dashboard/detail/${q.id}`;
            }}
          >
            <td className="border px-4 py-2">{q.questionId}</td>
            <td className="border px-4 py-2">{q.topic}</td>
            <td className="border px-4 py-2">{q.faculty}</td>
            <td className="border px-4 py-2">{q.grade}</td>
            <td className="border px-4 py-2">
              {q.submittedAt?.toDate().toLocaleString([], { dateStyle: 'short', timeStyle: 'short'})}
            </td>
            <td className="border px-4 py-2">{q.status === "replied" ? "対応済み" : "未対応"}</td>
            <td className="border px-4 py-2">{q.repliedBy || ""}</td>
          </tr>
        ))}
      </tbody>
      </table>
    </div>
  );
}
