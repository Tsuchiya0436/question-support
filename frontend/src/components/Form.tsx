import { useState } from "react";
import { addDoc, collection, getFirestore, serverTimestamp } from "firebase/firestore";
import { initializeApp } from "firebase/app";

// Firebase config（必要に応じて .env から読み込み）
const firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_PROJECT_ID,
};

initializeApp(firebaseConfig);
const db = getFirestore();

export default function QuestionForm() {
    const [formData, setFormData] = useState({
        name: "",
        grade: "",
        studentId: "",
        email: "",
        questionText: "",
        skipPreview: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target; 
    setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
    }));
}; 

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, "questions"), {
        ...formData,
        status: "pending",
        submittedAt: serverTimestamp(),
    });
    alert("質問が送信されました！");
    setFormData({ name: "", grade: "", studentId: "", email: "", questionText: "", skipPreview: false });
};

return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow space-y-4">
        <input name="name" placeholder="名前" value={formData.name} onChange={handleChange} className="w-full border p-2" required />
        <input name="grade" placeholder="学年" value={formData.grade} onChange={handleChange} className="w-full border p-2" required />
        <input name="studentId" placeholder="学籍番号" value={formData.studentId} onChange={handleChange} className="w-full border p-2" required />
        <input name="email" type="email" placeholder="メールアドレス" value={formData.email} onChange={handleChange} className="w-full border p-2" required />
        <textarea name="questionText" placeholder="質問内容" value={formData.questionText} onChange={handleChange} className="w-full border p-2" required />
        <label className="flex items-center space-x-2">
        <input name="skipPreview" type="checkbox" checked={formData.skipPreview} onChange={handleChange} />
        <span>確認画面をスキップする</span>
    </label>
    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">送信</button>
    </form>
);
}
