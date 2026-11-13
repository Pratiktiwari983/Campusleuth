# CampusLeuth

CampusLeuth is a campus Lost & Found web application. Students can report lost or found items, browse reports, search listings, and upload item images.

## Tech stack

- Frontend: HTML, CSS, vanilla JavaScript
- Backend: Node.js, Express
- Database: MongoDB Atlas with Mongoose
- Image storage: Cloudinary
- Deployment: Vercel (frontend) and Render (backend)

## Project structure

```text
CampusLeuth/
├── index.html
├── style.css
├── script.js
├── package.json
└── backend/
    ├── server.js
    ├── .env
    ├── package.json
    ├── config/
    │   └── cloudinary.js
    └── models/
        └── Item.js
```

## Backend setup

1. Open a terminal in the `backend` folder.
2. Install dependencies with `npm install`.
3. Create `backend/.env` with these variables:

```env
MONGO_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

4. Start locally with `npm start`.

The backend runs on the port supplied by the hosting provider, or port `5000` locally.

## Frontend

Open `index.html` through a local static server during development. The frontend currently uses the deployed API endpoint configured at the top of `script.js`.

## Deployment notes

- Deploy the frontend as a static site on Vercel. Keep the build command empty and use the project root as the output directory.
- Deploy the `backend` folder as a Node web service on Render.
- Add the four environment variables above in Render's Environment settings. Do not commit `.env` files.
- Use Node.js 20.19 or newer for the backend.
- Check `https://campusleuth.onrender.com/api/health` to verify that the backend process is responding.

## Security

Never publish `.env` files or paste their secret values into public repositories, screenshots, or messages. If credentials have been exposed, rotate them with MongoDB Atlas and Cloudinary, then update the local `.env` file and Render environment variables.
