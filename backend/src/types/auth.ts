export type UserRole = "admin" | "staff" | "user";

export interface JwtPayload {
  sub: number;
  role: UserRole;
  type: "access" | "refresh";
}






