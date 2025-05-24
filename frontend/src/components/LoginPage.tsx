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
  /* AuthProvider からユーザー状態を取得 */
  const { user, loading } = useAuth();

  const auth = getAuth();
  const db   = getFirestore();

  /* Firestore にある allowedAdmins/{email} の存在で権限を判定 */
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  /* user が確定したら Firestore で権限チェック */
  useEffect(() => {
    if (!user) {
      setIsAdmin(null);
      return;
    }

    (async () => {
      const snap = await getDoc(doc(db, "allowedAdmins", user.email!));
      setIsAdmin(snap.exists());

      /* 不正ユーザーなら即サインアウト */
      if (!snap.exists()) await signOut(auth);
    })();
  }, [user, db, auth]);

  /* 判定中は何も描画しない（FOUC防止） */
  if (loading || (user && isAdmin === null)) return null;

  /* 正規管理者ならダッシュボードへ */
  if (user && isAdmin) return <Navigate to="/admin/dashboard" replace />;

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
    <div className="flex items-center justify-center h-screen bg-gray-100 px-4">
      <button
        onClick={handleLogin}
        className="w-full max-w-xs sm:max-w-xs bg-blue-600 text-white px-6 py-4 rounded shadow text-center text-sm sm:text-base"
      >
        大学&nbsp;Google アカウントでログイン
      </button>
    </div>
  );
}
