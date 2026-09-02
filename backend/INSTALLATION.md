# Backend Installation

## Prerequisites

* Node.js 18+
* MongoDB / MongoDB Atlas
* npm

## Setup

```bash
git clone
cd backend
npm install
```

Create a `.env` file:

```env
PORT=3001
MONGODB_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
JWT_EXPIRES_IN=1d
```

Start the development server:

```bash
npm run start:dev
```

Backend will run at:

```text
http://localhost:3001
```

## Production Build

```bash
npm run build
npm run start:prod
```
