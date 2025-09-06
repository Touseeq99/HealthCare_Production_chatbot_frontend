# Healthcare Chatbot Platform - User Workflows

## Complete User Journey Documentation

### 1. PATIENT WORKFLOW

#### Registration & Onboarding
1. **Landing Page** (`/`) - Welcome page with platform overview
2. **Sign Up** (`/signup`) - Patient registration form
   - Personal information (name, email, phone, occupation)
   - Password setup
   - Terms agreement
   - API Call: `POST /api/auth/signup`
3. **Consent Page** (`/consent?role=patient`) - Medical disclaimer
   - Educational advice disclaimer
   - "I Understand & Continue" button
4. **Patient Dashboard** (`/patient/chat`) - Main chat interface

#### Daily Usage
1. **Login** (`/login`) - Authentication
   - Email/password or demo credentials
   - API Call: `POST /api/auth/login`
   - Role validation (patient only)
2. **Chat Interface** - Main patient experience
   - Health question input
   - AI chatbot responses via `POST /api/chat/patient`
   - Chat history persistence
   - Health tips and suggestions
3. **Health Articles** - Educational content
   - Blog posts from admin via `GET /api/articles`
   - Medical information and tips
4. **Logout** - Session termination

---

### 2. DOCTOR WORKFLOW

#### Registration & Onboarding
1. **Landing Page** (`/`) - Welcome page
2. **Sign Up** (`/signup`) - Doctor registration form
   - Personal information
   - Medical specialization
   - License number
   - Medical license document upload
   - API Call: `POST /api/auth/signup`
3. **Consent Page** (`/consent?role=doctor`) - Professional guidelines
   - Assistive tool disclaimer
   - Ethical usage agreement
4. **Doctor Dashboard** (`/doctor/dashboard`) - Professional interface

#### Daily Usage
1. **Login** (`/login`) - Authentication
   - Email/password or demo credentials
   - API Call: `POST /api/auth/login`
   - Role validation (doctor only)
2. **Chat Interface** - Professional AI assistant
   - Medical queries and consultations
   - AI responses via `POST /api/chat/doctor`
   - Chat history with session management
   - Professional medical guidance
3. **Logout** - Session termination

---

### 3. ADMIN WORKFLOW

#### Access & Management
1. **Login** (`/login`) - Admin authentication
   - Admin credentials required
   - API Call: `POST /api/auth/login`
   - Role validation (admin only)
2. **Admin Dashboard** (`/admin/dashboard`) - Management interface

#### Platform Management
1. **Overview Tab** - Platform statistics
   - Total users, active users, doctors, chat sessions
   - API Call: `GET /api/admin/users`
2. **Users Tab** - User management
   - View all users
   - Pending doctor approvals
   - Active sessions monitoring
3. **Documents Tab** - File management
   - Upload medical documents via `POST /api/admin/upload-docs`
   - View uploaded files via `GET /api/admin/documents`
   - Document management
4. **Blog Posts Tab** - Content management
   - Create health articles via `POST /api/admin/articles`
   - View published posts via `GET /api/admin/articles`
   - Content moderation
5. **Logout** - Session termination

---

### 4. AUTHENTICATION FLOWS

#### Demo Credentials (Testing)
- **Patient**: `patient@demo.com` / `password123`
- **Doctor**: `doctor@demo.com` / `password123`  
- **Admin**: `admin@demo.com` / `password123`

#### Role-Based Access Control
- Patients cannot access doctor/admin areas
- Doctors cannot access patient/admin areas
- Admins cannot access patient/doctor chat areas
- Cross-role login attempts are blocked with error messages

#### Session Management
- User role stored in localStorage
- Authentication status tracked
- Automatic logout functionality
- Role-based routing after login

---

### 5. API ENDPOINTS SUMMARY

#### Authentication
- `POST /api/auth/login` - User login with role validation
- `POST /api/auth/signup` - User registration
- `POST /api/auth/forgot-password` - Password reset

#### Patient Features
- `POST /api/chat/patient` - Patient chatbot queries
- `GET /api/chat/patient/history` - Patient chat history
- `GET /api/articles` - Health articles for patients

#### Doctor Features  
- `POST /api/chat/doctor` - Doctor chatbot queries with session management
- `GET /api/chat/doctor/history` - Doctor chat history

#### Admin Features
- `GET /api/admin/users` - User statistics and management
- `POST /api/admin/upload-docs` - Document upload
- `GET /api/admin/documents` - Document management
- `POST /api/admin/articles` - Create health articles
- `GET /api/admin/articles` - Manage articles

---

### 6. ERROR HANDLING & EDGE CASES

#### Authentication Errors
- Invalid credentials → Error message display
- Wrong role access → Redirect to appropriate login
- Session expiry → Automatic logout

#### API Failures
- Network errors → Fallback to demo data
- Server errors → User-friendly error messages
- Loading states → Proper UI feedback

#### User Experience
- Form validation with real-time feedback
- Loading spinners during API calls
- Success/error notifications
- Responsive design for all devices

---

### 7. SECURITY CONSIDERATIONS

#### Data Protection
- Role-based access control
- Input validation and sanitization
- Secure file upload handling
- Session management

#### Medical Compliance
- Patient data privacy
- Medical disclaimer requirements
- Professional usage guidelines
- Audit trail for admin actions
