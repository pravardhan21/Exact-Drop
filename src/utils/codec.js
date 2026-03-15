const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BASE = BigInt(ALPHABET.length);

const MULTIPLIER = 100000;
const LAT_OFFSET = 90;
const LNG_OFFSET = 180;

const LAT_RANGE = BigInt(180 * MULTIPLIER + 1);
const LNG_RANGE = BigInt(360 * MULTIPLIER + 1);
const PHONE_RANGE = BigInt(10000000001); // 10 decimal digits + 1 for empty state

export const DELIVERY_NOTES = [
  "No note provided.",
  "Leave at front door.",
  "Leave at back door.",
  "Hand directly to customer.",
  "Do not ring doorbell.",
  "Beware of dog.",
  "Call upon arrival.",
  "Leave with neighbor.",
  "Gate code required (Call)."
];

const NOTE_RANGE = BigInt(DELIVERY_NOTES.length);

export function encodeLocation(lat, lng, phone = "", noteIndex = 0) {
  // 1. Coordinates
  const numLat = Math.round((lat + LAT_OFFSET) * MULTIPLIER);
  const numLng = Math.round((lng + LNG_OFFSET) * MULTIPLIER);
  
  // 2. Phone (0 if empty, otherwise number + 1 to distinguish 000... from empty)
  const phoneClean = phone.replace(/\D/g, '').slice(-10); // keep last 10 digits max
  const numPhone = phoneClean ? BigInt(phoneClean) + 1n : 0n;

  // 3. Note Index
  const numNote = BigInt(Math.max(0, Math.min(noteIndex, DELIVERY_NOTES.length - 1)));
  
  // Combine all into a single BigInt:
  // Layout: Note -> Phone -> Lat -> Lng
  let combined = numNote;
  combined = (combined * PHONE_RANGE) + numPhone;
  combined = (combined * LAT_RANGE) + BigInt(numLat);
  combined = (combined * LNG_RANGE) + BigInt(numLng);
  
  if (combined === 0n) return ALPHABET[0];
  
  let result = '';
  while (combined > 0n) {
    const remainder = Number(combined % BASE);
    result = ALPHABET[remainder] + result;
    combined = combined / BASE;
  }
  
  return result;
}

export function decodeLocation(code) {
  try {
    let combined = 0n;
    for (let i = 0; i < code.length; i++) {
        const charIndex = ALPHABET.indexOf(code[i]);
        if (charIndex === -1) throw new Error('Invalid character in code');
        const charValue = BigInt(charIndex);
        combined = combined * BASE + charValue;
    }
    
    // Extract backwards: Lng -> Lat -> Phone -> Note
    const numLng = Number(combined % LNG_RANGE);
    combined = combined / LNG_RANGE;

    const numLat = Number(combined % LAT_RANGE);
    combined = combined / LAT_RANGE;

    const numPhone = combined % PHONE_RANGE;
    combined = combined / PHONE_RANGE;

    const numNote = Number(combined % NOTE_RANGE);
    
    const lat = (numLat / MULTIPLIER) - LAT_OFFSET;
    const lng = (numLng / MULTIPLIER) - LNG_OFFSET;
    
    let phone = "";
    if (numPhone > 0n) {
      phone = (numPhone - 1n).toString().padStart(10, '0'); // Basic padding if needed
    }

    // Bounds check
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new Error('Decoded coordinates out of bounds');
    }
    
    return { lat, lng, phone, noteIndex: numNote, noteText: DELIVERY_NOTES[numNote] };
  } catch (error) {
    return null;
  }
}
