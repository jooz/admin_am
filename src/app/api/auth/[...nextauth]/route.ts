import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                // Validación de credenciales (admin/admin123)
                if (credentials?.username === "admin" && credentials?.password === "admin123") {
                    return {
                        id: "1",
                        name: "Admin User",
                        email: "admin@example.com"
                    };
                }
                return null;
            }
        })
    ],
    pages: {
        signIn: "/authentication/login",
        error: "/authentication/login"
    },
    session: {
        strategy: "jwt" as const,
        maxAge: 30 * 24 * 60 * 60, // 30 días
    },
    secret: process.env.NEXTAUTH_SECRET || "your-secret-key",
    callbacks: {
        async jwt({ token, user }: any) {
            // Si es la primera vez que el usuario se autentica
            if (user) {
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
            }
            return token;
        },
        async session({ session, token }: any) {
            // Añadir el ID al objeto de sesión
            session.user.id = token.id;
            return session;
        }
    }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
