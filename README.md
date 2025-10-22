# 61040-frontend

## Assignment Details

### User Journey

Bobbert opens the CrochetBuddy app and signs up to land in the first-time user welcome page. He notices that he needs to manually add the pattern on his own so he clicks "Upload Pattern" on the same welcome page. Under the Upload Pattern page, he gives the project a title under the "Title" field and copies and pastes the written pattern under the "Pattern" field. He finishes the process by hitting "Upload" at the bottom of the page. He gets to the pattern's page and toggles from UK to US terminology. The page refreshed to replace the UK terms with the US terms. Bobbert remembers that he just finished a 'tc' (treble crochet) in round 2, but now it's written as a 'dc' (double crochet).He also realizes he can do a simple tap on unfamiliar abbreviations to reveal the full phrase without leaving the pattern. He finally notices the light button to the right of the language button, which automatically dims the screen to highlight the first round of instructions. He clicks the down arrow on the right side of the page to get to his current round, the second round. Bobbert finishes his beanie and feels like he saved so much time by using the CrochetBuddy app. He can actually focus on the joy of crocheting rather than the frustration of translation.

### Screen Recording

[Screen Recording](/assets/Screen%20Recording%202025-10-21%20at%209.54.16 PM.mov)

## Getting started

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

Environment

Create a `.env.local` file (not committed) to point the frontend at your backend during development. Example:

```
VITE_API_BASE_URL=/api
VITE_API_SPEC_URL=/api
```
