import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const path = req.nextUrl.pathname;

        // Rutas públicas que no requieren sesión
        if (
          path.startsWith("/login") ||
          path.startsWith("/auth") ||
          (path.startsWith("/api/news") && req.method === "GET")
        ) {
          return true;
        }

        // Cualquier otra ruta requiere sesión activa
        return !!token;
      },
    },
    pages: {
      signIn: '/login', // Redirige aquí si no está autenticado
    }
  }
);

// Define las rutas en las que se ejecutará el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/.* (public images)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|images).*)",
  ],
};
