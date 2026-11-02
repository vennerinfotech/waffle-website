export class ClientQueryBuilder<T = any> implements PromiseLike<{ data: any; count?: number | null; error: any }> {
  private tableName: string;
  private action: "select" | "insert" | "update" | "delete" = "select";
  private selectCols: string = "*";
  private isCount: boolean = false;
  private isHead: boolean = false;
  private whereClauses: { col: string; op: "=" | "!="; val: any }[] = [];
  private orderClauses: { col: string; ascending: boolean }[] = [];
  private limitCount?: number;
  private isSingle: boolean = false;
  private isMaybeSingle: boolean = false;
  private payloadData?: any;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(columns: string = "*", options?: { count?: "exact"; head?: boolean }) {
    this.action = "select";
    this.selectCols = columns;
    if (options?.count === "exact") this.isCount = true;
    if (options?.head) this.isHead = true;
    return this;
  }

  eq(column: string, value: any) {
    this.whereClauses.push({ col: column, op: "=", val: value });
    return this;
  }

  neq(column: string, value: any) {
    this.whereClauses.push({ col: column, op: "!=", val: value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderClauses.push({
      col: column,
      ascending: options?.ascending !== false,
    });
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  insert(values: any | any[]) {
    this.action = "insert";
    this.payloadData = values;
    return this;
  }

  update(values: any) {
    this.action = "update";
    this.payloadData = values;
    return this;
  }

  delete() {
    this.action = "delete";
    return this;
  }

  async execute(): Promise<{ data: any; count?: number | null; error: any }> {
    try {
      const res = await fetch("/api/db", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          table: this.tableName,
          action: this.action,
          select: this.selectCols,
          where: this.whereClauses,
          order: this.orderClauses,
          limit: this.limitCount,
          data: this.payloadData,
          count: this.isCount,
          head: this.isHead,
          single: this.isSingle,
          maybeSingle: this.isMaybeSingle,
        }),
      });

      const json = await res.json();
      return json;
    } catch (err: any) {
      return { data: null, count: 0, error: { message: err.message || "Network request failed" } };
    }
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: { data: any; count?: number | null; error: any }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

const browserClient = {
  from(table: string) {
    return new ClientQueryBuilder(table);
  },
  auth: {
    async signInWithPassword({ email, password }: { email: string; password: string }) {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const json = await res.json();
        if (!res.ok) {
          return { data: { user: null, session: null }, error: new Error(json.error || "Login failed") };
        }
        return { data: json, error: null };
      } catch (err: any) {
        return { data: { user: null, session: null }, error: err };
      }
    },
    async signOut() {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
        return { error: null };
      } catch (err: any) {
        return { error: err };
      }
    },
    async getUser() {
      try {
        const res = await fetch("/api/auth/user");
        const json = await res.json();
        return { data: { user: json.user }, error: null };
      } catch (err: any) {
        return { data: { user: null }, error: err };
      }
    },
  },
};

export function createClient() {
  return browserClient;
}
