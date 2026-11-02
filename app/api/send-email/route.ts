import nodemailer from "nodemailer";
import { query } from "@/lib/db";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContactPayload {
  formType: "contact";
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface FranchisePayload {
  formType: "franchise";
  firstName: string;
  lastName: string;
  email: string;
  contactNo: string;
  city: string;
  state: string;
  planToStart: string;
}

interface EventsPayload {
  formType: "events";
  name: string;
  phone: string;
  email: string;
  eventType: string;
  message: string;
}

type EmailPayload = ContactPayload | FranchisePayload | EventsPayload;

// ─── Shared template parts ────────────────────────────────────────────────────

const emailHeader = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Waffle Castle Notification</title>
</head>
<body style="margin:0;padding:0;background-color:#fdf6ec;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fdf6ec;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 8px 40px rgba(180,110,40,0.12);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#7c3a00 0%,#c8691a 60%,#f6a52a 100%);padding:36px 40px;text-align:center;">
              <p style="margin:0 0 6px 0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.7);">Waffle Castle</p>
              <h1 style="margin:0;font-size:26px;font-weight:800;color:#fff;letter-spacing:1px;">👑 Taste The Royal Waffle</h1>
            </td>
          </tr>
`;

const emailFooter = `
          <!-- Footer -->
          <tr>
            <td style="background:#7c3a00;padding:28px 40px;text-align:center;">
              <p style="margin:0 0 4px 0;color:rgba(255,255,255,0.9);font-size:13px;font-weight:600;">Waffle Castle · info@wafflecastle.in</p>
              <p style="margin:0;color:rgba(255,255,255,0.5);font-size:11px;">This is an automated notification from your website contact forms.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

function field(label: string, value: string) {
  return `
    <tr>
      <td style="padding:0 0 16px 0;">
        <p style="margin:0 0 4px 0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#c8691a;">${label}</p>
        <p style="margin:0;font-size:15px;color:#2b1206;line-height:1.6;background:#fdf6ec;border-left:3px solid #f6a52a;padding:10px 14px;border-radius:0 8px 8px 0;">${value || "—"}</p>
      </td>
    </tr>
  `;
}

function badge(text: string, color: string = "#f6a52a") {
  return `<span style="display:inline-block;background:${color};color:#fff;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:4px 12px;border-radius:20px;margin-bottom:24px;">${text}</span>`;
}

// ─── Template builders ────────────────────────────────────────────────────────

function buildContactTemplate(p: ContactPayload): { subject: string; html: string } {
  const subject = `📬 New Contact Enquiry — ${p.name}`;
  const html = `
${emailHeader}
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 20px 0;text-align:center;">
                ${badge("📨 Contact Enquiry")}
              </p>
              <h2 style="margin:0 0 8px 0;font-size:20px;color:#7c3a00;">Someone reached out from the website!</h2>
              <p style="margin:0 0 30px 0;font-size:14px;color:rgba(43,18,6,0.7);">Here are the details submitted via the <strong>Contact Us</strong> page.</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${field("Full Name", p.name)}
                ${field("Email Address", p.email)}
                ${field("Phone Number", p.phone)}
                ${field("Message", p.message)}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 36px;">
              <p style="margin:0;font-size:13px;color:rgba(43,18,6,0.5);border-top:1px solid #f2e4d0;padding-top:20px;">Reply directly to <a href="mailto:${p.email}" style="color:#c8691a;">${p.email}</a> to get back to this visitor.</p>
            </td>
          </tr>
${emailFooter}
  `;
  return { subject, html };
}

function buildFranchiseTemplate(p: FranchisePayload): { subject: string; html: string } {
  const subject = `🏰 New Franchise Application — ${p.firstName} ${p.lastName}`;
  const html = `
${emailHeader}
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 20px 0;text-align:center;">
                ${badge("🏰 Franchise Application", "#7c3a00")}
              </p>
              <h2 style="margin:0 0 8px 0;font-size:20px;color:#7c3a00;">A new franchise enquiry has arrived!</h2>
              <p style="margin:0 0 30px 0;font-size:14px;color:rgba(43,18,6,0.7);">Details submitted via the <strong>Franchise</strong> application page.</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${field("First Name", p.firstName)}
                ${field("Last Name", p.lastName)}
                ${field("Email Address", p.email)}
                ${field("Contact No", p.contactNo)}
                ${field("City", p.city)}
                ${field("State", p.state)}
                ${field("Plan to Start Within", p.planToStart)}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 36px;">
              <p style="margin:0;font-size:13px;color:rgba(43,18,6,0.5);border-top:1px solid #f2e4d0;padding-top:20px;">Reply to <a href="mailto:${p.email}" style="color:#c8691a;">${p.email}</a> or call <strong>${p.contactNo}</strong> to follow up.</p>
            </td>
          </tr>
${emailFooter}
  `;
  return { subject, html };
}

function buildEventsTemplate(p: EventsPayload): { subject: string; html: string } {
  const subject = `👑 New Event Reservation — ${p.name} (${p.eventType})`;
  const html = `
${emailHeader}
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 20px 0;text-align:center;">
                ${badge("🎉 Event Reservation", "#c8691a")}
              </p>
              <h2 style="margin:0 0 8px 0;font-size:20px;color:#7c3a00;">A new reservation request has come in!</h2>
              <p style="margin:0 0 30px 0;font-size:14px;color:rgba(43,18,6,0.7);">Details submitted via the <strong>Royal Events</strong> page.</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${field("Full Name", p.name)}
                ${field("Phone Number", p.phone)}
                ${field("Email Address", p.email)}
                ${field("Reservation Type", p.eventType)}
                ${field("Message / Special Requests", p.message)}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 36px;">
              <p style="margin:0;font-size:13px;color:rgba(43,18,6,0.5);border-top:1px solid #f2e4d0;padding-top:20px;">Reply to <a href="mailto:${p.email}" style="color:#c8691a;">${p.email}</a> or call <strong>${p.phone}</strong> to confirm the reservation.</p>
            </td>
          </tr>
${emailFooter}
  `;
  return { subject, html };
}

// ─── Route Handler ─────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as EmailPayload;

    let subject: string;
    let html: string;
    let replyTo: string;

    switch (payload.formType) {
      case "contact":
        ({ subject, html } = buildContactTemplate(payload));
        replyTo = payload.email;
        break;
      case "franchise":
        ({ subject, html } = buildFranchiseTemplate(payload));
        replyTo = payload.email;
        break;
      case "events":
        ({ subject, html } = buildEventsTemplate(payload));
        replyTo = payload.email;
        break;
      default:
        return Response.json({ error: "Unknown formType" }, { status: 400 });
    }

    // ─── Save to PostgreSQL ──────────────────────────────────────
    let dbSuccess = false;
    try {
      if (payload.formType === "contact") {
        await query(
          `INSERT INTO public.contact_leads (name, email, phone, message, status) VALUES ($1, $2, $3, $4, $5);`,
          [payload.name, payload.email, payload.phone || "", payload.message || "", "New"]
        );
      } else if (payload.formType === "franchise") {
        await query(
          `INSERT INTO public.franchise_leads (first_name, last_name, email, contact_no, city, state, plan_to_start, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
          [
            payload.firstName,
            payload.lastName,
            payload.email,
            payload.contactNo,
            payload.city,
            payload.state,
            payload.planToStart || "",
            "New",
          ]
        );
      } else if (payload.formType === "events") {
        await query(
          `INSERT INTO public.event_bookings (name, phone, email, event_type, message, status) VALUES ($1, $2, $3, $4, $5, $6);`,
          [payload.name, payload.phone, payload.email, payload.eventType || "Table Reservation", payload.message || "", "Pending"]
        );
      }
      dbSuccess = true;
    } catch (dbErr) {
      console.error("[send-email] PostgreSQL insert failed:", dbErr);
    }

    // ─── Send Email ───────────────────────────────────────────────
    let emailSent = false;
    let emailError: string | null = null;
    try {
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn("[send-email] SMTP credentials are not set. Skipping email sending.");
        emailError = "SMTP credentials are not set in .env.local";
      } else {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST ?? "smtp.hostinger.com",
          port: Number(process.env.SMTP_PORT ?? 587),
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: process.env.SMTP_FROM ?? "Waffle Castle <info@wafflecastle.in>",
          to: process.env.SMTP_TO ?? "info@wafflecastle.in",
          replyTo,
          subject,
          html,
        });
        emailSent = true;
      }
    } catch (emailErr) {
      console.error("[send-email] Email sending failed:", emailErr);
      emailError = emailErr instanceof Error ? emailErr.message : String(emailErr);
    }

    // Return success if either DB save or email notification succeeded
    if (dbSuccess || emailSent) {
      return Response.json({
        success: true,
        dbSaved: dbSuccess,
        emailSent: emailSent,
        emailError: emailError
      });
    } else {
      return Response.json(
        {
          error: "Failed to generate lead in database and failed to send email notification.",
          dbSaved: false,
          emailSent: false,
          emailError: emailError
        },
        { status: 500 }
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[send-email] General handler ERROR:", message);
    return Response.json(
      { error: message },
      { status: 500 }
    );
  }
}
