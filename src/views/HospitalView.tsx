"use client";

import React, { useState, useEffect } from "react";
import {
  BuildingIcon,
  SearchIcon,
  PlusIcon,
  MoreHorizontalIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import { getHospitalsAction, deleteHospitalAction } from "@/server";
import type {
  Hospital,
  HospitalWithAdmin,
  ServerActionResult,
} from "@/db/types";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { AddHospitalDialog } from "@/components/forms/AddHospitalDialog";
import { Separator } from "@/components/ui/separator";

export const HospitalView = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [totalHospitals, setTotalHospitals] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [hospitalToDelete, setHospitalToDelete] = useState<Hospital | null>(
    null
  );
  const itemsPerPage = 10;

  const loadHospitals = async () => {
    setIsLoading(true);
    try {
      const result = await getHospitalsAction(
        {}, // Filters
        { limit: itemsPerPage, offset: (currentPage - 1) * itemsPerPage }
      );

      if (result.success && result.data) {
        setHospitals(result.data.hospitals);
        setTotalHospitals(result.data.total);
      } else {
        console.error("Failed to load hospitals:", result.errors);
      }
    } catch (error) {
      console.error("Error loading hospitals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHospitals();
  }, [currentPage]);

  const handleAddSuccess = (newHospital: Hospital) => {
    setHospitals((prev) => [newHospital, ...prev]);
    setTotalHospitals((prev) => prev + 1);
  };

  const handleEditSuccess = (updatedHospital: Hospital) => {
    setHospitals((prev) =>
      prev.map((hospital) =>
        hospital.id === updatedHospital.id ? updatedHospital : hospital
      )
    );
    setEditingHospital(null);
  };

  const handleDeleteHospital = async () => {
    if (!hospitalToDelete) return;

    try {
      const result = await deleteHospitalAction(hospitalToDelete.id);
      if (result.success) {
        setHospitals((prev) =>
          prev.filter((hospital) => hospital.id !== hospitalToDelete.id)
        );
        setTotalHospitals((prev) => prev - 1);
        setHospitalToDelete(null);
      } else {
        console.error("Failed to delete hospital:", result.errors);
        alert("Failed to delete hospital. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting hospital:", error);
      alert("An error occurred while deleting the hospital.");
    }
  };

  const totalPages = Math.ceil(totalHospitals / itemsPerPage);

  // Filter hospitals based on search query
  const filteredHospitals = hospitals.filter(
    (hospital) =>
      hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospital.state?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospital.localGovernment
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-col space-y-6">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Hospitals</h1>
            <p className="text-muted-foreground mt-1">
              Manage healthcare facilities in your network
            </p>
          </div>
          <AddHospitalDialog onSuccess={handleAddSuccess} />
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search hospitals..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Hospitals grid/list */}
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
        ) : filteredHospitals.length === 0 ? (
          <Card className="w-full py-16 flex flex-col items-center justify-center text-center">
            <BuildingIcon className="h-16 w-16 text-muted-foreground/30 mb-6" />
            <CardTitle className="text-xl">No hospitals found</CardTitle>
            <CardDescription className="mt-2 max-w-md">
              {searchQuery
                ? "No hospitals match your search criteria. Try a different search term."
                : "Get started by adding your first hospital to the network."}
            </CardDescription>
            {!searchQuery && (
              <Button
                className="mt-6"
                onClick={() =>
                  document
                    .querySelector<HTMLButtonElement>(
                      '[aria-label="Add Hospital"]'
                    )
                    ?.click()
                }
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Hospital
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHospitals.map((hospital) => (
              <Card
                key={hospital.id}
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <BuildingIcon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg font-medium">
                        {hospital.name}
                      </CardTitle>
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
                          onClick={() => setEditingHospital(hospital)}
                        >
                          <PencilIcon className="mr-2 h-4 w-4" />
                          Edit Hospital
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="flex items-center cursor-pointer text-destructive focus:text-destructive"
                          onClick={() => setHospitalToDelete(hospital)}
                        >
                          <TrashIcon className="mr-2 h-4 w-4" />
                          Delete Hospital
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mt-2">
                    {hospital.address && (
                      <div className="text-sm text-muted-foreground">
                        {hospital.address}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 items-center text-sm">
                      {hospital.state && (
                        <Badge variant="outline">
                          {hospital.state}
                          {hospital.localGovernment &&
                            `, ${hospital.localGovernment}`}
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                      {hospital.phone && (
                        <div className="flex items-center gap-1.5">
                          <span>📞</span>
                          <span>{hospital.phone}</span>
                        </div>
                      )}

                      {hospital.email && (
                        <div className="flex items-center gap-1.5">
                          <span>✉️</span>
                          <span className="truncate max-w-[180px]">
                            {hospital.email}
                          </span>
                        </div>
                      )}
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

      {/* Edit Hospital Dialog */}
      {editingHospital && (
        <AddHospitalDialog
          hospital={editingHospital}
          open={!!editingHospital}
          onOpenChange={(open: boolean) => !open && setEditingHospital(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!hospitalToDelete}
        onOpenChange={(open) => !open && setHospitalToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hospital</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{hospitalToDelete?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setHospitalToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteHospital}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
