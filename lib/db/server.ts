import { cookies } from "next/headers";
import { from } from "./index";
import { verifySessionToken } from "./auth";

export async function createClient() {
  const cookieStore = await cookies();
  const token = cookieStore.get("waffle_admin_session")?.value;
  const session = token ? verifySessionToken(token) : null;

  return {
    from(tableName: string) {
      return from(tableName);
    },
    auth: {
      async getUser() {
        return {
          data: {
            user: session
              ? {
                  id: session.id,
                  email: session.email,
                  name: session.name,
                }
              : null,
          },
          error: null,
        };
      },
    },
  };
}

export function createServiceClient() {
  return {
    from(tableName: string) {
      return from(tableName);
    },
  };
}
