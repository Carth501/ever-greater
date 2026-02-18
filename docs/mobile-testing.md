# Mobile testing guide (Expo)

## 1) Start API server

From repo root:

- `npm run -w @ever-greater/api dev`

The API listens on port `3000` and is reachable on your LAN IP.

## 2) Configure phone-visible API URL

In `apps/mobile`, copy `.env.example` to `.env` and set your machine IP:

- `EXPO_PUBLIC_API_BASE_URL=http://<YOUR_LAN_IP>:3000`

Example:

- `EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:3000`

## 3) Run mobile app in Expo Go

From repo root:

- `npm run -w @ever-greater/mobile start`

Then:

- Install **Expo Go** on your phone.
- Scan the QR code shown in terminal/browser.
- Ensure phone and dev machine are on the same Wi-Fi.

## 4) Push installable test builds (without Expo Go)

From `apps/mobile`:

- `npx eas login`
- `npx eas build --profile preview --platform android`

This produces an installable `.apk` via EAS internal distribution.

## 5) Troubleshooting

- If phone cannot connect, verify firewall allows inbound `3000`.
- If localhost URL fails on phone, replace with LAN IP.
- If QR mode fails, run Expo with tunnel: `npm run -w @ever-greater/mobile start -- --tunnel`.
