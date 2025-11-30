// frontend/src/utils/traits.js
// Simple bandit-like trait update

export function updateTraitVector(traits, reward, lr = 0.02) {
  // traits: { [traitName]: number }
  // reward: -1 .. +1
  if (!traits || typeof reward !== "number") return traits;

  const updated = { ...traits };
  Object.keys(updated).forEach(key => {
    const v = updated[key];
    const delta = lr * reward; // simple approximation: same sign for all
    let next = v + delta;
    if (next > 1) next = 1;
    if (next < 0) next = 0;
    updated[key] = next;
  });
  return updated;
}

// Example feedback handler (to be used in ChatWindow or similar)
// async function handleFeedback(msgId, rating) {
//   // rating in {1..5}
//   const reward = (rating - 3) / 2; // map 1..5 -> -1..+1
//
//   // fetch current persona meta from backend
//   const res = await fetch("/api/v1/personality/active");
//   const body = await res.json();
//   const persona = body.persona;
//   const currentStyle = persona.style;
//
//   const newStyle = updateTraitVector(currentStyle, reward);
//
//   // send encrypted trait diff or updated persona back to server if you like,
//   // or store locally as owner-bound memory.
// }
