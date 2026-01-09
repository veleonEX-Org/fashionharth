import { io, Socket } from "socket.io-client";

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public connect(token: string): Socket {
    if (this.socket) return this.socket;

    this.socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
      auth: { token },
      withCredentials: true,
    });

    this.socket.on("connect", () => {
      console.log("Connected to Socket.io server");
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = SocketService.getInstance();
