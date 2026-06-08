// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth";

// NextAuth exposes optimized GET and POST routing protocols to listen to session loops
export const { GET, POST } = handlers;
