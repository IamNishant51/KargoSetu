import React from "react";
import SettingsClient from "./SettingsClient";

export default function SettingsPage() {
  const baseUrl = (String(process.env.NODE_ENV) === "production" ? "" : ((String(process.env.NODE_ENV) === "production" ? "" : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"))));
  const settingsPromise = fetch(`${baseUrl}/api/v1/settings`, {
    cache: "no-store",
  })
    .then((res) => (res.ok ? res.json() : null))
    .catch(() => null);

  return <SettingsClient settingsPromise={settingsPromise} />;
}
