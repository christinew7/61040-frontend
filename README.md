# 61040-frontend

Getting started

1. Install dependencies

```bash
npm install
```

2. Start dev server

```bash
npm run dev
```

3. Build for production

```bash
npm run build
```

Preview production build

```bash
npm run preview
```

Files of interest

- `index.html` - app entry
- `src/main.js` - Vue bootstrap
- `src/App.vue` - root component
- `src/components/HelloWorld.vue` - sample component

Environment

Create a `.env.local` file (not committed) to point the frontend at your backend during development. Example:

```
VITE_API_BASE_URL=/api
VITE_API_SPEC_URL=/api
```
