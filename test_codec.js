import { encodeLocation, decodeLocation, DELIVERY_NOTES } from './src/utils/codec.js';

const testCases = [
  { lat: 20.59372, lng: 78.96288, phone: "1234567890", note: 2 },
  { lat: 0, lng: 0, phone: "", note: 0 },
  { lat: -90, lng: -180, phone: "2223334444", note: 8 },
  { lat: 90, lng: 180, phone: "555-444-3333", note: 5 },
  { lat: 40.7128, lng: -74.0060, phone: "(800) 123-4567", note: 3 }
];

testCases.forEach((tc, i) => {
  const code = encodeLocation(tc.lat, tc.lng, tc.phone, tc.note);
  const decoded = decodeLocation(code);
  
  if (!decoded) {
     console.log(`Test ${i + 1}: FAIL (Decoding returned null)`, { original: tc, code });
     return;
  }
  
  const latDiff = Math.abs(tc.lat - decoded.lat);
  const lngDiff = Math.abs(tc.lng - decoded.lng);
  const cleanPhone = tc.phone.replace(/\D/g, '');
  
  const passed = latDiff < 0.00002 && lngDiff < 0.00002 && decoded.phone === cleanPhone && decoded.noteIndex === tc.note;
  console.log(`Test ${i + 1}: ${passed ? 'PASS' : 'FAIL'}`, { code, decodedResult: passed ? 'Match' : decoded });
});
