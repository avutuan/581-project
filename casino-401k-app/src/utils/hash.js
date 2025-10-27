const fallbackHash = (input) => {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString(16);
};

export const simpleHash = async (input) => {
  const message = input.trim();
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    return fallbackHash(message);
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};
