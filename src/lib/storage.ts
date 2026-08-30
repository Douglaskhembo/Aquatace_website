import { getStoredToken } from "./auth-client";

export async function uploadMedia(
  file: File,
  folder: "products" | "gallery",
): Promise<{ url: string; path: string }> {
  const token = getStoredToken();
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);

  const res = await fetch("/api/media/upload", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? "Upload failed");
  }
  return res.json();
}

export async function removeMedia(path: string | null | undefined): Promise<void> {
  if (!path) return;
  const token = getStoredToken();
  await fetch("/api/media/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ path }),
  });
}
