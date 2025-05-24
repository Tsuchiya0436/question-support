import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";

interface AuthCtx {
  user: User | null;
  loading: boolean;
}

const Ctx = createContext<AuthCtx>({ user: null, loading: true });
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(), (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <Ctx.Provider value={{ user, loading }}>
      {children}
    </Ctx.Provider>
  );
}
