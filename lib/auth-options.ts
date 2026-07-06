import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("[auth] credenciales incompletas");
            return null;
          }

          console.log("[auth] buscando usuario:", credentials.email);
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          console.log("[auth] usuario encontrado?", !!user);
          if (!user) {
            console.log("[auth] usuario no existe en DB");
            return null;
          }

          console.log("[auth] tiene password?", !!user?.password);
          if (!user?.password) {
            console.log("[auth] usuario sin password en DB");
            return null;
          }

          console.log("[auth] comparando password...");
          const isValid = await bcrypt.compare(credentials.password, user.password);
          console.log("[auth] password valido?", isValid);

          if (!isValid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            wholesaleStatus: user.wholesaleStatus,
            companyName: user.companyName ?? undefined,
            companyNIT: user.companyNIT ?? undefined,
          };
        } catch (error) {
          console.error("[auth] ERROR en authorize:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user?.role;
        token.id = user?.id;
        token.wholesaleStatus = user?.wholesaleStatus;
        token.companyName = user?.companyName;
        token.companyNIT = user?.companyNIT;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session?.user) {
        (session.user as any).role = token?.role;
        (session.user as any).id = token?.id;
        (session.user as any).wholesaleStatus = token?.wholesaleStatus;
        (session.user as any).companyName = token?.companyName;
        (session.user as any).companyNIT = token?.companyNIT;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
