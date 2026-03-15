# 📍 ExactDrop - Pinpoint Delivery Locations

**ExactDrop** is a high-precision location sharing platform designed to solve the "last-mile" delivery problem in semi-urban and rural areas. It allows users to pinpoint their exact location on a map and generate a unique, short code that can be shared with delivery personnel.

Unlike traditional apps, ExactDrop uses **mathematical coordinate compression** to store location data directly in the URL/Code, meaning it requires **zero database** to store markers.

---

## 🚀 Key Features

- **🎯 Precision Pinpointing:** Drop a pin exactly where you want the package delivered (within ~1 meter accuracy).
- **🔢 Short Code Generation:** Converts complex GPS coordinates into an easy-to-share 8-12 character Base62 code.
- **🏠 Delivery Notes:** Encode specific instructions like "Leave at back door" or "Gate code required" directly into the shareable link.
- **📱 Driver Integration:** One-tap **Call** or **WhatsApp** buttons to contact the customer directly from the arrival map.
- **🛰️ Satellite View:** Toggle between standard maps and high-resolution satellite imagery to identify landmarks.
- **📸 QR Code Support:** Instantly generate scannable QR codes for printed invoices or digital sharing.
- **📶 PWA & Offline Support:** Installable as a Progressive Web App. Works even with spotty internet in remote areas.

---

## 🛠️ Tech Stack

- **Framework:** React + Vite
- **Mapping:** Leaflet & React-Leaflet
- **Icons:** Lucide-React
- **PWA:** Vite-plugin-pwa
- **Styling:** Vanilla CSS (Modern Minimalist / Glassmorphism)
- **Deployment:** Vercel

---

## 🧠 How it Works

ExactDrop uses a custom **Base62 Encoding Utility** (`codec.js`). 
1. It takes the Latitude and Longitude (to 5 decimal places).
2. It concatenates them with an optional 10-digit phone number and a delivery note index.
3. This large integer is converted into a Base62 string (0-9, a-z, A-Z).
4. The recipient simply enters this code, and the app reverses the math to drop the pin—at **zero latency** and **zero database cost**.

---

## 📖 Getting Started

### Installation
```bash
git clone https://github.com/yourusername/exactdrop.git
cd exacta-drop
npm install
```

### Development
```bash
npm run dev
```

### Build (PWA)
```bash
npm run build
```

---

## 📦 Deployment

The app is optimized for Vercel. 
To deploy, simply run:
```bash
npx vercel --prod
```

---

## 📄 License
MIT License - Created for efficient delivery logistics.
