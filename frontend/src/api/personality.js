// frontend/src/api/personality.js

export async function requestSystemPrompt(cfeSnapshot) {
  try {
    const res = await fetch("/api/v1/compose_prompt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cfeSnapshot),
    });
    if (!res.ok) {
      console.error("compose_prompt failed", res.status);
      return null;
    }
    const body = await res.json();
    return body.system_prompt || null;
  } catch (err) {
    console.error("compose_prompt error", err);
    return null;
  }
}
