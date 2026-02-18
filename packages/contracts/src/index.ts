export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  token: string;
  userId: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: string;
}

export interface PrintTicketRequest {
  actionId: string;
}

export interface GameSnapshot {
  globalTickets: string;
  userContributedTickets: string;
  personalStock: number;
  unlockedFeatures: string[];
}

export interface MeResponse {
  userId: string;
  email: string;
}

export interface RealtimeEvent {
  type: "game_snapshot";
  payload: GameSnapshot;
}
