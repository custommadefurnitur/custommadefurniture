// src/auth.ts
import NextAuth, { CredentialsSignin } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { LoginSchema } from "@/lib/validation";

// =========================================================================
// 1. NEXTAUTH V5 TYPES AUGMENTATION 
// This tells TypeScript that your user records contain 'id' and 'role' fields.
// =========================================================================
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "user" | "admin";
    } & import("next-auth").DefaultSession["user"];
  }

  interface User {
    role?: "user" | "admin";
  }
}

// =========================================================================
// 2. AUTHENTICATION LOGIC & CONFIGURATION
// =========================================================================
class CustomAuthError extends CredentialsSignin {
  constructor(code: string, message?: string) {
    super();
    this.code = code;
    this.message = message || code;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt", // JSON Web Tokens provide instant layout rendering in Server Components
    maxAge: 24 * 60 * 60, // Active token validity lifespan: exactly 24 hours
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log("🔐 Authorization attempt started");
          
          // 1. Structural Verification: Check data input alignment via Zod
          const validatedFields = LoginSchema.safeParse(credentials);
          if (!validatedFields.success) {
            console.error("❌ Validation failed:", validatedFields.error);
            throw new CustomAuthError("InvalidCredentials", "Malformed email or password structure.");
          }

          const { email, password } = validatedFields.data;
          console.log(`🔍 Looking up user: ${email}`);

          // 2. Database Connection Context Resolution
          await connectDB();
          console.log("✅ Database connected");

          // 3. Document Extraction: Query user document profile by lowercase email
          const user = await User.findOne({ email: email.toLowerCase().trim() });
          if (!user) {
            console.error(`❌ User not found: ${email}`);
            throw new CustomAuthError("InvalidCredentials", "No account found matching this email address.");
          }
          console.log(`✅ User found: ${user.email}`);

          // 4. Cryptographic Assessment: Evaluate matching string passwords
          const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
          if (!isPasswordValid) {
            console.error(`❌ Invalid password for user: ${email}`);
            throw new CustomAuthError("InvalidCredentials", "Invalid credentials provided. Please try again.");
          }
          console.log(`✅ Password verified for: ${email}`);

          // 5. CRITICAL PERMISSION GUARD: Block users who have not verified their account via OTP
          if (!user.isVerified) {
            console.warn(`⚠️ Unverified account login attempt: ${email}`);
            throw new CustomAuthError("UNVERIFIED_ACCOUNT", "UNVERIFIED_ACCOUNT");
          }
          console.log(`✅ Account verified for: ${email}`);

          // 6. Return safe, authorized profile metadata definitions
          console.log(`✅ Authorization successful for: ${email}`);
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role || "user",
          };
        } catch (error) {
          console.error("❌ Authorization error:", error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    // Handle authentication errors properly
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
    
    // Inject the user's Mongoose database parameters securely into the session token
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user.role || "user") as "user" | "admin";
      }
      return token;
    },
    
    // Expose structural identity and role metrics out to Client Views & Server Components
    async session({ session, token }) {
      if (token && session.user) {
        const jwtToken = token as { id: string; role: "user" | "admin" };
        session.user.id = jwtToken.id;
        session.user.role = jwtToken.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // Routes users directly to our localized frontend entry form page
    error: "/login",  // Relays backend login execution errors onto the UI page params
  },
  secret: process.env.AUTH_SECRET,
});
