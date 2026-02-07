# AgriSoil AI Frontend

React frontend application for the AgriSoil AI e-commerce platform.

## Features

- ✅ User authentication (Login & Register)
- ✅ Form validation (required, numeric, range)
- ✅ Soil analysis input form
- ✅ API integration with Axios
- ✅ Protected routes
- ✅ Responsive design

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (optional, defaults to `http://localhost:8000`):
```bash
cp .env.example .env
```

3. Update `.env` if your backend runs on a different URL:
```
VITE_API_BASE_URL=http://localhost:8000
```

## Running the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (default Vite port).

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   └── ProtectedRoute.jsx
│   ├── config/             # Configuration files
│   │   └── api.js          # Axios instance setup
│   ├── context/            # React Context providers
│   │   └── AuthContext.jsx
│   ├── pages/              # Page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── SoilInput.jsx
│   ├── services/           # API service functions
│   │   └── authService.js
│   ├── utils/              # Utility functions
│   │   └── validation.js
│   ├── App.jsx             # Main app component with routing
│   ├── App.css
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── .env.example
└── package.json
```

## Pages

### Home (`/`)
- Landing page with features overview
- Navigation to different sections

### Login (`/login`)
- User authentication form
- Validates username and password
- Redirects to home on success

### Register (`/register`)
- User registration form
- Fields: Full Name, Username, Email, Phone Number, Password, Confirm Password
- Validates all fields (required, email format, password match)
- Auto-login after successful registration

### Soil Input (`/soil-input`) - Protected
- Soil analysis input form
- Validates numeric inputs with ranges:
  - Nitrogen: 0-140
  - Phosphorus: 0-145
  - Potassium: 0-205
  - pH: 0-14
  - Temperature: 0-100°C
  - Humidity: 0-100%
  - Rainfall: 0-300mm

## Form Validation

The application includes comprehensive form validation:

- **Required fields**: Checks for empty/null values
- **Email validation**: Validates email format
- **Password validation**: Minimum 6 characters
- **Numeric validation**: Ensures numeric input
- **Range validation**: Validates values within specified ranges
- **Phone number validation**: Validates phone format (optional)
- **Password match**: Confirms password confirmation matches

## API Integration

The app uses Axios for API calls:
- Base URL configured in `src/config/api.js`
- Automatic token injection for authenticated requests
- Automatic token refresh handling
- Error interception for 401 (unauthorized) responses

## Protected Routes

The `ProtectedRoute` component ensures only authenticated users can access certain pages. Unauthenticated users are redirected to `/login`.

## Authentication

- JWT tokens stored in localStorage
- User data stored in localStorage
- Auth context provides user state throughout the app
- Automatic token verification on app load

## Development

- Uses Vite for fast development
- Hot module replacement (HMR) enabled
- ESLint configured for code quality

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.
