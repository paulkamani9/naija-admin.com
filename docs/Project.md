# Naija.com Admin Dashboard

## Project Overview

The administration dashboard for **Naija.com**, Nigeria's premier healthcare management platform. This admin portal empowers administrators to efficiently manage the complex ecosystem of health insurance providers (HMOs), healthcare facilities, and insurance plans across Nigeria.

Our mission is to streamline healthcare administration while maintaining the highest standards of data integrity and user experience in Nigeria's growing digital health sector.

---

## Core Features & Navigation

### 1. **HMO Management** `/hmo`

- **Create & Configure HMOs**: Register new Health Maintenance Organizations
- **Provider Network Management**: Manage HMO partnerships and networks
- **Compliance Tracking**: Monitor regulatory compliance and certifications
- **Performance Analytics**: Track HMO performance metrics and member satisfaction

### 2. **Hospital Management** `/hospitals`

- **Hospital Registration**: Add and verify healthcare facilities
- **Facility Information**: Manage hospital details, specialties, and services
- **Accreditation Status**: Track hospital certifications and quality ratings
- **Network Assignments**: Map hospitals to HMO networks

### 3. **Insurance Plans** `/plans`

- **Plan Creation**: Design comprehensive insurance packages
- **Benefit Configuration**: Define coverage levels, limits, and exclusions
- **Pricing Management**: Set premium structures and payment terms
- **Plan Assignment**: Link plans to specific HMOs and hospitals
- **Regulatory Compliance**: Ensure plans meet NHIA standards

### 4. **Analytics & Reporting** `/analytics`

- **Dashboard Overview**: Real-time insights into system performance
- **Financial Analytics**: Revenue, claims, and cost analysis
- **Usage Statistics**: Member enrollment and facility utilization
- **Compliance Reports**: Regulatory reporting and audit trails

### 5. **User Management** `/users`

- **Admin Accounts**: Manage administrative user access and permissions
- **Role-Based Access**: Configure permissions for different admin levels
- **Activity Logging**: Track admin actions and system changes
- **Security Management**: Password policies and session management

---

## Design System & Branding

### Color Palette

- **Primary Green**: `oklch(0.63 0.1699 149.21)` - Inspired by the Nigerian flag
- **Sidebar Background**: Dark forest green for professional appearance
- **Accent Colors**: Various shades of green maintaining brand consistency
- **Text**: High contrast whites and dark grays for accessibility

### Typography & Layout

- **Modern Sidebar**: Clean, organized navigation with intuitive icons
- **Consistent Spacing**: Proper spacing and separators for visual hierarchy
- **Professional Aesthetics**: Healthcare-appropriate design language
- **Responsive Design**: Mobile-first approach for all screen sizes

### Component Library

- **Shadcn/UI Integration**: Consistent, accessible UI components
- **Custom Logo Component**: Scalable Naija.com branding with Nigerian theme
- **Loading States**: Professional loading indicators with brand elements
- **Form Components**: Healthcare-specific input validation and styling

---

## Technical Architecture

### Frontend Stack

- **Next.js 14+**: React framework with App Router
- **TypeScript**: Full type safety across the application
- **Tailwind CSS**: Utility-first styling with custom design tokens
- **Shadcn/UI**: Modern component library for consistency

### Authentication & Security

- **Better-Auth**: Secure authentication system
- **Role-Based Access Control**: Granular permissions for different admin levels
- **Session Management**: Secure session handling with proper timeouts

### Database & API

- **Drizzle ORM**: Type-safe database operations
- **RESTful APIs**: Clean API design for all CRUD operations
- **Data Validation**: Server-side validation for all inputs
- **Audit Trails**: Complete logging of all administrative actions

### Infrastructure

- **Admin-Only Environment**: Restricted access to authorized personnel
- **API-First Design**: Easy integration with main Naija.com services
- **Scalable Architecture**: Designed for growth and feature expansion
- **Nigerian Compliance**: Built to meet local healthcare regulations

---
