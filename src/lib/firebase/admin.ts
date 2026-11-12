import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";

const EXPECTED_PROJECT = process.env.FIREBASE_PROJECT_ID;

export function getDiraAdminApp() {
  if (!EXPECTED_PROJECT) {
    throw new Error("Set FIREBASE_PROJECT_ID to the approved Dira Firebase project.");
  }

  const existing = getApps().find((app) => app.name === "[DEFAULT]");
  if (existing) {
    if (existing.options.projectId && existing.options.projectId !== EXPECTED_PROJECT) {
      throw new Error("The Firebase Admin app is connected to a different project.");
    }
    return existing;
  }

  const raw = process.env.FIREBASE_ADMIN_KEY;
  if (!raw) throw new Error("Set FIREBASE_ADMIN_KEY with the Dira Firebase service-account JSON.");

  let account: Record<string, unknown>;
  try {
    account = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    throw new Error("FIREBASE_ADMIN_KEY must contain valid service-account JSON.");
  }

  if (account.project_id !== EXPECTED_PROJECT) {
    throw new Error("FIREBASE_ADMIN_KEY must belong to " + EXPECTED_PROJECT + ".");
  }

  return initializeApp({
    credential: cert(account as Parameters<typeof cert>[0]),
    projectId: EXPECTED_PROJECT,
  });
}
