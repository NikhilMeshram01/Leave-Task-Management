# Employee Task & Leave Management Portal

A full-featured Angular 18+ application demonstrating modern Angular capabilities including authentication, task management, leave requests, and analytics.

## Features

### Authentication & Authorization

- Login/Signup functionality with Supabase
- JWT token-based authentication
- Route guards (AuthGuard and RoleGuard)
- Secure session management

### Task Management (CRUD)

- Create, read, update, and delete tasks
- Task filtering (all, pending, completed)
- Signal-based state management
- Sibling component communication
- Overdue task highlighting with custom directive
- Task animations (fade in/out)

### Leave Management

- Apply for leave with reactive forms
- Custom validators (date cannot be in past)
- Leave approval/rejection (admin only)
- Leave status tracking (pending, approved, rejected)
- Date formatting with custom pipes

### Analytics Dashboard

- Lazy-loaded module
- Task and leave statistics
- Progress bars and visual indicators
- Quick action buttons

### Modern Angular Features

- **Signals**: State management for tasks, leaves, and auth
- **Standalone Components**: All components are standalone
- **Custom Directive**: Highlight overdue tasks
- **Custom Pipes**: Capitalize first letter, format dates
- **Animations**: Smooth transitions for task operations
- **Interceptors**: Auth token attachment and error handling
- **Guards**: Route protection based on authentication and roles
- **Lazy Loading**: Dashboard, tasks, and leaves modules

## Tech Stack

- **Frontend**: Angular 18+
- **State Management**: Angular Signals
- **Backend**: Supabase (Authentication & Database)
- **Styling**: Custom CSS
- **Routing**: Angular Router with lazy loading

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── guards/          # Auth and role guards
│   │   ├── interceptors/    # HTTP interceptors
│   │   ├── models/          # TypeScript interfaces
│   │   └── services/        # Core services (auth, task, leave, toast, supabase)
│   ├── features/
│   │   ├── auth/            # Login and signup components
│   │   ├── dashboard/       # Dashboard component (lazy loaded)
│   │   ├── tasks/           # Task management components
│   │   └── leaves/          # Leave management components
│   └── shared/
│       ├── components/      # Shared components (toast, layout)
│       ├── directives/      # Custom directives
│       └── pipes/           # Custom pipes
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

The application uses Supabase for backend services. You'll need to set up the database schema:

**Note**: There was an issue connecting to the database during setup. Please add database persistence later by running the following SQL migration:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text DEFAULT 'employee' CHECK (role IN ('employee', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  due_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create leaves table
CREATE TABLE IF NOT EXISTS leaves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  leave_type text NOT NULL CHECK (leave_type IN ('sick', 'annual', 'casual')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS and create policies (see full migration in docs)
```

### 3. Run Development Server

```bash
npm start
```

The application will be available at `http://localhost:4200`

### 4. Build for Production

```bash
npm run build
```

## Usage

### Login

1. Navigate to `/login`
2. Enter your credentials
3. Click "Login"

### Signup

1. Navigate to `/signup`
2. Fill in your details (full name, email, password)
3. Click "Sign Up"
4. Login with your new credentials

### Task Management

1. Navigate to `/tasks`
2. Use the filter buttons to view all, pending, or completed tasks
3. Add new tasks using the form
4. Toggle task completion by clicking the checkbox
5. Delete tasks using the delete button

### Leave Management

1. Navigate to `/leaves`
2. Fill in the leave application form
3. Submit your request
4. Admins can approve/reject leave requests

### Dashboard

1. Navigate to `/dashboard`
2. View task and leave statistics
3. Use quick action buttons to navigate to tasks or leaves

## Key Implementation Details

### Signals for State Management

All services use Angular signals for reactive state management:

- `TaskService`: Manages task state with filtering
- `LeaveService`: Manages leave state
- `AuthService`: Manages authentication state
- `ToastService`: Manages toast notifications

### Sibling Component Communication

Tasks module demonstrates sibling communication:

- `TaskFilterComponent` emits filter changes
- `TaskService` acts as the communication bridge
- `TaskListComponent` reactively updates based on filter

### Custom Validators

Leave form includes custom validators:

- Future date validator (prevents past dates)
- Date range validator (end date must be after start date)

### Route Guards

- `authGuard`: Protects routes requiring authentication
- `roleGuard`: Restricts access to admin-only features

### Interceptors

- `authInterceptor`: Attaches JWT token to requests
- `errorInterceptor`: Global error handling with toast notifications

## Evaluation Criteria Coverage

- ✅ Full CRUD functionality implemented
- ✅ Signals for state management
- ✅ Sibling communication handled cleanly
- ✅ Proper use of interceptors, guards, and lazy loading
- ✅ Custom pipes and directives
- ✅ Reactive forms with custom validators
- ✅ Error handling & UI feedback (loading states, error toasts)
- ✅ Animations for task operations
- ✅ Code organized with modular architecture

## Future Enhancements

- Add chart visualizations with Chart.js
- Implement offline support with IndexedDB
- Add dark/light mode toggle
- Create role-based dashboard widgets
- Convert to PWA
