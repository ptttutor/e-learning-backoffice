import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import LineProvider from "next-auth/providers/line";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Debug environment variables
console.log("LINE_CLIENT_ID:", process.env.LINE_CLIENT_ID ? "Set" : "Not set");
console.log(
  "LINE_CLIENT_SECRET:",
  process.env.LINE_CLIENT_SECRET ? "Set" : "Not set"
);

export const authOptions = {
  // ไม่ใช้ PrismaAdapter เพื่อจัดการ LINE login เอง
  // adapter: PrismaAdapter(prisma),
  providers: [
    LineProvider({
      clientId: process.env.LINE_CLIENT_ID,
      clientSecret: process.env.LINE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "profile openid",
        },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user || !user.password) {
          return null;
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "line") {
        try {
          // ตรวจสอบว่ามี user ที่มี lineId นี้อยู่แล้วหรือไม่
          const existingUser = await prisma.user.findUnique({
            where: { lineId: account.providerAccountId },
          });

          if (existingUser) {
            // อัปเดตข้อมูลล่าสุด
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                name: user.name,
                image: user.image,
              },
            });
            user.id = existingUser.id;
            user.role = existingUser.role;
            user.email = existingUser.email;
          } else {
            // สร้าง user ใหม่
            const newUser = await prisma.user.create({
              data: {
                name: user.name,
                image: user.image,
                lineId: account.providerAccountId,
                role: "STUDENT",
                // ไม่ต้องใส่ email ถ้า LINE ไม่ส่งมา
                ...(user.email && { email: user.email }),
              },
            });
            user.id = newUser.id;
            user.role = newUser.role;
            user.email = newUser.email;
          }
          return true;
        } catch (error) {
          console.error("LINE login error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role;
        token.userId = user.id;
        token.lineId = user.lineId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};
