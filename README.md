# Milk & Honey Coffee Cart

A modern, faith-based mobile coffee cart application built with the MERN stack (MongoDB, Express, React, Node.js). This project serves as both a public-facing website for customers and a comprehensive management system for the business owners.

## 🚀 Features

### Public Website
- **Dynamic Home & About Pages:** Fully customizable content sections managed via the admin dashboard.
- **Interactive Menu:** Browse coffee offerings with real-time updates from the backend.
- **Event Listings:** View upcoming events where the coffee cart will be stationed.
- **Photo Gallery:** Explore the cart's aesthetic through a categorized image gallery.
- **Quote Request System:** A dedicated form for users to request the cart for private events, integrated with email notifications.
- **Responsive Design:** Optimized for all devices with built-in Dark/Light mode support.

### Admin Dashboard
- **Content Management System (CMS):** Edit page text, hero sections, and reorderable content blocks without touching code.
- **Product & Menu Management:** Add, edit, or remove menu items and categories.
- **Gallery Controls:** Bulk upload images and manage the public gallery.
- **Order & Quote Tracking:** Manage incoming service requests and customer inquiries.
- **Settings:** Update site-wide configurations like contact info, social links, and business hours.

## 🛠️ Technologies Used

- **Frontend:**
  - React 18 (Hooks, Context API)
  - React Router 6 (Routing)
  - Axios (API Communication)
  - CSS Variables (Theming & Responsive Design)
  - React Easy Crop (Image editing)
- **Backend:**
  - Node.js & Express
  - MongoDB & Mongoose (Database)
  - JSON Web Tokens (JWT) & Bcrypt (Authentication)
  - Multer & Sharp (Image processing)
  - Nodemailer (Email services)
- **Cloud & Infrastructure:**
  - Google Cloud Storage (Asset hosting)
  - Google reCAPTCHA (Security)

## 🧩 Challenging Code & Solutions

### 1. Seamless Google Cloud Storage (GCS) Integration
**Challenge:** Managing image uploads across different environments (local development vs. production) while ensuring performance and security. We needed a way to handle multi-part form data, process images on the fly, and stream them to the cloud without exhausting server memory.

**Solution:** I implemented a custom middleware using `Multer` (memory storage) and the `@google-cloud/storage` SDK.
- **Memory Streaming:** Instead of saving files locally, we stream the buffer directly from Multer to GCS using `createWriteStream`. This reduces disk I/O and works perfectly in ephemeral environments like Heroku.
- **Environment Adaptability:** The middleware automatically detects if it's running locally (using a JSON key file) or in production (using an environment variable string), ensuring a "plug-and-play" deployment.

```javascript
// server/middleware/gcsUpload.js
const blobStream = blob.createWriteStream({
  resumable: false,
  metadata: { contentType: req.file.mimetype },
});

blobStream.on('finish', () => {
  req.file.gcsUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
  next();
});
blobStream.end(req.file.buffer);
```

### 2. Dynamic CMS with Live Preview
**Challenge:** Creating a flexible "Page Builder" that allows non-technical users to modify the site's layout and content while seeing a real-time representation of their changes.

**Solution:** I developed a "Section-Based" schema in MongoDB and a matching React-based editor.
- **Schema Design:** Page content is stored as an array of section objects. Each section supports titles, descriptions, and optional light/dark mode images.
- **State Orchestration:** The React editor uses a complex state object that syncs with a "Live Preview" pane. By mapping over the state in both the editor (for inputs) and the preview (for rendering), admins get immediate feedback before hitting "Save".
- **Reordering Logic:** Implemented an array-shifting algorithm that updates the `order` property of sections, allowing drag-and-drop or arrow-based reordering.

## 🛠️ Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account or local instance
- Google Cloud Project with a Storage Bucket

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/milkandhoney.git
   ```
2. Install dependencies:
   ```bash
   # Root
   npm install
   # Client
   cd client && npm install
   # Server
   cd ../server && npm install
   ```
3. Set up environment variables in `server/.env`:
   ```env
   PORT=5001
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret
   GCS_BUCKET=your_bucket_name
   GCS_KEY_JSON=your_gcs_json_string
   EMAIL_USER=your_email
   EMAIL_PASS=your_app_password
   ```
4. Seed the database (Important for initial admin access):
   ```bash
   cd server && node seed.js
   # This creates:
   # Admin: admin@milkandhoney.com / admin123
   ```
5. Run the application:
   ```bash
   # Start server
   npm run dev
   # Start client
   cd client && npm start
   ```

---
*Brewed with faith and code.* ☕️✨
