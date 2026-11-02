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

async function setPassword() {
  const email = process.argv[2] || "admin@wafflecastle.in";
  const newPassword = process.argv[3] || "Waffle@Castle2026!";

  try {
    const hashedPassword = hashPassword(newPassword);

    const res = await pool.query(
      `UPDATE public.admin_users
       SET password_hash = $1
       WHERE LOWER(email) = LOWER($2)
       RETURNING id, email, name;`,
      [hashedPassword, email]
    );

    if (res.rows.length === 0) {
      // If user doesn't exist, insert
      await pool.query(
        `INSERT INTO public.admin_users (email, password_hash, name)
         VALUES ($1, $2, $3);`,
        [email, hashedPassword, "Waffle Castle Admin"]
      );
      console.log(`✓ Admin user created and password set for: ${email}`);
    } else {
      console.log(`✓ Password successfully updated for: ${email}`);
    }

    console.log(`🔑 New Password: ${newPassword}`);
    await pool.end();
  } catch (err) {
    console.error("Error setting password:", err);
    await pool.end();
    process.exit(1);
  }
}

setPassword();

