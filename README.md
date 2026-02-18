# EduProof - Credential Verification Platform

A complete production-ready credential verification web application built with modern technologies. EduProof enables secure issuance, management, and verification of educational credentials with role-based access for candidates, recruiters, and institutions.

## 🚀 Tech Stack

- **Vite** - Lightning-fast build tool
- **React 18** - Modern UI library
- **TypeScript** - Type safety and better DX
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality UI components
- **React Router v6** - Client-side routing with nested routes
- **Supabase** - Authentication & PostgreSQL database
- **React Query** - Data fetching and caching

## 📋 Features

### 🔐 Authentication System
- Email/password authentication via Supabase
- Role-based access control (candidate, recruiter, institution)
- Protected routes with automatic redirects
- Secure session management

### 👥 Three User Roles

#### **Candidates**
- Upload and manage credentials
- Verify certificates
- Generate professional CVs from credentials
- Track verification status

#### **Recruiters**
- Verify candidate credentials
- View verification history
- Access comprehensive candidate profiles

#### **Institutions**
- Issue digital certificates
- Manage issued certificates
- View activity logs
- Access analytics dashboard

### 🎨 UI/UX
- Clean, professional interface
- Fully responsive design
- Role-aware navigation
- Loading states and error handling
- Toast notifications

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** - v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm** - v9.0.0 or higher (comes with Node.js)
- **Git** - For version control
- **Supabase Account** - Free tier available at [supabase.com](https://supabase.com)

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/tanmay123-lab/eduproff.git
cd eduproff
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**To get your Supabase credentials:**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project or select existing one
3. Go to Project Settings → API
4. Copy the "Project URL" and "anon/public" API key

## 🗄️ Database Setup

### Option 1: Using Supabase Dashboard (Recommended)

1. **Navigate to SQL Editor** in your Supabase project
2. **Create a new query**
3. **Copy and paste** the contents of `supabase/migrations/consolidated_schema.sql`
4. **Run the query** to create all tables, policies, and functions

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### Database Schema Overview

The database includes the following tables:

- **profiles** - User profile information
- **user_roles** - Role assignments (candidate/recruiter/institution)
- **institutions** - Institution-specific data
- **certificates** - Candidate-uploaded certificates
- **issued_certificates** - Institution-issued certificates
- **verification_logs** - Verification activity tracking
- **rate_limits** - API rate limiting

All tables include:
- ✅ Row Level Security (RLS) policies
- ✅ Proper foreign key relationships
- ✅ Indexes for performance
- ✅ Automatic timestamp updates

### Authentication Setup

1. **Enable Email Authentication**
   - Go to Authentication → Providers in Supabase
   - Enable "Email" provider
   - Configure email templates (optional)

2. **Configure Email Redirects**
   - Go to Authentication → URL Configuration
   - Add your site URL: `http://localhost:5173` (development)
   - Add redirect URLs as needed

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── auth/                # Authentication components
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   └── RoleSelector.tsx
│   ├── dashboard/           # Dashboard components
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   ├── StatCard.tsx
│   │   └── DataTable.tsx
│   ├── layout/              # Layout components
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   └── ProtectedRoute.tsx   # Route protection
├── context/
│   └── AuthContext.tsx      # Auth state management
├── hooks/
│   ├── useAuth.ts           # Auth hook
│   └── use-toast.ts         # Toast notifications
├── lib/
│   ├── supabase.ts          # Supabase client
│   └── utils.ts             # Utility functions
├── pages/
│   ├── public/              # Public pages
│   │   ├── Home.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── About.tsx
│   │   ├── Privacy.tsx
│   │   ├── Terms.tsx
│   │   └── Support.tsx
│   ├── student/             # Candidate pages
│   ├── recruiter/           # Recruiter pages
│   ├── institution/         # Institution pages
│   └── Auth.tsx             # Login/Signup page
├── types/
│   └── index.ts             # TypeScript type definitions
├── App.tsx                  # Main app component
└── main.tsx                 # Entry point
```

## 🔒 Security Features

- **Row Level Security (RLS)** - Database-level access control
- **Role-based Access Control** - Application-level permissions
- **Secure Authentication** - Supabase Auth with JWT tokens
- **Rate Limiting** - API protection against abuse
- **Input Validation** - Form validation with Zod
- **XSS Protection** - React's built-in escaping
- **HTTPS Only** - Enforced secure connections in production

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables
5. Deploy

### Deploy to Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Import your repository
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Add environment variables
7. Deploy

### Environment Variables for Production

Remember to add these environment variables in your deployment platform:

```
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

## 🔧 Configuration

### Tailwind CSS

Tailwind is configured in `tailwind.config.ts`. The configuration includes:
- Custom color schemes
- Typography plugin
- Animation utilities

### shadcn/ui

Components are configured in `components.json`. To add new components:

```bash
npx shadcn-ui@latest add [component-name]
```

## 🐛 Troubleshooting

### Build Issues

```bash
# Clear cache and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Issues

1. Verify your Supabase URL and anon key
2. Check if your Supabase project is active
3. Ensure RLS policies are properly configured

### Authentication Issues

1. Check if email provider is enabled in Supabase
2. Verify email templates are configured
3. Check browser console for specific errors

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Supabase Documentation](https://supabase.com/docs)
- [React Router Documentation](https://reactrouter.com)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Development Team

Built with ❤️ by the EduProof team

## 🔄 Version History

- **v1.0.0** - Initial release
  - Complete authentication system
  - Role-based dashboards
  - Certificate management
  - Verification system

---

For questions or support, please open an issue on GitHub or contact support.
