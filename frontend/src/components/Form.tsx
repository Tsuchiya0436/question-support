import { useState, ChangeEvent, FormEvent } from "react";
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";

/* --- Firebase 初期化 --- */
const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY!,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN!,
  projectId: process.env.REACT_APP_PROJECT_ID!,
};
initializeApp(firebaseConfig);
const db = getFirestore();

/* --- 定数 --- */
const faculties = [
  "ビジネスマネジメント学科",
  "経営法学科",
  "異文化コミュニケーション学科",
  "日本文化コミュニケーション学科",
  "生活心理学科",
  "子ども学科",
  "観光文化学科",
  "メディア情報文化学科",
  "看護学科",
  "教職員",
];
const grades = ["1年", "2年", "3年", "4年", "大学院", "教職員"];

/* --- 型 --- */
interface FormData {
  name: string;
  faculty: string;
  grade: string;
  email: string;
  questionText: string;
  studentId: string;
}

export default function QuestionForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    faculty: "",
    grade: "",
    email: "",
    questionText: "",
    studentId: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  /* 入力ハンドラ */
  const handleChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* 送信ハンドラ */
  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();

    /* 学籍番号チェック */
    if (formData.grade !== "教職員" && !formData.studentId.trim()) {
      alert("学生の場合は学籍番号を入力してください");
      return;
    }

    await addDoc(collection(db, "questions"), {
      ...formData,
      status: "pending",
      submittedAt: serverTimestamp(),
    });

    alert("質問が送信されました！");
    setFormData({
      name: "",
      faculty: "",
      grade: "",
      email: "",
      questionText: "",
      studentId: "",
    });
    setIsModalOpen(false);
  };

  /* --- JSX --- */
  return (
    <form
      onSubmit={handleSubmit}
      className="mt-10 mx-4 sm:mx-auto sm:max-w-md p-4 sm:p-6 bg-white rounded-lg shadow space-y-4"
    >
      {/* 名前 */}
      <input
        name="name"
        placeholder="名前（仮名可）"
        value={formData.name}
        onChange={handleChange}
        className="w-full border p-3 sm:p-2 text-sm sm:text-base rounded"
        required
      />

      {/* 学科 */}
      <select
        name="faculty"
        value={formData.faculty}
        onChange={handleChange}
        className="w-full border p-3 sm:p-2 text-sm sm:text-base rounded"
        required
      >
        <option value="">学部名を選択</option>
        {faculties.map((f) => (
          <option key={f}>{f}</option>
        ))}
      </select>

      {/* 学年 */}
      <select
        name="grade"
        value={formData.grade}
        onChange={handleChange}
        className="w-full border p-3 sm:p-2 text-sm sm:text-base rounded"
        required
      >
        <option value="">学年を選択</option>
        {grades.map((g) => (
          <option key={g}>{g}</option>
        ))}
      </select>

      {/* 学籍番号 */}
      <input
        name="studentId"
        placeholder="学籍番号（教職員は不要）"
        value={formData.studentId}
        onChange={handleChange}
        className="w-full border p-3 sm:p-2 text-sm sm:text-base rounded"
        required={formData.grade !== "教職員"}
      />

      {/* メール */}
      <input
        name="email"
        type="email"
        placeholder="返信用メールアドレス"
        value={formData.email}
        onChange={handleChange}
        className="w-full border p-3 sm:p-2 text-sm sm:text-base rounded"
        required
      />

      {/* 質問内容 */}
      <textarea
        name="questionText"
        placeholder="質問内容（自由記述）"
        value={formData.questionText}
        onChange={handleChange}
        rows={10}
        className="w-full border p-3 sm:p-2 text-sm sm:text-base rounded"
        required
      />

      {/* ボタン */}
      <div className="sm:flex sm:space-x-4">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto mb-2 sm:mb-0 bg-gray-500 text-white px-4 py-3 rounded"
        >
          確認
        </button>
        <button
          type="submit"
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-3 rounded"
        >
          送信
        </button>
      </div>

      {/* モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white max-w-md w-full p-4 sm:p-6 rounded shadow space-y-3">
            <h2 className="text-lg font-bold">入力内容の確認</h2>

            <p>
              <strong>名前:</strong> {formData.name}
            </p>
            <p>
              <strong>学科:</strong> {formData.faculty}
            </p>
            <p>
              <strong>学年:</strong> {formData.grade}
            </p>
            <p>
              <strong>学籍番号:</strong>{" "}
              {formData.studentId || "（教職員のため未入力）"}
            </p>
            <p>
              <strong>メール:</strong> {formData.email}
            </p>
            <p className="whitespace-pre-line">
              <strong>質問内容:</strong>
              <br />
              {formData.questionText}
            </p>

            <div className="sm:flex sm:space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto mb-2 sm:mb-0 bg-gray-400 text-white px-4 py-3 rounded"
              >
                戻る
              </button>
              <button
                onClick={handleSubmit}
                className="w-full sm:w-auto bg-blue-600 text-white px-4 py-3 rounded"
              >
                送信する
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
