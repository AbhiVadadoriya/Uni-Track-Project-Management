import { randomInt } from "node:crypto";
import { User } from "../models/user.js";
import { connectDb, disconnectDb } from "./dbClient.js";

const baseUrl = process.env.API_BASE_URL || "http://localhost:4000/api/v1";
const password = process.env.SMOKE_PASSWORD || "Pass12345";
const smokeAdminEmail = process.env.SMOKE_ADMIN_EMAIL || "smoke.admin@test.com";
const smokeAdminPassword = process.env.SMOKE_ADMIN_PASSWORD || "SmokeAdmin123";

const adminCredentialCandidates = [
  { email: smokeAdminEmail, password: smokeAdminPassword },
  {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  },
  { email: "admin@local.com", password: "Admin12345" },
].filter((c) => c.email && c.password);

function randEmail(prefix) {
  return `${prefix}${Date.now()}${randomInt(1000, 9999)}@test.com`;
}

async function postJson(path, body, cookie) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`${path} -> ${response.status}: ${data.message || "Request failed"}`);
  }
  return data;
}

async function getJson(path, cookie) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "GET",
    headers: cookie ? { Cookie: cookie } : {},
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`${path} -> ${response.status}: ${data.message || "Request failed"}`);
  }
  return data;
}

async function ensureSmokeAdmin() {
  await connectDb();

  const existing = await User.findOne({ email: smokeAdminEmail }).select("+password");

  if (!existing) {
    const admin = new User({
      name: "Smoke Admin",
      email: smokeAdminEmail,
      password: smokeAdminPassword,
      role: "Admin",
    });
    await admin.save();
    await disconnectDb();
    return;
  }

  existing.role = "Admin";
  existing.password = smokeAdminPassword;
  await existing.save();
  await disconnectDb();
}

async function runRoleSmoke(name, emailPrefix, role, checks) {
  const email = randEmail(emailPrefix);
  const reg = await postJson("/auth/register", { name, email, password, role });
  const cookie = `token=${reg.token}`;

  for (const check of checks) {
    if (check.method === "GET") {
      await getJson(check.path, cookie);
    } else {
      await postJson(check.path, check.body, cookie);
    }
  }

  return { role, email, ok: true };
}

async function runExistingAdminSmoke(checks) {
  let login = null;
  let matchedAdminEmail = null;

  for (const credentials of adminCredentialCandidates) {
    try {
      login = await postJson("/auth/login", {
        email: credentials.email,
        password: credentials.password,
        role: "Admin",
      });
      matchedAdminEmail = credentials.email;
      break;
    } catch {
      // Keep trying next candidate.
    }
  }

  if (!login) {
    throw new Error("/auth/login -> 401: Invalid email, password or role");
  }

  const cookie = `token=${login.token}`;

  for (const check of checks) {
    if (check.method === "GET") {
      await getJson(check.path, cookie);
    } else {
      await postJson(check.path, check.body, cookie);
    }
  }

  return { role: "Admin", email: matchedAdminEmail, ok: true };
}

async function run() {
  const report = [];

  await ensureSmokeAdmin();

  report.push(
    await runRoleSmoke("Smoke Student", "stu", "Student", [
      { method: "GET", path: "/student/fetch-dashboard-stats" },
      {
        method: "POST",
        path: "/student/project-proposal",
        body: {
          title: "Smoke Proposal",
          description: "Smoke proposal description",
        },
      },
    ])
  );

  report.push(
    await runRoleSmoke("Smoke Professor", "pro", "Professor", [
      { method: "GET", path: "/professor/fetch-dashboard-stats" },
      { method: "GET", path: "/professor/requests" },
    ])
  );

  report.push(
    await runExistingAdminSmoke([
      { method: "GET", path: "/admin/fetch-dashboard-stats" },
      { method: "GET", path: "/admin/users" },
    ])
  );

  console.table(report);
  console.log("Smoke API checks passed.");
}

run().catch((error) => {
  console.error("smoke failed:", error.message);
  process.exitCode = 1;
});
