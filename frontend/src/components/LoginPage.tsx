import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useAuth } from "../AuthContext";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const auth = getAuth();
  const db = getFirestore();

  // Firestore で検証した結果を保持
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  /* user オブジェクトが来たら権限チェック */
  useEffect(() => {
    if (!user) {
      setIsAdmin(null);
      return;
    }
    (async () => {
      const snap = await getDoc(doc(db, "allowedAdmins", user.email!));
      setIsAdmin(snap.exists());
      if (!snap.exists()) await signOut(auth); // 不正なら直ちにサインアウト
    })();
  }, [user, db, auth]);

  /* ローディング処理 */
  if (loading || (user && isAdmin === null)) return null;

  /* 正規管理者ならダッシュボードへ */
  if (user && isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  /* サインイン UI */
  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const { user } = await signInWithPopup(auth, provider);
      const snap = await getDoc(doc(db, "allowedAdmins", user.email!));
      if (!snap.exists()) {
        alert("許可された管理者アカウントではありません");
        await signOut(auth);
      }
    } catch (e) {
      console.error("ログイン失敗:", e);
      alert("ログインに失敗しました");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-6 py-3 rounded shadow"
      >
        大学 Google アカウントでログイン
      </button>
    </div>
  );
}
