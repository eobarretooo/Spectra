import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "..", "data");
const ACCOUNTS_FILE = path.join(DATA_DIR, "accounts.json");
const TOKENS_FILE = path.join(DATA_DIR, "tokens.json");

// Mercado Pago & OAuth environment settings
const MERCADO_PAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || "";
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || "";
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || "";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

export interface StoredAccount {
  id: string;
  username: string;
  displayName: string;
  passwordHash?: string;
  email?: string;
  flags: string[];
  points: number;
  features: string[];
  providers: string[];
  bio?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  callSeconds: number;
  micSeconds: number;
  shareSeconds: number;
  premium?: {
    plan: string;
    method?: "subscription" | "pix";
    status: string;
    currentPeriodEnd: number;
    provider: string;
    providerRef: string;
    lastPaymentId: string | null;
    cancelledAt: number | null;
    updatedAt: number;
  } | null;
  createdAt: number;
  updatedAt: number;
}

interface OAuthTicket {
  ticket: string;
  provider: "discord" | "google";
  suggestedUsername: string;
  suggestedDisplayName: string;
  returnTo: string;
  createdAt: number;
}

let accounts: Map<string, StoredAccount> = new Map();
let tokens: Map<string, string> = new Map(); // token -> accountId
const oauthTickets: Map<string, OAuthTicket> = new Map(); // ticket -> OAuthTicket
const oauthStates: Map<string, { provider: "discord" | "google"; returnTo: string }> = new Map();

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadState() {
  ensureDataDir();
  try {
    if (fs.existsSync(ACCOUNTS_FILE)) {
      const raw = fs.readFileSync(ACCOUNTS_FILE, "utf-8");
      const list: StoredAccount[] = JSON.parse(raw);
      accounts = new Map(list.map((a) => [a.id, a]));
    }
  } catch (err) {
    console.error("Failed to load accounts.json:", err);
  }

  try {
    if (fs.existsSync(TOKENS_FILE)) {
      const raw = fs.readFileSync(TOKENS_FILE, "utf-8");
      const map: Record<string, string> = JSON.parse(raw);
      tokens = new Map(Object.entries(map));
    }
  } catch (err) {
    console.error("Failed to load tokens.json:", err);
  }
}

function persistState() {
  ensureDataDir();
  try {
    const list = Array.from(accounts.values());
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(list, null, 2), "utf-8");
    const tokenObj = Object.fromEntries(tokens.entries());
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokenObj, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save accounts/tokens:", err);
  }
}

loadState();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(":");
    if (!salt || !hash) return false;
    const computed = scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, "hex");
    return timingSafeEqual(computed, expected);
  } catch {
    return false;
  }
}

function publicAccount(account: StoredAccount) {
  const { passwordHash: _, ...pub } = account;
  return pub;
}

export const SPECTRA_PLANS = [
  {
    id: "premium",
    title: "Spectra Pro",
    description: "Qualidade profissional de streaming, 4K/240fps e badge exclusiva de verificado.",
    iconId: "verified",
    priceCents: 490,
    priceLabel: "R$ 4,90",
    pixPriceCents: 490,
    pixPriceLabel: "R$ 4,90",
    currency: "BRL",
    frequency: 1,
    frequencyType: "months",
    features: [
      "verified_badge",
      "quality_2160p",
      "quality_1440p",
      "fps_120",
      "bitrate_maximo",
      "no_ads",
      "avatar_gallery",
      "avatar_upload",
      "banner_upload",
      "room_theme",
      "room_theme_publish",
      "room_theme_set",
      "room_theme_gradient",
    ],
    cycles: [
      {
        cycle: "monthly",
        priceCents: 490,
        priceLabel: "R$ 4,90",
        pixPriceCents: 490,
        pixPriceLabel: "R$ 4,90",
        fullPriceCents: null,
        fullPriceLabel: null,
        discountPercent: 0,
        monthlyEquivalentLabel: "R$ 4,90",
        periodDays: 30,
      },
      {
        cycle: "yearly",
        priceCents: 3990,
        priceLabel: "R$ 39,90",
        pixPriceCents: 3990,
        pixPriceLabel: "R$ 39,90",
        fullPriceCents: 5880,
        fullPriceLabel: "R$ 58,80",
        discountPercent: 32,
        monthlyEquivalentLabel: "R$ 3,32",
        periodDays: 365,
      },
    ],
    purchasePoints: 50,
    dailyPoints: 5,
    available: true,
  },
  {
    id: "premium_max",
    title: "Spectra Pro Max",
    description: "O pacote definitivo: badge dourada, prioridade máxima nos servidores P2P, temas com degradê dinâmico e músicas de perfil.",
    iconId: "gold_verified",
    priceCents: 890,
    priceLabel: "R$ 8,90",
    pixPriceCents: 890,
    pixPriceLabel: "R$ 8,90",
    currency: "BRL",
    frequency: 1,
    frequencyType: "months",
    features: [
      "verified_badge",
      "quality_2160p",
      "quality_1440p",
      "fps_120",
      "bitrate_maximo",
      "no_ads",
      "avatar_gallery",
      "avatar_upload",
      "banner_upload",
      "profile_gradient",
      "profile_song",
      "room_theme",
      "room_theme_publish",
      "room_theme_set",
      "room_theme_gradient",
    ],
    cycles: [
      {
        cycle: "monthly",
        priceCents: 890,
        priceLabel: "R$ 8,90",
        pixPriceCents: 890,
        pixPriceLabel: "R$ 8,90",
        fullPriceCents: null,
        fullPriceLabel: null,
        discountPercent: 0,
        monthlyEquivalentLabel: "R$ 8,90",
        periodDays: 30,
      },
      {
        cycle: "yearly",
        priceCents: 7990,
        priceLabel: "R$ 79,90",
        pixPriceCents: 7990,
        pixPriceLabel: "R$ 79,90",
        fullPriceCents: 10680,
        fullPriceLabel: "R$ 106,80",
        discountPercent: 25,
        monthlyEquivalentLabel: "R$ 6,65",
        periodDays: 365,
      },
    ],
    purchasePoints: 100,
    dailyPoints: 10,
    available: true,
  },
];

export function registerAuthRoutes(app: FastifyInstance) {
  // OAuth providers list
  app.get("/auth/oauth/providers", async () => {
    return {
      providers: [
        { id: "discord", label: "Discord" },
        { id: "google", label: "Google" },
      ],
    };
  });

  // Check username availability
  app.get("/auth/username-available", async (req: FastifyRequest<{ Querystring: { username?: string } }>, reply) => {
    const raw = req.query.username || "";
    const username = raw.trim().toLowerCase();
    const valid = /^[a-z0-9_]{3,20}$/.test(username);
    if (!valid) {
      return { username, valid: false, available: false, error: "O usuário deve ter de 3 a 20 caracteres (letras, números ou _)." };
    }

    const taken = Array.from(accounts.values()).some((a) => a.username.toLowerCase() === username);
    return { username, valid: true, available: !taken };
  });

  // Register new account
  app.post(
    "/auth/register",
    async (
      req: FastifyRequest<{
        Body: { username?: string; displayName?: string; password?: string; email?: string };
      }>,
      reply
    ) => {
      const { username: rawUser, displayName: rawDisplay, password, email } = req.body || {};
      const username = (rawUser || "").trim().toLowerCase();
      const displayName = (rawDisplay || username).trim();

      if (!username || !password) {
        return reply.code(400).send({ error: "Usuário e senha são obrigatórios." });
      }
      if (!/^[a-z0-9_]{3,20}$/.test(username)) {
        return reply.code(400).send({ error: "Usuário inválido. Use 3 a 20 letras, números ou sublinhado." });
      }
      if (password.length < 6) {
        return reply.code(400).send({ error: "A senha deve conter no mínimo 6 caracteres." });
      }

      const exists = Array.from(accounts.values()).some((a) => a.username.toLowerCase() === username);
      if (exists) {
        return reply.code(409).send({ error: "Este nome de usuário já está em uso." });
      }

      const now = Date.now();
      const newAccount: StoredAccount = {
        id: randomUUID(),
        username,
        displayName: displayName || username,
        passwordHash: hashPassword(password),
        email: email?.trim() || undefined,
        flags: ["VERIFIED"],
        points: 50,
        features: ["verified_badge", "quality_1440p", "fps_120"],
        providers: [],
        callSeconds: 0,
        micSeconds: 0,
        shareSeconds: 0,
        createdAt: now,
        updatedAt: now,
      };

      accounts.set(newAccount.id, newAccount);
      const token = randomBytes(32).toString("hex");
      tokens.set(token, newAccount.id);
      persistState();

      return {
        token,
        account: publicAccount(newAccount),
      };
    }
  );

  // Login with existing account
  app.post(
    "/auth/login",
    async (
      req: FastifyRequest<{
        Body: { username?: string; password?: string };
      }>,
      reply
    ) => {
      const { username: rawUser, password } = req.body || {};
      const username = (rawUser || "").trim().toLowerCase();

      if (!username || !password) {
        return reply.code(400).send({ error: "Preencha usuário e senha." });
      }

      const account = Array.from(accounts.values()).find(
        (a) => a.username.toLowerCase() === username || (a.email && a.email.toLowerCase() === username)
      );

      if (!account || !account.passwordHash || !verifyPassword(password, account.passwordHash)) {
        return reply.code(401).send({ error: "Usuário ou senha incorretos." });
      }

      const token = randomBytes(32).toString("hex");
      tokens.set(token, account.id);
      persistState();

      return {
        token,
        account: publicAccount(account),
      };
    }
  );

  // Get current session account
  app.get("/auth/me", async (req: FastifyRequest, reply) => {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) {
      return reply.code(401).send({ error: "Não autenticado." });
    }

    const accountId = tokens.get(token);
    const account = accountId ? accounts.get(accountId) : null;
    if (!account) {
      return reply.code(401).send({ error: "Sessão expirada." });
    }

    return {
      account: publicAccount(account),
      connections: {
        providers: account.providers || [],
        hasPassword: Boolean(account.passwordHash),
      },
    };
  });

  // Start OAuth Login (Discord or Google)
  app.get(
    "/auth/oauth/:provider/start",
    async (
      req: FastifyRequest<{
        Params: { provider: string };
        Querystring: { returnTo?: string; token?: string };
      }>,
      reply
    ) => {
      const provider = req.params.provider.toLowerCase() as "discord" | "google";
      const returnTo = req.query.returnTo || `${FRONTEND_URL}/oauth/callback`;
      const userToken = req.query.token;

      // If linking to already authenticated user
      if (userToken && tokens.has(userToken)) {
        const accountId = tokens.get(userToken)!;
        const account = accounts.get(accountId);
        if (account && !account.providers.includes(provider)) {
          account.providers.push(provider);
          account.updatedAt = Date.now();
          persistState();
        }
        const returnUrl = new URL(returnTo);
        returnUrl.hash = `#token=${userToken}&linked=${provider}&next=/`;
        return reply.redirect(returnUrl.toString());
      }

      // Check if real Discord credentials exist
      if (provider === "discord" && DISCORD_CLIENT_ID && DISCORD_CLIENT_SECRET) {
        const state = randomBytes(16).toString("hex");
        oauthStates.set(state, { provider: "discord", returnTo });
        const redirectUri = encodeURIComponent(`${BACKEND_URL}/auth/oauth/discord/callback`);
        const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20email&state=${state}`;
        return reply.redirect(discordAuthUrl);
      }

      // Check if real Google credentials exist
      if (provider === "google" && GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
        const state = randomBytes(16).toString("hex");
        oauthStates.set(state, { provider: "google", returnTo });
        const redirectUri = encodeURIComponent(`${BACKEND_URL}/auth/oauth/google/callback`);
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20profile%20email&state=${state}`;
        return reply.redirect(googleAuthUrl);
      }

      // When OAuth credentials are not yet configured in .env, display a dedicated authorization screen inside the popup
      const ticket = randomBytes(16).toString("hex");
      const suggestedUsername = `${provider}_${randomBytes(2).toString("hex")}`;
      const suggestedDisplayName = `${provider === "discord" ? "Discord" : "Google"} User`;

      oauthTickets.set(ticket, {
        ticket,
        provider,
        suggestedUsername,
        suggestedDisplayName,
        returnTo,
        createdAt: Date.now(),
      });

      reply.type("text/html; charset=utf-8");
      return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Conectar ${provider === "discord" ? "Discord" : "Google"} — Spectra</title>
  <style>
    body {
      margin: 0;
      padding: 24px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #07080d;
      color: #f1f5f9;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      box-sizing: border-box;
    }
    .card {
      background: #12131d;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 32px 24px;
      width: 100%;
      max-width: 400px;
      text-align: center;
      box-shadow: 0 10px 40px rgba(0,0,0,0.6);
    }
    .icon-badge {
      width: 64px;
      height: 64px;
      border-radius: 18px;
      background: ${provider === "discord" ? "rgba(88,101,242,0.15)" : "rgba(255,255,255,0.1)"};
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }
    h2 { margin: 0 0 8px; font-size: 20px; }
    p { margin: 0 0 24px; font-size: 13px; color: #94a3b8; line-height: 1.5; }
    .btn {
      width: 100%;
      padding: 14px;
      border-radius: 12px;
      border: none;
      font-weight: bold;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
      background: ${provider === "discord" ? "#5865F2" : "#ffffff"};
      color: ${provider === "discord" ? "#ffffff" : "#0f172a"};
    }
    .btn:hover { opacity: 0.9; transform: scale(1.02); }
    .info {
      margin-top: 20px;
      padding: 12px;
      border-radius: 10px;
      background: rgba(6,182,212,0.08);
      border: 1px solid rgba(6,182,212,0.2);
      font-size: 11px;
      color: #67e8f9;
      text-align: left;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-badge">
      ${
        provider === "discord"
          ? `<svg width="36" height="36" viewBox="0 0 24 24" fill="#5865F2"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>`
          : `<svg width="36" height="36" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/><path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/></svg>`
      }
    </div>
    <h2>Conectar com ${provider === "discord" ? "Discord" : "Google"}</h2>
    <p>Autorize a vinculação rápida da sua conta no Spectra para iniciar chamadas e transmitir em grupo.</p>
    <button class="btn" onclick="authorize()">Continuar e Entrar</button>
    
    <div class="info">
      💡 <strong>Ambiente de Desenvolvimento Ativo</strong><br>
      Para autenticação OAuth externa oficial com seu próprio Bot, adicione <code>DISCORD_CLIENT_ID</code> e <code>DISCORD_CLIENT_SECRET</code> no seu <code>.env</code>.
    </div>
  </div>

  <script>
    function authorize() {
      const returnUrl = new URL("${returnTo}");
      returnUrl.hash = "#ticket=${ticket}&provider=${provider}&suggestedUsername=${suggestedUsername}&suggestedDisplayName=${encodeURIComponent(
        suggestedDisplayName
      )}&next=/";
      window.location.href = returnUrl.toString();
    }
  </script>
</body>
</html>`;
    }
  );

  // Complete OAuth signup
  app.post(
    "/auth/oauth/complete",
    async (
      req: FastifyRequest<{
        Body: { ticket?: string; username?: string; displayName?: string };
      }>,
      reply
    ) => {
      const { ticket, username: rawUser, displayName: rawDisplay } = req.body || {};
      if (!ticket || !oauthTickets.has(ticket)) {
        return reply.code(400).send({ error: "Ticket de autenticação expirado ou inválido." });
      }

      const ticketData = oauthTickets.get(ticket)!;
      oauthTickets.delete(ticket);

      const username = (rawUser || ticketData.suggestedUsername).trim().toLowerCase();
      const displayName = (rawDisplay || ticketData.suggestedDisplayName).trim();

      if (!/^[a-z0-9_]{3,20}$/.test(username)) {
        return reply.code(400).send({ error: "Usuário inválido. Use 3 a 20 letras, números ou sublinhado." });
      }

      let existing = Array.from(accounts.values()).find((a) => a.username.toLowerCase() === username);
      if (existing) {
        if (!existing.providers.includes(ticketData.provider)) {
          existing.providers.push(ticketData.provider);
          existing.updatedAt = Date.now();
          persistState();
        }
        const token = randomBytes(32).toString("hex");
        tokens.set(token, existing.id);
        persistState();
        return { token, account: publicAccount(existing) };
      }

      const now = Date.now();
      const newAccount: StoredAccount = {
        id: randomUUID(),
        username,
        displayName: displayName || username,
        flags: ["VERIFIED"],
        points: 50,
        features: ["verified_badge", "quality_1440p", "fps_120"],
        providers: [ticketData.provider],
        callSeconds: 0,
        micSeconds: 0,
        shareSeconds: 0,
        createdAt: now,
        updatedAt: now,
      };

      accounts.set(newAccount.id, newAccount);
      const token = randomBytes(32).toString("hex");
      tokens.set(token, newAccount.id);
      persistState();

      return {
        token,
        account: publicAccount(newAccount),
      };
    }
  );

  // Premium plans
  app.get("/premium/plans", async () => {
    return { plans: SPECTRA_PLANS };
  });

  app.get("/premium/plan", async () => {
    return SPECTRA_PLANS[0];
  });

  // Mercado Pago: Checkout / Assinatura com cartão
  app.post(
    "/premium/subscribe",
    async (
      req: FastifyRequest<{
        Body: { email?: string; planId?: string; cycle?: "monthly" | "yearly" };
      }>,
      reply
    ) => {
      const authHeader = req.headers.authorization || "";
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
      const accountId = tokens.get(token);
      const account = accountId ? accounts.get(accountId) : null;

      const { planId = "premium", cycle = "monthly", email } = req.body || {};
      const plan = SPECTRA_PLANS.find((p) => p.id === planId) || SPECTRA_PLANS[0];
      const planCycle = plan.cycles.find((c) => c.cycle === cycle) || plan.cycles[0];
      const price = planCycle.priceCents / 100;

      // If real Mercado Pago Access Token is configured
      if (MERCADO_PAGO_ACCESS_TOKEN) {
        try {
          const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              items: [
                {
                  id: `${plan.id}-${cycle}`,
                  title: `${plan.title} (${cycle === "yearly" ? "Anual" : "Mensal"})`,
                  description: plan.description,
                  quantity: 1,
                  currency_id: "BRL",
                  unit_price: price,
                },
              ],
              payer: {
                email: email || account?.email || "contato@spectra.live",
              },
              back_urls: {
                success: `${FRONTEND_URL}/pro?status=approved`,
                failure: `${FRONTEND_URL}/pro?status=rejected`,
                pending: `${FRONTEND_URL}/pro?status=pending`,
              },
              auto_return: "approved",
              external_reference: account?.id || "guest",
            }),
          });
          const mpData = (await mpRes.json()) as { init_point?: string };
          if (mpData.init_point) {
            return { ok: true, checkoutUrl: mpData.init_point };
          }
        } catch (err) {
          console.error("Mercado Pago API error:", err);
        }
      }

      // Local / fallback checkout URL
      const checkoutUrl = `${FRONTEND_URL}/pro?checkout=simulated&plan=${plan.id}&cycle=${cycle}`;
      return { ok: true, checkoutUrl };
    }
  );

  // Mercado Pago: Pagamento Pix Instantâneo
  app.post(
    "/premium/pix",
    async (
      req: FastifyRequest<{
        Body: { email?: string; planId?: string; cycle?: "monthly" | "yearly" };
      }>,
      reply
    ) => {
      const authHeader = req.headers.authorization || "";
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
      const accountId = tokens.get(token);
      const account = accountId ? accounts.get(accountId) : null;

      const { planId = "premium", cycle = "monthly", email } = req.body || {};
      const plan = SPECTRA_PLANS.find((p) => p.id === planId) || SPECTRA_PLANS[0];
      const planCycle = plan.cycles.find((c) => c.cycle === cycle) || plan.cycles[0];
      const price = planCycle.pixPriceCents / 100;
      const days = planCycle.periodDays;

      // If real Mercado Pago Access Token is configured
      if (MERCADO_PAGO_ACCESS_TOKEN) {
        try {
          const mpRes = await fetch("https://api.mercadopago.com/v1/payments", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
              "Content-Type": "application/json",
              "X-Idempotency-Key": randomUUID(),
            },
            body: JSON.stringify({
              transaction_amount: price,
              description: `Spectra — ${plan.title} (${cycle === "yearly" ? "Anual" : "Mensal"})`,
              payment_method_id: "pix",
              payer: {
                email: email || account?.email || "pagamento@spectra.live",
              },
              external_reference: account?.id || "guest",
            }),
          });
          const mpData = (await mpRes.json()) as {
            id?: number;
            point_of_interaction?: {
              transaction_data?: {
                qr_code?: string;
                qr_code_base64?: string;
              };
            };
            date_of_expiration?: string;
          };

          if (mpData.id && mpData.point_of_interaction?.transaction_data) {
            const tx = mpData.point_of_interaction.transaction_data;
            return {
              paymentId: String(mpData.id),
              qrCode: tx.qr_code || null,
              qrCodeBase64: tx.qr_code_base64 || null,
              expiresAt: mpData.date_of_expiration || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
              amountLabel: planCycle.pixPriceLabel,
              days,
            };
          }
        } catch (err) {
          console.error("Mercado Pago Pix error:", err);
        }
      }

      // Local / simulated fallback Pix charge with real Pix payload format
      const paymentId = `pix_${Date.now()}`;
      const mockPixCode = `00020126580014br.gov.bcb.pix0136${randomUUID()}5204000053039865405${price.toFixed(
        2
      )}5802BR5914SPECTRA PRO6009SAO PAULO62070503***6304ABCD`;

      return {
        paymentId,
        qrCode: mockPixCode,
        qrCodeBase64: null,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        amountLabel: planCycle.pixPriceLabel,
        days,
      };
    }
  );

  // Status da assinatura do usuário
  app.get("/premium/status", async (req: FastifyRequest, reply) => {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    const accountId = tokens.get(token);
    const account = accountId ? accounts.get(accountId) : null;

    if (!account) {
      return reply.code(401).send({ error: "Não autenticado" });
    }

    return {
      premium: account.premium || null,
      features: account.features || [],
    };
  });

  // ------------------------------------------
  // Grupos e Mapa Mundial (Spectra Communities)
  // ------------------------------------------
  const defaultGroupPermissions = {
    text: {
      viewChannel: true,
      sendMessages: true,
      sendGifs: true,
      sendImages: true,
      mentionMembers: true,
      mentionEveryone: false,
    },
    voice: { mic: true, screen: true, camera: true, videoSource: true, chat: true, gif: true, image: true },
  };

  const groupStore: any[] = [
    {
      id: "spectra-lounge",
      name: "Spectra Lounge & Games",
      iconUrl: null,
      flags: ["VERIFIED"],
      description: "Comunidade oficial de gamers, criadores e desenvolvedores do Spectra.",
      memberCount: 142,
      onlineCount: 38,
      location: { lat: -23.5505, lng: -46.6333 }, // São Paulo
      visibility: "public",
      theme: null,
      ownerId: "system",
      admins: [],
      permissions: defaultGroupPermissions,
      createdAt: 1700000000000,
      voice: {},
      channels: [
        { id: "geral-voz", kind: "voice", name: "Voz Geral", position: 0, permissions: {}, unread: false, mentions: 0 },
        { id: "games-voz", kind: "voice", name: "Games & Streams", position: 1, permissions: {}, unread: false, mentions: 0 },
        { id: "chat-geral", kind: "text", name: "chat-geral", position: 2, permissions: {}, unread: false, mentions: 0 },
      ],
      members: [],
    },
    {
      id: "spectra-code",
      name: "Code & Devs",
      iconUrl: null,
      flags: [],
      description: "Salas de pair programming, estudos e compartilhamento de tela com som de terminal.",
      memberCount: 95,
      onlineCount: 22,
      location: { lat: -22.9068, lng: -43.1729 }, // Rio de Janeiro
      visibility: "public",
      theme: null,
      ownerId: "system",
      admins: [],
      permissions: defaultGroupPermissions,
      createdAt: 1700000000000,
      voice: {},
      channels: [
        { id: "dev-voz", kind: "voice", name: "Pair Programming", position: 0, permissions: {}, unread: false, mentions: 0 },
        { id: "dev-chat", kind: "text", name: "links-e-duvidas", position: 1, permissions: {}, unread: false, mentions: 0 },
      ],
      members: [],
    },
    {
      id: "spectra-cinema",
      name: "Watch Party & Cinema",
      iconUrl: null,
      flags: [],
      description: "Transmissões e watch parties coletivas no Spectra com som cristalino.",
      memberCount: 78,
      onlineCount: 16,
      location: { lat: 40.7128, lng: -74.006 }, // New York
      visibility: "public",
      theme: null,
      ownerId: "system",
      admins: [],
      permissions: defaultGroupPermissions,
      createdAt: 1700000000000,
      voice: {},
      channels: [
        { id: "cinema-voz", kind: "voice", name: "Cinema Room", position: 0, permissions: {}, unread: false, mentions: 0 },
        { id: "cinema-chat", kind: "text", name: "pipoca-e-chat", position: 1, permissions: {}, unread: false, mentions: 0 },
      ],
      members: [],
    },
  ];

  // Grupos no mapa público
  app.get("/groups/map", async () => {
    const publicPins = groupStore
      .filter((g) => g.visibility === "public" && g.location)
      .map((g) => ({
        id: g.id,
        name: g.name,
        iconUrl: g.iconUrl,
        flags: g.flags,
        description: g.description,
        memberCount: g.memberCount,
        onlineCount: g.onlineCount,
        location: g.location,
      }));
    return { groups: publicPins };
  });

  // Lista de grupos do usuário
  app.get("/groups", async (req: FastifyRequest) => {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    const accountId = tokens.get(token);

    const summaries = groupStore.map((g) => ({
      id: g.id,
      name: g.name,
      iconUrl: g.iconUrl,
      flags: g.flags,
      role: (accountId && g.ownerId === accountId ? "owner" : "member") as "owner" | "member",
      unread: false,
      mentions: 0,
    }));
    return { groups: summaries };
  });

  // Criar grupo
  app.post(
    "/groups",
    async (
      req: FastifyRequest<{
        Body: { name: string; visibility?: "public" | "private" };
      }>,
      reply
    ) => {
      const authHeader = req.headers.authorization || "";
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
      const accountId = tokens.get(token);
      const account = accountId ? accounts.get(accountId) : null;

      const { name, visibility = "public" } = req.body || {};
      if (!name || !name.trim()) {
        return reply.code(400).send({ error: "Nome do grupo é obrigatório" });
      }

      const id = `grp-${Date.now().toString(36)}`;
      const newGroup = {
        id,
        name: name.trim(),
        description: "Novo grupo criado no Spectra.",
        iconUrl: null,
        flags: [],
        ownerId: account?.id || "guest",
        memberCount: 1,
        onlineCount: 1,
        location: { lat: -23.5505 + (Math.random() - 0.5) * 5, lng: -46.6333 + (Math.random() - 0.5) * 5 },
        visibility,
        theme: null,
        admins: [],
        permissions: defaultGroupPermissions,
        createdAt: Date.now(),
        voice: {},
        channels: [
          { id: "voz-1", kind: "voice", name: "Voz Principal", position: 0, permissions: {}, unread: false, mentions: 0 },
          { id: "chat-1", kind: "text", name: "chat-geral", position: 1, permissions: {}, unread: false, mentions: 0 },
        ],
        members: [
          {
            id: account?.id || "guest",
            name: account?.displayName || "Você",
            username: account?.username || "voce",
            avatarUrl: account?.avatarUrl || null,
            nameColor: null,
            flags: [],
            guest: !account,
            role: "owner",
            online: true,
            joinedAt: Date.now(),
          },
        ],
      };

      groupStore.unshift(newGroup);
      return { group: newGroup };
    }
  );

  // Detalhes de um grupo
  app.get(
    "/groups/:groupId",
    async (req: FastifyRequest<{ Params: { groupId: string } }>, reply) => {
      const { groupId } = req.params;
      const grp = groupStore.find((g) => g.id === groupId);
      if (!grp) {
        return reply.code(404).send({ error: "Grupo não encontrado" });
      }

      const authHeader = req.headers.authorization || "";
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
      const accountId = tokens.get(token);

      return {
        group: {
          id: grp.id,
          name: grp.name,
          description: grp.description,
          iconUrl: grp.iconUrl,
          flags: grp.flags || [],
          visibility: grp.visibility || "public",
          theme: grp.theme || null,
          location: grp.location || null,
          ownerId: grp.ownerId || "system",
          admins: grp.admins || [],
          permissions: grp.permissions || defaultGroupPermissions,
          memberCount: grp.memberCount || 1,
          createdAt: grp.createdAt || Date.now(),
        },
        channels: grp.channels || [],
        voice: grp.voice || {},
        members: grp.members || [],
        me: {
          id: accountId || "guest",
          role: accountId && grp.ownerId === accountId ? "owner" : "member",
          notify: "mentions",
          guest: !accountId,
        },
        chatAvailable: true,
      };
    }
  );

  // Voz de um grupo
  app.get("/groups/:groupId/voice", async () => {
    return { voice: {} };
  });

  // Social / Amigos
  app.get("/social", async () => {
    return { friends: [], incoming: [], outgoing: [], blocked: [] };
  });

  // Chamadas ativas / pendentes
  app.get("/calls", async () => {
    return { incoming: [], outgoing: [] };
  });
}
