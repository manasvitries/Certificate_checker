# 🚀 Certificate_checker

A modern web application built with React, Vite, and Supabase, featuring secure user authentication and a clean, responsive dashboard.

## ✨ Features

- 🔐 **User Authentication** – Secure signup and login using Supabase.
- 📧 **Email Verification** – Email confirmation for new accounts.
- 🔑 **Password Recovery** – Forgot password and reset password functionality.
- 🛡️ **Authentication Validation** – Handles invalid credentials and account registration scenarios.
- 📊 **Dashboard** – Protected dashboard accessible after successful authentication.
- 📱 **Responsive UI** – Clean interface designed for different screen sizes.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend development |
| Vite | Development and build tool |
| JavaScript | Application logic |
| Supabase | Authentication and backend services |
| CSS | Styling |
| Git & GitHub | Version control |

## ⚙️ Getting Started

Follow these steps to run the project locally.

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
```

### 2. Navigate to the project folder

```bash
cd YOUR_REPOSITORY
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_key
```

Add your own Supabase project credentials.

**Never commit your `.env` file or Supabase secret/service-role keys to GitHub.**

### 5. Start the development server

```bash
npm run dev
```

Open the local URL displayed in your terminal.

## 🔒 Security

- Environment variables are excluded from version control.
- Supabase handles authentication and email verification.
- Protected routes restrict access to authenticated users.
- Password recovery uses Supabase's secure authentication flow.

## 📁 Project Structure

```text
project/
├── public/
├── src/
│   ├── components/
│   ├── lib/
│   │   └── supabaseClient.js
│   ├── App.jsx
│   └── main.jsx
├── .gitignore
├── package.json
└── vite.config.js
```

*The structure above is illustrative and may differ from the actual project.*

## 🚧 Future Improvements

- [ ] User profile management
- [ ] Enhanced dashboard functionality
- [ ] Additional authentication options
- [ ] Improved accessibility
- [ ] More interactive features

## 👩‍💻 Author

**Manasvi Wairkar**

Aspiring Software Engineer | Web Developer

[GitHub](https://github.com/YOUR_USERNAME)

---

⭐ If you find this project interesting, consider giving it a star!
