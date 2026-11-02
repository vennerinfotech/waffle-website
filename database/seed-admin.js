const { Pool } = require("pg");
const crypto = require("crypto");

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:PleskPgSecret123!@localhost:5432/wafflecastle",
});

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function seedAdmin() {
  try {
    const password = "password";
    const admins = [
      { email: "admin@wafflecastle.in", password, name: "Waffle Castle Admin" },
      { email: "admin@wafflecastle.com", password, name: "Waffle Castle Admin" },
    ];

    for (const a of admins) {
      const hashedPassword = hashPassword(a.password);
      await pool.query(
        `INSERT INTO public.admin_users (email, password_hash, name)
         VALUES ($1, $2, $3)
         ON CONFLICT (email)
         DO UPDATE SET password_hash = $2, name = $3;`,
        [a.email, hashedPassword, a.name]
      );
      console.log(`✓ Admin user successfully seeded: ${a.email} (Password: ${a.password})`);
    }

    await pool.end();
  } catch (err) {
    console.error("Error seeding admin user:", err);
    process.exit(1);
  }
}

seedAdmin();
