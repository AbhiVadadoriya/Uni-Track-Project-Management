(# Backend Setup)

## Install

Run this from the backend folder:

```bash
npm install
```

## Start the server

From the backend folder you can use either:

```bash
npm run dev
```

or:

```bash
npm run dev:backend
```

If you run from the repository root, use:

```bash
npm run dev:backend
```

## Notes

- The backend listens on port `4000` by default.
- The app uses an httpOnly `token` cookie for authentication, so make sure the frontend is calling the API with credentials enabled.
