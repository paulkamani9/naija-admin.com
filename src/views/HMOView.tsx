"use client";

import React, { useState, useEffect } from "react";
import {
  HeartHandshakeIcon,
  SearchIcon,
  PlusIcon,
  MoreHorizontalIcon,
  PencilIcon,
  TrashIcon,
  BuildingIcon,
  UserIcon,
} from "lucide-react";
import { getHmosAction, deleteHmoAction, getHmoAction } from "@/server";
import type {
  Hmo,
} from "@/db/types";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { AddHmoDialog } from "@/components/forms/AddHmoDialog";

interface HmoWithDetails extends Hmo {
  hospital?: {
    id: string;
    name: string;
    state?: string;
  };
  creator?: {
    id: string;
    name: string;
    email: string;
  };
}

export const HMOView = () => {
  const [hmos, setHmos] = useState<HmoWithDetails[]>([]);
  const [totalHmos, setTotalHmos] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadHmos = async () => {
    setIsLoading(true);
    try {
      const result = await getHmosAction(
        {}, // Filters
        { limit: itemsPerPage, offset: (currentPage - 1) * itemsPerPage }
      );

      if (result.success && result.data) {
        // For each HMO, fetch the detailed information with relations
        const detailedHmos = await Promise.all(
          result.data.hmos.map(async (hmo) => {
            try {
              const detailResult = await getHmoAction(hmo.id);
              if (detailResult.success && detailResult.data) {
                return {
                  ...hmo,
                  hospital: detailResult.data.hospital,
                  creator: detailResult.data.creator,
                } as HmoWithDetails;
              }
            } catch (e) {
              console.error(`Failed to fetch details for HMO ${hmo.id}:`, e);
            }
            return hmo as HmoWithDetails;
          })
        );

        setHmos(detailedHmos);
        setTotalHmos(result.data.total);
      } else {
        console.error("Failed to load HMOs:", result.errors);
      }
    } catch (error) {
      console.error("Error loading HMOs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHmos();
  }, [currentPage]);

  const handleAddSuccess = (newHmo: Hmo) => {
    setHmos((prev) => [newHmo, ...prev]);
    setTotalHmos((prev) => prev + 1);
  };

  const handleDeleteHmo = async (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this HMO? This will also delete all related insurance plans."
      )
    ) {
      try {
        const result = await deleteHmoAction(id);
        if (result.success) {
          setHmos((prev) => prev.filter((hmo) => hmo.id !== id));
          setTotalHmos((prev) => prev - 1);
        } else {
          console.error("Failed to delete HMO:", result.errors);
          alert("Failed to delete HMO. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting HMO:", error);
        alert("An error occurred while deleting the HMO.");
      }
    }
  };

  const totalPages = Math.ceil(totalHmos / itemsPerPage);

  // Filter HMOs based on search query
  const filteredHmos = hmos.filter(
    (hmo) =>
      hmo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hmo.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-col space-y-6">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Health Maintenance Organizations
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage HMOs and their insurance plan offerings
            </p>
          </div>
          <AddHmoDialog onSuccess={handleAddSuccess} />
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search HMOs by name or code..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* HMOs grid/list */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader className="h-24 bg-muted/30" />
                <CardContent className="h-32 mt-2">
                  <div className="h-4 bg-muted rounded mb-2 w-2/3" />
                  <div className="h-4 bg-muted rounded mb-2 w-1/2" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredHmos.length === 0 ? (
          <Card className="w-full py-16 flex flex-col items-center justify-center text-center">
            <HeartHandshakeIcon className="h-16 w-16 text-muted-foreground/30 mb-6" />
            <CardTitle className="text-xl">No HMOs found</CardTitle>
            <CardDescription className="mt-2 max-w-md">
              {searchQuery
                ? "No HMOs match your search criteria. Try a different search term."
                : "Get started by adding your first HMO to the network."}
            </CardDescription>
            {!searchQuery && (
              <Button
                className="mt-6"
                onClick={() =>
                  document
                    .querySelector<HTMLButtonElement>('[aria-label="Add HMO"]')
                    ?.click()
                }
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add HMO
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHmos.map((hmo) => (
              <Card
                key={hmo.id}
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center overflow-hidden">
                        {hmo.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={hmo.logoUrl}
                            alt={`${hmo.name} logo`}
                            width={24}
                            height={24}
                            className="object-contain"
                            onError={(e) => {
                              const target =
                                e.currentTarget as HTMLImageElement;
                              if (target.src !== "/hmo-placeholder.svg") {
                                target.src = "/hmo-placeholder.svg";
                              }
                            }}
                          />
                        ) : (
                          <HeartHandshakeIcon className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg font-medium">
                          {hmo.name}
                        </CardTitle>
                        {hmo.code && (
                          <p className="text-sm text-muted-foreground font-mono">
                            {hmo.code}
                          </p>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontalIcon className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="flex items-center cursor-pointer"
                          onClick={() => alert(`Edit HMO ${hmo.id}`)}
                        >
                          <PencilIcon className="mr-2 h-4 w-4" />
                          Edit HMO
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="flex items-center cursor-pointer text-destructive focus:text-destructive"
                          variant="destructive"
                          onClick={() => handleDeleteHmo(hmo.id)}
                        >
                          <TrashIcon className="mr-2 h-4 w-4" />
                          Delete HMO
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mt-2">
                    {hmo.hospital && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <BuildingIcon className="h-4 w-4 mr-2" />
                        <span>
                          {hmo.hospital.name}
                          {hmo.hospital.state && ` • ${hmo.hospital.state}`}
                        </span>
                      </div>
                    )}

                    {hmo.creator && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <UserIcon className="h-4 w-4 mr-2" />
                        <span>Created by {hmo.creator.name}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-end mt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => alert(`View plans for HMO ${hmo.id}`)}
                      >
                        View Plans
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="text-sm">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
