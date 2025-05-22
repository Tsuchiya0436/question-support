import { useState, ChangeEvent, FormEvent } from "react";
import { addDoc, collection, getFirestore, serverTimestamp } from "firebase/firestore";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
	apiKey: process.env.REACT_APP_API_KEY!,
	authDomain: process.env.REACT_APP_AUTH_DOMAIN!,
	projectId: process.env.REACT_APP_PROJECT_ID!,
};

initializeApp(firebaseConfig);
const db = getFirestore();

const faculties = [
	"ビジネスマネジメント学科", "経営法学科", "異文化コミュニケーション学科",
	"日本文化コミュニケーション学科", "生活心理学科", "子ども学科",
	"観光文化学科", "メディア情報文化学科", "看護学科", "教職員"
];

const grades = [
	"1年", "2年", "3年", "4年", "大学院", "教職員"
];

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

	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

	const handleChange = (
		e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e?: FormEvent) => {
		if (e) e.preventDefault();

		// 教職員以外で学籍番号未入力ならエラー
		if (
			formData.grade !== "教職員" &&
			formData.studentId.trim() === ""
		) {
			alert("学生の場合は学籍番号を入力してください")
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

	return (
		<form
			onSubmit={handleSubmit}
			className="mt-10 max-w-md mx-auto p-6 bg-white rounded-lg shadow space-y-4"
		>
			<input
				name="name"
				placeholder="名前（仮名可）"
				value={formData.name}
				onChange={handleChange}
				className="w-full border p-2"
				required
			/>

			<select
				name="faculty"
				value={formData.faculty}
				onChange={handleChange}
				className="w-full border p-2"
				required
			>
				<option value="">学部名を選択</option>
				{faculties.map((f) => (
					<option key={f} value={f}>
						{f}
					</option>
				))}
			</select>

			<select
				name="grade"
				value={formData.grade}
				onChange={handleChange}
				className="w-full border p-2"
				required
			>
				<option value="">学年を選択</option>
				{grades.map((g) => (
					<option key={g} value={g}>
						{g}
					</option>
				))}
			</select>

			<input
				name="studentId"
				placeholder="学籍番号（教職員の方は入力不要です）"
				value={formData.studentId}
				onChange={handleChange}
				className="w-full border p-2"
				required={formData.grade !== "教職員"}
			/>

			<input
				name="email"
				type="email"
				placeholder="返信可能メールアドレス"
				value={formData.email}
				onChange={handleChange}
				className="w-full border p-2"
				required
			/>

			<textarea
				name="questionText"
				placeholder="質問内容（自由記述）"
				value={formData.questionText}
				onChange={handleChange}
				rows={10}
				className="w-full border p-2"
				required
			/>

			<div className="flex justify-between space-x-4">
				<button
					type="button"
					onClick={() => setIsModalOpen(true)}
					className="bg-gray-500 text-white px-4 py-2 rounded"
				>
					確認
				</button>
				<button
					type="submit"
					className="bg-blue-600 text-white px-4 py-2 rounded"
				>
					送信
				</button>
			</div>

			{isModalOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white p-6 rounded shadow max-w-md w-full space-y-4">
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
							<strong>学籍番号:</strong> {formData.studentId || "（教職員のため未入力）"}
						</p>
						<p>
							<strong>メール:</strong> {formData.email}
						</p>
						<p>
							<strong>質問内容:</strong>
							<br />
							{formData.questionText}
						</p>
						<div className="flex justify-between">
							<button
								className="bg-gray-400 text-white px-4 py-2 rounded"
								onClick={() => setIsModalOpen(false)}
							>
								戻る
							</button>
							<button
								className="bg-blue-600 text-white px-4 py-2 rounded"
								onClick={handleSubmit}
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
