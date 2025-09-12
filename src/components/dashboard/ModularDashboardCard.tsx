"use client";

import { BaseDashboardCard } from "./BaseDashboardCard";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UsersIcon, ShieldIcon } from "lucide-react";

// Example of how easy it is to add a new entity card using the base component
// This demonstrates the modular design for future extensibility

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  isActive?: boolean;
}

interface UserCardProps {
  users: User[];
  onAddNew?: () => void;
  isLoading?: boolean;
}

export function UserCard({ users, onAddNew, isLoading }: UserCardProps) {
  const activeUsers = users.filter((user) => user.isActive !== false);

  return (
    <BaseDashboardCard
      title="Users"
      description="Manage user accounts and permissions"
      count={activeUsers.length}
      icon={UsersIcon}
      onAddNew={onAddNew}
      addNewLabel="Add User"
      viewAllHref="/users"
      isLoading={isLoading}
      headerActions={
        users.length > activeUsers.length && (
          <Badge variant="outline" className="text-xs">
            {users.length - activeUsers.length} inactive
          </Badge>
        )
      }
    >
      <div className="space-y-3">
        {activeUsers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <UsersIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No active users found</p>
            <p className="text-xs">Invite your first user to get started</p>
          </div>
        ) : (
          <>
            {activeUsers.slice(0, 3).map((user, index) => (
              <div key={user.id}>
                <div className="group/item flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 group-hover/item:bg-blue-500/15 transition-colors">
                    <UsersIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">
                        {user.name}
                      </h4>
                      {user.role && (
                        <Badge
                          variant="secondary"
                          className="text-xs flex items-center gap-1"
                        >
                          <ShieldIcon className="w-3 h-3" />
                          {user.role}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
                {index < Math.min(activeUsers.length, 3) - 1 && (
                  <Separator className="my-2 opacity-30" />
                )}
              </div>
            ))}

            {activeUsers.length > 3 && (
              <div className="text-center pt-2">
                <p className="text-xs text-muted-foreground">
                  +{activeUsers.length - 3} more users
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </BaseDashboardCard>
  );
}

// This demonstrates how the modular design makes it incredibly easy to add new entities
// Simply:
// 1. Create the entity-specific card component (like UserCard above)
// 2. Use BaseDashboardCard for consistent layout and styling
// 3. Add entity-specific content in the children
// 4. Optionally add custom header actions or badges
// 5. The card automatically gets the modern design, hover effects, and consistent spacing
