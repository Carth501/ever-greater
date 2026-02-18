import { FormEvent, useEffect, useMemo, useState } from "react";

type Snapshot = {
  globalTickets: string;
  userContributedTickets: string;
  personalStock: number;
  unlockedFeatures: string[];
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

export function App() {
  const [email, setEmail] = useState("player@example.com");
  const [password, setPassword] = useState("password123");
  const [token, setToken] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const authorizationHeaders = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token],
  );

  async function fetchSnapshot(currentToken: string) {
    const response = await fetch(`${API_BASE}/game/snapshot`, {
      headers: {
        Authorization: `Bearer ${currentToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Unable to fetch game snapshot");
    }

    setSnapshot(await response.json());
  }

  async function handleAuth(
    path: "/auth/register" | "/auth/login",
    event: FormEvent,
  ) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error ?? "Authentication failed");
      }

      const auth = await response.json();
      setToken(auth.token);
      await fetchSnapshot(auth.token);
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePrintTicket() {
    if (!authorizationHeaders) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/game/print-ticket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authorizationHeaders,
        },
        body: JSON.stringify({
          actionId: crypto.randomUUID(),
        }),
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error ?? "Unable to print ticket");
      }

      setSnapshot(await response.json());
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!token) {
      return;
    }

    const stream = new EventSource(
      `${API_BASE}/events?token=${encodeURIComponent(token)}`,
    );
    stream.addEventListener("game_snapshot", (event) => {
      const parsed = JSON.parse((event as MessageEvent).data);
      setSnapshot(parsed.payload);
    });

    stream.onerror = () => {
      stream.close();
    };

    return () => {
      stream.close();
    };
  }, [token]);

  if (!token || !snapshot) {
    return (
      <main className="container">
        <h1>Ever Greater</h1>
        <p>Login or create an account to start printing tickets.</p>
        <form
          className="card"
          onSubmit={(event) => handleAuth("/auth/login", event)}
        >
          <label>
            Email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
            />
          </label>
          <label>
            Password
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              required
            />
          </label>
          <div className="row">
            <button disabled={isLoading} type="submit">
              Log in
            </button>
            <button
              disabled={isLoading}
              type="button"
              onClick={(event) => handleAuth("/auth/register", event)}
            >
              Create account
            </button>
          </div>
        </form>
        {error ? <p className="error">{error}</p> : null}
      </main>
    );
  }

  return (
    <main className="container">
      <h1>Ever Greater</h1>
      <div className="card">
        <p>
          <strong>Global tickets:</strong> {snapshot.globalTickets}
        </p>
        <p>
          <strong>Your contributed tickets:</strong>{" "}
          {snapshot.userContributedTickets}
        </p>
        <p>
          <strong>Your stock:</strong> {snapshot.personalStock}
        </p>
        <button disabled={isLoading} onClick={handlePrintTicket}>
          Print a ticket
        </button>
      </div>
      <div className="card">
        <p>
          <strong>Unlocked features</strong>
        </p>
        {snapshot.unlockedFeatures.length === 0 ? (
          <p>None yet</p>
        ) : (
          <ul>
            {snapshot.unlockedFeatures.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </div>
      {error ? <p className="error">{error}</p> : null}
    </main>
  );
}
