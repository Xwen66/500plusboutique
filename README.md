# 500+ Boutique

A customer-facing inventory and inquiry portal for a boutique automotive business. This project connects a polished browsing experience with practical operational workflows: visitors can explore inventory and submit inquiries, while authenticated staff can manage listings and media.

## Why This Project

500+ Boutique demonstrates how I translate customer and sales workflows into a maintainable web product. It focuses on clear information discovery, reliable inquiry capture, and admin tools that make day-to-day inventory updates easier for non-technical users.

## Key Capabilities

- Browse inventory and open detailed vehicle pages
- Filter inventory for faster customer discovery
- Submit customer inquiries through a dedicated contact flow
- Manage inventory through an authenticated admin interface
- Store inventory data in Cloud Firestore and images in Firebase Storage
- Protect writes with Firebase Authentication and security rules

## Technology

| Area | Tools |
| --- | --- |
| Front end | HTML, CSS, JavaScript |
| Data | Cloud Firestore |
| Authentication | Firebase Authentication |
| Media | Firebase Storage |
| Deployment | Firebase Hosting |

## Architecture

The customer-facing pages read public inventory data and images. Administrative operations require authentication, and the included Firestore and Storage rules restrict content management to signed-in users.

Customer pages -> Firestore / Storage (read)
Admin interface -> Firebase Authentication -> Firestore / Storage (write)

## Run Locally

1. Create a Firebase project and enable Email/Password authentication, Firestore, and Firebase Storage.
2. Copy `js/firebase-config.example.js` to `js/firebase-config.js`.
3. Add your Firebase web configuration to the new local file.
4. Serve the project with a static web server.

`js/firebase-config.js` is intentionally excluded from source control. See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for deployment and security-rule setup.

## Portfolio Notes

This repository is a portfolio demonstration. It contains no production credentials, customer records, or live business data.

## Future Improvements

- Add inquiry validation and spam protection
- Add automated tests for customer and admin flows
- Add role-based authorization for multiple staff roles
- Add analytics for conversion and inventory engagement
