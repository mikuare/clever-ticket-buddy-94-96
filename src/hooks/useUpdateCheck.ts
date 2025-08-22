import { useEffect, useState } from "react";

const CURRENT_VERSION_CODE = 2; // <- match your build.gradle versionCode
const UPDATE_JSON_URL =
  "https://mikuare.github.io/qmaz-helpdesk-update/update.json";

export function useUpdateCheck() {
  const [updateInfo, setUpdateInfo] = useState<null | {
    latestVersion: string;
    versionCode: number;
    changelog: string;
    apkUrl: string;
  }>(null);

  useEffect(() => {
    async function checkUpdate() {
      try {
        const res = await fetch(UPDATE_JSON_URL, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch update info");
        const data = await res.json();

        if (data.versionCode > CURRENT_VERSION_CODE) {
          setUpdateInfo(data); // store info to display later
        }
      } catch (err) {
        console.error("Update check failed:", err);
      }
    }

    // Run after small delay (so splash/login isn’t blocked)
    const timer = setTimeout(() => {
      checkUpdate();
    }, 5000); // wait 5s

    return () => clearTimeout(timer);
  }, []);

  return updateInfo;
}
