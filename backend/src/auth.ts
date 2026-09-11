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
  createdAt: number;
  updatedAt: number;
}

interface OAuthTicket {
  ticket: string;
  provider: "discord" | "google";
  suggestedUsername: string;
  suggestedDisplayName: string;
  createdAt: number;
}

let accounts: Map<string, StoredAccount> = new Map();
let tokens: Map<string, string> = new Map(); // token -> accountId
const oauthTickets: Map<string, OAuthTicket> = new Map(); // ticket -> OAuthTicket

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

const SPECTRA_PLANS = [
  {
    id: "premium",
    title: "Spectra Pro",
    description: "Qualidade profissional de streaming, 4K/240fps e badge exclusiva de verificado.",
    iconId: "verified",
    priceCents: 1490,
    priceLabel: "R$ 14,90",
    pixPriceCents: 1490,
    pixPriceLabel: "R$ 14,90",
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
        priceCents: 1490,
        priceLabel: "R$ 14,90",
        pixPriceCents: 1490,
        pixPriceLabel: "R$ 14,90",
        fullPriceCents: null,
        fullPriceLabel: null,
        discountPercent: 0,
        monthlyEquivalentLabel: "R$ 14,90",
        periodDays: 30,
      },
      {
        cycle: "yearly",
        priceCents: 11990,
        priceLabel: "R$ 119,90",
        pixPriceCents: 11990,
        pixPriceLabel: "R$ 119,90",
        fullPriceCents: 17880,
        fullPriceLabel: "R$ 178,80",
        discountPercent: 33,
        monthlyEquivalentLabel: "R$ 9,99",
        periodDays: 365,
      },
    ],
    purchasePoints: 100,
    dailyPoints: 10,
    available: true,
  },
  {
    id: "premium_max",
    title: "Spectra Pro Max",
    description: "O pacote definitivo: badge dourada, prioridade máxima nos servidores P2P, temas com degradê dinâmico e músicas de perfil.",
    iconId: "gold_verified",
    priceCents: 2490,
    priceLabel: "R$ 24,90",
    pixPriceCents: 2490,
    pixPriceLabel: "R$ 24,90",
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
        priceCents: 2490,
        priceLabel: "R$ 24,90",
        pixPriceCents: 2490,
        pixPriceLabel: "R$ 24,90",
        fullPriceCents: null,
        fullPriceLabel: null,
        discountPercent: 0,
        monthlyEquivalentLabel: "R$ 24,90",
        periodDays: 30,
      },
      {
        cycle: "yearly",
        priceCents: 19990,
        priceLabel: "R$ 199,90",
        pixPriceCents: 19990,
        pixPriceLabel: "R$ 199,90",
        fullPriceCents: 29880,
        fullPriceLabel: "R$ 298,80",
        discountPercent: 33,
        monthlyEquivalentLabel: "R$ 16,65",
        periodDays: 365,
      },
    ],
    purchasePoints: 250,
    dailyPoints: 25,
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
      const returnTo = req.query.returnTo || "http://localhost:3000/oauth/callback";
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

      // Generate OAuth ticket for signup or instant session
      const ticket = randomBytes(16).toString("hex");
      const suggestedUsername = `${provider}_user_${randomBytes(2).toString("hex")}`;
      const suggestedDisplayName = `${provider === "discord" ? "Discord" : "Google"} User`;

      oauthTickets.set(ticket, {
        ticket,
        provider,
        suggestedUsername,
        suggestedDisplayName,
        createdAt: Date.now(),
      });

      const returnUrl = new URL(returnTo);
      returnUrl.hash = `#ticket=${ticket}&provider=${provider}&suggestedUsername=${suggestedUsername}&suggestedDisplayName=${encodeURIComponent(
        suggestedDisplayName
      )}&next=/`;

      return reply.redirect(returnUrl.toString());
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
}
