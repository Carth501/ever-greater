import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Snapshot = {
  globalTickets: string;
  userContributedTickets: string;
  personalStock: number;
  unlockedFeatures: string[];
};

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:3000";

export default function App() {
  const [email, setEmail] = useState("player@example.com");
  const [password, setPassword] = useState("password123");
  const [token, setToken] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authHeaders = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : null),
    [token],
  );

  async function fetchSnapshot(currentToken: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/game/snapshot`, {
      headers: { Authorization: `Bearer ${currentToken}` },
    });

    if (!response.ok) {
      throw new Error("Unable to fetch game snapshot");
    }

    setSnapshot((await response.json()) as Snapshot);
  }

  async function handleAuth(path: "/auth/register" | "/auth/login") {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const payload = (await response.json()) as {
        token?: string;
        error?: string;
      };

      if (!response.ok || !payload.token) {
        throw new Error(payload.error ?? "Authentication failed");
      }

      setToken(payload.token);
      await fetchSnapshot(payload.token);
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePrintTicket() {
    if (!authHeaders) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/game/print-ticket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({ actionId: `mobile-${Date.now()}-${Math.random()}` }),
      });

      const payload = (await response.json()) as Snapshot | { error?: string };
      if (!response.ok) {
        throw new Error((payload as { error?: string }).error ?? "Unable to print ticket");
      }

      setSnapshot(payload as Snapshot);
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

    const interval = setInterval(() => {
      fetchSnapshot(token).catch(() => {
        // ignore polling error and keep trying
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [token]);

  if (!token || !snapshot) {
    return (
      <SafeAreaView style={styles.root}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Ever Greater</Text>
          <Text style={styles.subtitle}>Login or create account to start.</Text>

          <Text style={styles.label}>API Base URL</Text>
          <Text style={styles.value}>{API_BASE_URL}</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />

          <View style={styles.buttonGroup}>
            <Button title="Log in" onPress={() => handleAuth("/auth/login")} disabled={isLoading} />
            <Button
              title="Create account"
              onPress={() => handleAuth("/auth/register")}
              disabled={isLoading}
            />
          </View>

          {isLoading ? <ActivityIndicator /> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Ever Greater</Text>

        <Text style={styles.label}>Global tickets</Text>
        <Text style={styles.value}>{snapshot.globalTickets}</Text>

        <Text style={styles.label}>Your contributed tickets</Text>
        <Text style={styles.value}>{snapshot.userContributedTickets}</Text>

        <Text style={styles.label}>Your stock</Text>
        <Text style={styles.value}>{snapshot.personalStock}</Text>

        <Button title="Print a ticket" onPress={handlePrintTicket} disabled={isLoading} />

        <Text style={styles.label}>Unlocked features</Text>
        {snapshot.unlockedFeatures.length === 0 ? (
          <Text style={styles.value}>None yet</Text>
        ) : (
          snapshot.unlockedFeatures.map((feature) => (
            <Text key={feature} style={styles.value}>
              - {feature}
            </Text>
          ))
        )}

        {isLoading ? <ActivityIndicator /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    padding: 20,
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  value: {
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  buttonGroup: {
    gap: 10,
  },
  error: {
    fontWeight: "700",
  },
});
