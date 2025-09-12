# Dashboard Components

This directory contains the modular dashboard system built with React 19, Next.js App Router, and shadcn/ui. The architecture follows a hybrid component design pattern for maximum reusability and consistency.

## Architecture Overview

### Base Components

#### `BaseDashboardCard`

The foundation component that provides:

- **Consistent Layout**: Title, description, count badge, and action buttons
- **Modern Styling**: Gradient backgrounds, hover effects, and smooth transitions
- **Extensible Design**: Children content area for entity-specific data
- **Built-in Actions**: "Add New" button and "View All" navigation
- **Loading States**: Support for optimistic updates and pending states

### Entity-Specific Components

#### `HospitalCard`

- Displays healthcare facilities
- Shows admin information, location, and contact details
- Reuses `BaseDashboardCard` layout

#### `HmoCard`

- Displays Health Maintenance Organizations
- Shows HMO codes, associated hospitals, and creator information
- Consistent card design through base component

#### `PlanCard`

- Displays insurance plans with formatted pricing
- Shows plan types (Family, Individual, Enterprise) with color-coded badges
- Includes cost formatting using the currency utility

#### `UserCard` (Example)

- Demonstrates how easy it is to add new entities
- Shows user management with roles and status
- Perfect example of the modular architecture

## Data Handling

### Server Components

- **`DashboardServerContent`**: Server-side data fetching with Suspense
- Uses Drizzle ORM queries through server actions
- Parallel data fetching for optimal performance

### Client Components

- **`DashboardContent`**: Client-side with React 19 concurrent features
- `useTransition` for smooth loading states
- `useOptimistic` for instant UI feedback
- Real-time-like user experience

## Styling & Design

### Modern UI Elements

- **Gradient Backgrounds**: Subtle card gradients
- **Hover Effects**: Smooth transitions and shadow changes
- **Color-Coded Badges**: Entity type indicators
- **Consistent Typography**: shadcn/ui typography system
- **Responsive Design**: Mobile-first approach

### Visual Hierarchy

- **Card Headers**: Icon, title, count badge, and actions
- **Content Areas**: Entity-specific information display
- **Footer Actions**: Navigation to detailed views

## Usage Examples

### Adding a New Entity Card

```tsx
// 1. Create your entity-specific component
export function MyEntityCard({ entities, onAddNew }: Props) {
  return (
    <BaseDashboardCard
      title="My Entities"
      description="Manage your entities"
      count={entities.length}
      icon={MyIcon}
      onAddNew={onAddNew}
      addNewLabel="Add Entity"
      viewAllHref="/entities"
    >
      {/* Your entity-specific content */}
      <div className="space-y-3">
        {entities.map((entity) => (
          <EntityItem key={entity.id} entity={entity} />
        ))}
      </div>
    </BaseDashboardCard>
  );
}

// 2. Add to your dashboard
<DashboardGrid>
  <HospitalCard hospitals={hospitals} />
  <HmoCard hmos={hmos} />
  <PlanCard plans={plans} />
  <MyEntityCard entities={entities} /> {/* New card! */}
</DashboardGrid>;
```

### Loading States

The system includes comprehensive loading states:

```tsx
// Skeleton loading for initial load
<DashboardSkeleton />

// Individual card loading states
<HospitalCard hospitals={hospitals} isLoading={isPending} />
```

## Future Extensibility

The modular design makes it incredibly easy to:

1. **Add New Entity Types**: Create a new component using `BaseDashboardCard`
2. **Customize Layouts**: Override specific styling while maintaining consistency
3. **Add Features**: Extend base functionality (search, filters, actions)
4. **Update Styling**: Modify base component to affect all cards

## Benefits

✅ **Consistent Design**: All cards follow the same visual language  
✅ **Easy to Extend**: Add new entities in minutes, not hours  
✅ **Modern UX**: Smooth animations and responsive design  
✅ **Performance**: Server-side rendering with client-side enhancements  
✅ **Type Safety**: Full TypeScript support with proper typing  
✅ **Accessibility**: Built on shadcn/ui's accessible components

## Component Dependencies

```
BaseDashboardCard
├── Card (shadcn/ui)
├── Button (shadcn/ui)
├── Badge (shadcn/ui)
└── Icons (lucide-react)

Entity Cards
├── BaseDashboardCard
├── Separator (shadcn/ui)
└── Currency utilities

Layout
├── DashboardGrid
└── DashboardSkeleton
```

This architecture provides a solid foundation for a scalable, maintainable dashboard system that grows with your application needs.
