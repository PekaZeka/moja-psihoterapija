import type { APIRoute } from "astro";

export const prerender = false;

// Read at runtime from the actual process environment (set when the Node
// server is started on the VPS), falling back to build-time import.meta.env.
const env = (key: string): string | undefined =>
  (globalThis as any)?.process?.env?.[key] ?? (import.meta.env as any)?.[key];

const isValidEmail = (value: unknown): value is string =>
  typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const escapeHtml = (value: unknown): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, phone, email, contactMethod, message, website } = body;

    // Honeypot — real users never fill this hidden field. Silently accept.
    if (website) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!name || !phone) {
      return new Response(JSON.stringify({ error: "Name and phone are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = env("RESEND_API_KEY");
    const CONTACT_EMAIL = env("CONTACT_EMAIL") || "info@mojapsihoterapija.com";
    // Must be an address on a domain verified in Resend (SPF/DKIM). The
    // onboarding@resend.dev fallback only delivers to the Resend account owner.
    const CONTACT_FROM = env("CONTACT_FROM") || "Sajt <onboarding@resend.dev>";

    if (!RESEND_API_KEY || RESEND_API_KEY === "re_xxxxxxxxxxxx") {
      // No key configured (dev / not yet set up): log instead of sending.
      console.log("Contact form submission:", { name, phone, email, contactMethod, message });
      return new Response(JSON.stringify({ success: true, dev: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { Resend } = await import("resend");
    const resend = new Resend(RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: CONTACT_FROM,
      to: CONTACT_EMAIL,
      replyTo: isValidEmail(email) ? email : undefined,
      subject: `Nova poruka sa sajta od: ${name}`,
      html: `
        <h2>Nova poruka sa sajta</h2>
        <p><strong>Ime:</strong> ${escapeHtml(name)}</p>
        <p><strong>Telefon:</strong> ${escapeHtml(phone)}</p>
        ${email ? `<p><strong>Email:</strong> ${escapeHtml(email)}</p>` : ""}
        ${contactMethod ? `<p><strong>Način kontakta:</strong> ${escapeHtml(contactMethod)}</p>` : ""}
        ${message ? `<p><strong>Poruka:</strong></p><p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>` : ""}
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(JSON.stringify({ error: "Email delivery failed" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
