Auth backend and pages added. To run:

1. Create `server/.env` with:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=change_me
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin
ADMIN_PASSWORD=admin
ADMIN_NAME=Administrator
DEMO_USER_EMAIL=user
DEMO_USER_PASSWORD=user
DEMO_USER_NAME=Demo User
```

2. Install and run backend:
```
cd server
npm i
npm run dev
```

3. Run frontend from project root:
```
npm i
npm run dev
```

Test logins:
- Admin: email `admin`, password `admin`
- User: email `user`, password `user`

Optionally set `VITE_API_URL` in a `.env` at project root to point to the server (default is http://localhost:5000).
