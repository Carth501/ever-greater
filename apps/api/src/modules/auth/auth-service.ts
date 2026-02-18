import { randomUUID, scryptSync, timingSafeEqual } from "node:crypto";

interface AuthUserRecord {
  userId: string;
  email: string;
  passwordHash: string;
  salt: string;
}

export interface AuthSession {
  sessionId: string;
  userId: string;
}

export class AuthService {
  private readonly usersByEmail = new Map<string, AuthUserRecord>();
  private readonly usersById = new Map<string, AuthUserRecord>();
  private readonly sessionsById = new Map<string, string>();

  register(email: string, password: string): AuthSession {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    if (this.usersByEmail.has(email)) {
      throw new Error("Email is already registered");
    }

    const salt = randomUUID();
    const passwordHash = hashPassword(password, salt);
    const user: AuthUserRecord = {
      userId: randomUUID(),
      email,
      passwordHash,
      salt,
    };

    this.usersByEmail.set(email, user);
    this.usersById.set(user.userId, user);

    const sessionId = randomUUID();
    this.sessionsById.set(sessionId, user.userId);

    return {
      sessionId,
      userId: user.userId,
    };
  }

  login(email: string, password: string): AuthSession {
    const user = this.usersByEmail.get(email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const provided = hashPassword(password, user.salt);
    const expectedBuffer = Buffer.from(user.passwordHash, "hex");
    const providedBuffer = Buffer.from(provided, "hex");

    if (!timingSafeEqual(expectedBuffer, providedBuffer)) {
      throw new Error("Invalid credentials");
    }

    const sessionId = randomUUID();
    this.sessionsById.set(sessionId, user.userId);

    return {
      sessionId,
      userId: user.userId,
    };
  }

  getUserBySession(
    sessionId: string,
  ): { userId: string; email: string } | undefined {
    const userId = this.sessionsById.get(sessionId);
    if (!userId) {
      return undefined;
    }

    const user = this.usersById.get(userId);
    if (!user) {
      return undefined;
    }

    return {
      userId: user.userId,
      email: user.email,
    };
  }
}

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString("hex");
}
