# Smart Surveillance Dashboard

This is the frontend dashboard for the Smart Surveillance Platform, built with React, Vite, and Tailwind CSS. It communicates with a FastAPI backend to provide real-time monitoring and security management.

## Setup Instructions

### Environment Configuration

Ensure that the `.env` or `.env.example` file is properly configured. You may create a `.env.local` if necessary:

```env
VITE_API_BASE_URL=http://localhost:8000
```
*Change `http://localhost:8000` to the actual address of your backend if different.*

### Installation

Navigate to the project root and install the dependencies:

```bash
npm install
```

### Running the Development Server

To start the Vite development server:

```bash
npm run dev
```

*Note: In the AI Studio environment, the server is automatically managed and accessible through the provided preview links.*

## Authentication Flow

1. The app routes users to `/login` if no valid access token is found in `localStorage`.
2. Login submits `username` and `password` via form-url-encoded data to the `/api/auth/login` backend endpoint.
3. On success, `access_token` and `refresh_token` are saved in `localStorage`. 
4. Every protected request includes `Authorization: Bearer <token>`.
5. If a request returns a 401 Unauthorized status, the app automatically calls `POST /api/auth/refresh` using the refresh token to obtain a new access token, then retries the original request.
6. If the refresh operation fails, the user is logged out and redirected to `/login`.

## Pages Included

- **Login**: Secure access portal.
- **Dashboard**: High-level overview of system status, overall event summaries, and active monitoring processes.
- **Live Monitoring**: Camera feeds and real-time event logs via WebSocket connection. Includes "Start/Stop" controls.
- **Events**: Table showing all historical detections and events.
- **Alerts**: Filtered view only showing unauthorized, unknown, or mismatched events.
- **Persons**: Management screen for known identities.
- **Cameras**: Management screen for adding/removing video sources.
- **Verification**: Dedicated UI for manual cryptographic verification of events, and ad-hoc face recognition.
- **Reports**: Data visualizations over time (using Recharts).
- **Settings**: System health check and API configuration.

## Troubleshooting

- **WebSocket Fails to Connect**: Check if the backend URL is correctly set and that the backend is actually running. The WS connection uses `ws://<domain>/api/monitoring/ws?token=<access_token>`. Ensure your backend handles the token parameter securely.
- **CORS Issues**: Ensure your FastAPI backend has the `CORSMiddleware` correctly allowing origins (e.g. `['*']` in development, or the specific frontend port).
- **Icons Not Rendering**: Verify `lucide-react` is correctly installed.
- **Tailwind Missing Styles**: Validate that `@import "tailwindcss";` exists in `src/index.css`.
