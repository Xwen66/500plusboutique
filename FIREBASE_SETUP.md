# 500plus Firebase Setup

1. Create a Firebase project.
2. Enable Authentication.
- Turn on Email/Password sign-in.
- Create at least one admin user account.
3. Enable Firestore database.
4. Enable Firebase Storage.
5. Copy `js/firebase-config.example.js` to `js/firebase-config.js` and fill in your config.
6. Deploy security rules:
- `firebase deploy --only firestore:rules,storage`
7. Deploy hosting:
- `firebase deploy --only hosting`

## Fix for "Missing or insufficient permissions"

If add/remove vehicle fails with that error, one of these is missing:
- You are not signed in on Admin page.
- Firestore rules were not deployed.
- Storage rules were not deployed (required for image upload).

Expected rules behavior in this project:
- Public can read vehicles and images.
- Only authenticated users can write/delete vehicles and upload images.

## Security notes

- `js/firebase-config.js` is gitignored.
- Keep only `js/firebase-config.example.js` in source control.
