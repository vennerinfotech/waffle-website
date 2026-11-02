import { Pool, QueryResult } from "pg";

// Maintain a single pool instance across hot reloads in development
declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.PGUSER || "postgres"}:${process.env.PGPASSWORD || "1756"}@${
    process.env.PGHOST || "localhost"
  }:${process.env.PGPORT || "5432"}/${process.env.PGDATABASE || "waffle_db"}`;

export const pool: Pool =
  globalThis.__pgPool ||
  new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__pgPool = pool;
}

export async function query<T = any>(
  text: string,
  params: any[] = []
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}

// Server-side PostgreSQL query builder
export class ServerQueryBuilder<T = any> implements PromiseLike<{ data: any; count?: number | null; error: any }> {
  private tableName: string;
  private selectColumns: string = "*";
  private isCount: boolean = false;
  private isHead: boolean = false;
  private whereClauses: { col: string; op: "=" | "!="; val: any }[] = [];
  private orderClauses: { col: string; ascending: boolean }[] = [];
  private limitCount?: number;
  private isSingle: boolean = false;
  private isMaybeSingle: boolean = false;
  private insertData?: any | any[];
  private updateData?: any;
  private isDelete: boolean = false;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(columns: string = "*", options?: { count?: "exact"; head?: boolean }) {
    this.selectColumns = columns;
    if (options?.count === "exact") {
      this.isCount = true;
    }
    if (options?.head) {
      this.isHead = true;
    }
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
    this.insertData = values;
    return this;
  }

  update(values: any) {
    this.updateData = values;
    return this;
  }

  delete() {
    this.isDelete = true;
    return this;
  }

  async execute(): Promise<{ data: any; count?: number | null; error: any }> {
    try {
      // 1. INSERT
      if (this.insertData !== undefined) {
        const rows = Array.isArray(this.insertData) ? this.insertData : [this.insertData];
        if (rows.length === 0) {
          return { data: [], error: null };
        }

        const keys = Object.keys(rows[0]);
        const values: any[] = [];
        const valuePlaceholders: string[] = [];

        let paramIdx = 1;
        for (const row of rows) {
          const rowPlaceholders: string[] = [];
          for (const key of keys) {
            rowPlaceholders.push(`$${paramIdx++}`);
            values.push(row[key] !== undefined ? row[key] : null);
          }
          valuePlaceholders.push(`(${rowPlaceholders.join(", ")})`);
        }

        const colsList = keys.map((k) => `"${k}"`).join(", ");
        const sql = `INSERT INTO public."${this.tableName}" (${colsList}) VALUES ${valuePlaceholders.join(
          ", "
        )} RETURNING *;`;

        const res = await query(sql, values);
        return {
          data: Array.isArray(this.insertData) ? res.rows : res.rows[0] || null,
          error: null,
        };
      }

      // 2. UPDATE
      if (this.updateData !== undefined) {
        const keys = Object.keys(this.updateData);
        if (keys.length === 0) {
          return { data: null, error: null };
        }

        const setParts: string[] = [];
        const values: any[] = [];
        let paramIdx = 1;

        for (const key of keys) {
          setParts.push(`"${key}" = $${paramIdx++}`);
          values.push(this.updateData[key]);
        }

        const whereParts: string[] = [];
        for (const w of this.whereClauses) {
          whereParts.push(`"${w.col}" ${w.op} $${paramIdx++}`);
          values.push(w.val);
        }

        const whereSql = whereParts.length > 0 ? `WHERE ${whereParts.join(" AND ")}` : "";
        const sql = `UPDATE public."${this.tableName}" SET ${setParts.join(
          ", "
        )} ${whereSql} RETURNING *;`;

        const res = await query(sql, values);
        return { data: res.rows, error: null };
      }

      // 3. DELETE
      if (this.isDelete) {
        const whereParts: string[] = [];
        const values: any[] = [];
        let paramIdx = 1;

        for (const w of this.whereClauses) {
          whereParts.push(`"${w.col}" ${w.op} $${paramIdx++}`);
          values.push(w.val);
        }

        const whereSql = whereParts.length > 0 ? `WHERE ${whereParts.join(" AND ")}` : "";
        const sql = `DELETE FROM public."${this.tableName}" ${whereSql} RETURNING *;`;

        const res = await query(sql, values);
        return { data: res.rows, error: null };
      }

      // 4. SELECT / COUNT
      const values: any[] = [];
      let paramIdx = 1;
      const whereParts: string[] = [];

      for (const w of this.whereClauses) {
        whereParts.push(`"${w.col}" ${w.op} $${paramIdx++}`);
        values.push(w.val);
      }
      const whereSql = whereParts.length > 0 ? `WHERE ${whereParts.join(" AND ")}` : "";

      // Exact count query
      let exactCount: number | null = null;
      if (this.isCount) {
        const countSql = `SELECT COUNT(*)::int as count FROM public."${this.tableName}" ${whereSql};`;
        const countRes = await query(countSql, values);
        exactCount = countRes.rows[0]?.count ?? 0;

        if (this.isHead) {
          return { data: null, count: exactCount, error: null };
        }
      }

      // Order
      let orderSql = "";
      if (this.orderClauses.length > 0) {
        const parts = this.orderClauses.map(
          (o) => `"${o.col}" ${o.ascending ? "ASC" : "DESC"}`
        );
        orderSql = `ORDER BY ${parts.join(", ")}`;
      }

      // Limit
      let limitSql = "";
      if (this.limitCount !== undefined) {
        limitSql = `LIMIT ${this.limitCount}`;
      }

      // Columns
      const cols = this.selectColumns === "*" ? "*" : this.selectColumns;
      const sql = `SELECT ${cols} FROM public."${this.tableName}" ${whereSql} ${orderSql} ${limitSql};`;

      const res = await query(sql, values);

      if (this.isSingle) {
        return {
          data: res.rows[0] ?? null,
          count: exactCount,
          error: res.rows.length === 0 ? new Error("Row not found") : null,
        };
      }

      if (this.isMaybeSingle) {
        return {
          data: res.rows[0] ?? null,
          count: exactCount,
          error: null,
        };
      }

      return {
        data: res.rows,
        count: exactCount,
        error: null,
      };
    } catch (err: any) {
      console.error(`PostgreSQL query error on table ${this.tableName}:`, err);
      return { data: null, count: 0, error: err };
    }
  }

  // Makes ServerQueryBuilder awaitable
  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: { data: any; count?: number | null; error: any }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

export function from(tableName: string) {
  return new ServerQueryBuilder(tableName);
}
