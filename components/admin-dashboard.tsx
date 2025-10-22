'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { SimpleAccessGuard } from '@/components/simple-access-guard';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination } from '@/components/ui/pagination-controls';
import { ImageViewer } from '@/components/ui/image-viewer';
import { toast } from 'sonner';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Star,
  Image as ImageIcon,
  ExternalLink,
  Upload,
  Loader2,
  Wine,
  UtensilsCrossed,
} from 'lucide-react';
import Image from 'next/image';
import { SmartImage } from '@/components/ui/smart-image';
import { useDebounce } from '@/hooks/use-debounce';
import {
  useVineyards,
  useDeleteVineyard,
  useUploadImage,
  type Vineyard,
} from '@/hooks/use-vineyard-queries';
import {
  useRestaurants,
  useDeleteRestaurant,
} from '@/hooks/use-restaurant-queries';
import { Restaurant } from '@/lib/types-vineyard';

export function AdminDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tab state - initialize from URL params or default to vineyards
  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get('tab') || 'vineyards';
  });

  // Pagination and search state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState<string | null>(null);

  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch vineyards with React Query
  const {
    data: vineyardsData,
    isLoading: vineyardsLoading,
    isError: vineyardsError,
    error: vineyardsErrorData,
    refetch: refetchVineyards,
  } = useVineyards({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearchTerm,
  });

  // Fetch restaurants with React Query
  const {
    data: restaurantsData,
    isLoading: restaurantsLoading,
    isError: restaurantsError,
    error: restaurantsErrorData,
    refetch: refetchRestaurants,
  } = useRestaurants({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearchTerm,
  });

  // Mutations
  const deleteVineyardMutation = useDeleteVineyard();
  const deleteRestaurantMutation = useDeleteRestaurant();
  const uploadImageMutation = useUploadImage();

  // Sync tab state with URL params
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (
      tabFromUrl &&
      (tabFromUrl === 'vineyards' || tabFromUrl === 'restaurants')
    ) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Check if user is admin
  if (session === null) {
    router.push('/sign-in');
    return null;
  }

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchTerm('');

    // Update URL to persist tab state
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    router.replace(url.pathname + url.search);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Handle search
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle create new vineyard
  const handleCreateVineyard = () => {
    router.push('/admin/vineyards/new/edit');
  };

  // Handle create new restaurant
  const handleCreateRestaurant = () => {
    router.push('/admin/restaurants/new/edit?tab=restaurants');
  };

  // Handle edit vineyard
  const handleEditVineyard = (vineyard: Vineyard) => {
    router.push(`/admin/vineyards/${vineyard.id}/edit`);
  };

  // Handle edit restaurant
  const handleEditRestaurant = (restaurant: Restaurant) => {
    router.push(`/admin/restaurants/${restaurant.id}/edit?tab=restaurants`);
  };

  // Handle delete vineyard
  const handleDeleteVineyard = async (vineyard: Vineyard) => {
    try {
      await deleteVineyardMutation.mutateAsync(vineyard.id);
    } catch (error) {
      // Error is handled by the mutation
      console.error('Delete error:', error);
    }
  };

  // Handle delete restaurant
  const handleDeleteRestaurant = async (restaurant: Restaurant) => {
    try {
      await deleteRestaurantMutation.mutateAsync(restaurant.id);
    } catch (error) {
      // Error is handled by the mutation
      console.error('Delete error:', error);
    }
  };

  // Handle quick image upload for vineyard
  const handleQuickVineyardImageUpload = async (
    file: File,
    vineyardId: string
  ) => {
    if (!file) return;

    try {
      setUploading(vineyardId);

      // Upload image to Cloudinary
      const uploadResult = await uploadImageMutation.mutateAsync(file);

      // Update vineyard with new image URL
      const response = await fetch(`/api/admin/vineyards/${vineyardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: uploadResult.imageUrl }),
      });

      if (response.ok) {
        toast.success('Image updated successfully');
        refetchVineyards(); // Refetch the current page
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update vineyard');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      // Error toast is handled by the mutation
    } finally {
      setUploading(null);
    }
  };

  const isError = activeTab === 'vineyards' ? vineyardsError : restaurantsError;
  const error =
    activeTab === 'vineyards' ? vineyardsErrorData : restaurantsErrorData;
  const refetch =
    activeTab === 'vineyards' ? refetchVineyards : refetchRestaurants;

  if (isError) {
    return (
      <SimpleAccessGuard>
        <div className='min-h-screen bg-gradient-to-br from-vineyard-50 via-white to-vineyard-100 pb-20'>
          <div className='container mx-auto px-4 py-8'>
            <Card className='max-w-md mx-auto'>
              <CardHeader>
                <CardTitle className='text-red-600'>Error</CardTitle>
                <CardDescription>
                  {error?.message || `Failed to load ${activeTab}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => refetch()} className='w-full'>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <BottomNavigation />
      </SimpleAccessGuard>
    );
  }

  return (
    <SimpleAccessGuard>
      <div className='min-h-screen bg-gradient-to-br from-vineyard-50 via-white to-vineyard-100 pb-20'>
        <div className='container mx-auto px-4 py-8'>
          {/* Header */}
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-vineyard-800 mb-2'>
              Admin Dashboard
            </h1>
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className='mb-6'
          >
            <TabsList className='grid w-full grid-cols-2 max-w-md'>
              <TabsTrigger
                value='vineyards'
                className='flex items-center gap-2'
              >
                <Wine className='h-4 w-4' />
                Vineyards
              </TabsTrigger>
              <TabsTrigger
                value='restaurants'
                className='flex items-center gap-2'
              >
                <UtensilsCrossed className='h-4 w-4' />
                Restaurants
              </TabsTrigger>
            </TabsList>

            {/* Controls */}
            <Card className='mt-6'>
              <CardContent className='pt-6'>
                <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
                  <div className='relative flex-1 max-w-sm'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                    <Input
                      placeholder={`Search ${activeTab}...`}
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className='pl-10'
                    />
                  </div>
                  <Button
                    onClick={
                      activeTab === 'vineyards'
                        ? handleCreateVineyard
                        : handleCreateRestaurant
                    }
                    className='shrink-0 bg-vineyard-500'
                  >
                    <Plus className='h-4 w-4 mr-2' />
                    Add {activeTab === 'vineyards' ? 'Vineyard' : 'Restaurant'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <TabsContent value='vineyards'>
              {/* Vineyards Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Vineyards</CardTitle>
                  <CardDescription>
                    {vineyardsData
                      ? `${vineyardsData.pagination.totalCount} total vineyards`
                      : 'Loading...'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {vineyardsLoading ? (
                    <div className='flex items-center justify-center py-12'>
                      <Loader2 className='h-8 w-8 animate-spin text-vineyard-600' />
                      <span className='ml-3 text-vineyard-600'>
                        Loading vineyards...
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className='rounded-md border'>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className='w-20'>Image</TableHead>
                              <TableHead className='min-w-[120px]'>
                                Vineyard
                              </TableHead>
                              <TableHead>ID</TableHead>
                              <TableHead>Region</TableHead>
                              <TableHead>Sub Region</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead className='text-center'>
                                Coordinates
                              </TableHead>
                              <TableHead className='text-center'>
                                Rating
                              </TableHead>
                              <TableHead className='text-right'>
                                Price Range
                              </TableHead>
                              <TableHead className='text-center'>
                                Experiences
                              </TableHead>
                              <TableHead className='text-center w-24'>
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {vineyardsData?.vineyards.map((vineyard) => (
                              <TableRow
                                key={vineyard.id}
                                className='hover:bg-gray-50'
                              >
                                <TableCell>
                                  <ImageViewer
                                    imageUrl={vineyard.image_url}
                                    latitude={vineyard.latitude}
                                    longitude={vineyard.longitude}
                                    name={vineyard.vineyard}
                                    type='vineyard'
                                    alt={vineyard.vineyard}
                                    className='object-cover'
                                    showFallbackText={false}
                                    triggerClassName='w-16 h-12 bg-gray-100 rounded overflow-hidden'
                                  />
                                </TableCell>
                                <TableCell>
                                  <div className='font-medium text-sm leading-tight'>
                                    {vineyard.vineyard || 'N/A'}
                                  </div>
                                  {vineyard.maplink && (
                                    <a
                                      href={vineyard.maplink}
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='inline-flex items-center text-xs text-vineyard-600 hover:text-vineyard-700 mt-1'
                                    >
                                      <ExternalLink className='h-3 w-3 mr-1' />
                                      Map
                                    </a>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Badge variant='outline' className='text-xs'>
                                    {vineyard.vineyard_id || 'N/A'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className='text-sm'>
                                    {vineyard.region || 'N/A'}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className='text-sm'>
                                    {vineyard.sub_region || 'N/A'}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant='secondary'
                                    className='text-xs'
                                  >
                                    {vineyard.type || 'N/A'}
                                  </Badge>
                                </TableCell>
                                <TableCell className='text-center'>
                                  {vineyard.latitude && vineyard.longitude ? (
                                    <div className='text-xs'>
                                      <div>{vineyard.latitude}</div>
                                      <div>{vineyard.longitude}</div>
                                    </div>
                                  ) : (
                                    <span className='text-gray-400 text-xs'>
                                      Not set
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className='text-center'>
                                  <div className='flex items-center justify-center text-sm'>
                                    <Star className='h-3 w-3 mr-1 text-yellow-500' />
                                    {vineyard.g}/5
                                  </div>
                                  <div className='text-xs text-gray-500 mt-1'>
                                    {vineyard.g_ratig_user || 'N/A'}
                                  </div>
                                </TableCell>
                                <TableCell className='text-right'>
                                  <div className='text-sm font-medium'>
                                    ${vineyard.lowest_cost_per_adult} - $
                                    {vineyard.highest_cost_per_adult}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className='flex flex-wrap gap-1'>
                                    {vineyard.tasting_only && (
                                      <Badge
                                        variant='outline'
                                        className='text-xs px-1 py-0'
                                      >
                                        Tasting
                                      </Badge>
                                    )}
                                    {vineyard.tour_and_tasting && (
                                      <Badge
                                        variant='outline'
                                        className='text-xs px-1 py-0'
                                      >
                                        Tour
                                      </Badge>
                                    )}
                                    {vineyard.pairing_and_lunch && (
                                      <Badge
                                        variant='outline'
                                        className='text-xs px-1 py-0'
                                      >
                                        Pairing
                                      </Badge>
                                    )}
                                    {vineyard.vine_experience && (
                                      <Badge
                                        variant='outline'
                                        className='text-xs px-1 py-0'
                                      >
                                        Experience
                                      </Badge>
                                    )}
                                    {vineyard.masterclass_workshop && (
                                      <Badge
                                        variant='outline'
                                        className='text-xs px-1 py-0'
                                      >
                                        Workshop
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className='flex gap-1'>
                                    <Button
                                      size='sm'
                                      variant='ghost'
                                      onClick={() =>
                                        handleEditVineyard(vineyard)
                                      }
                                      className='h-8 w-8 p-0'
                                    >
                                      <Edit2 className='h-3 w-3' />
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          size='sm'
                                          variant='ghost'
                                          className='h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50'
                                        >
                                          <Trash2 className='h-3 w-3' />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>
                                            Delete Vineyard
                                          </AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to delete{' '}
                                            {vineyard.vineyard}? This action
                                            cannot be undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>
                                            Cancel
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() =>
                                              handleDeleteVineyard(vineyard)
                                            }
                                            className='bg-red-600 hover:bg-red-700'
                                            disabled={
                                              deleteVineyardMutation.isPending
                                            }
                                          >
                                            {deleteVineyardMutation.isPending ? (
                                              <>
                                                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                                                Deleting...
                                              </>
                                            ) : (
                                              'Delete'
                                            )}
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Pagination */}
                      {vineyardsData && (
                        <Pagination
                          currentPage={vineyardsData.pagination.page}
                          totalPages={vineyardsData.pagination.totalPages}
                          totalCount={vineyardsData.pagination.totalCount}
                          pageSize={vineyardsData.pagination.limit}
                          onPageChange={handlePageChange}
                          onPageSizeChange={handlePageSizeChange}
                          hasNextPage={vineyardsData.pagination.hasNextPage}
                          hasPrevPage={vineyardsData.pagination.hasPrevPage}
                        />
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='restaurants'>
              {/* Restaurants Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Restaurants</CardTitle>
                  <CardDescription>
                    {restaurantsData
                      ? `${restaurantsData.pagination.totalCount} total restaurants`
                      : 'Loading...'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {restaurantsLoading ? (
                    <div className='flex items-center justify-center py-12'>
                      <Loader2 className='h-8 w-8 animate-spin text-vineyard-600' />
                      <span className='ml-3 text-vineyard-600'>
                        Loading restaurants...
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className='rounded-md border'>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className='w-20'>Image</TableHead>
                              <TableHead className='min-w-[120px]'>
                                Restaurant
                              </TableHead>
                              <TableHead>Region</TableHead>
                              <TableHead>Sub Region</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead className='text-center'>
                                Coordinates
                              </TableHead>
                              <TableHead className='text-center'>
                                Rating
                              </TableHead>
                              <TableHead className='text-right'>
                                Avg Cost
                              </TableHead>
                              <TableHead className='text-center'>
                                Open Days
                              </TableHead>
                              <TableHead className='text-center w-24'>
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {restaurantsData?.restaurants.map((restaurant) => (
                              <TableRow
                                key={restaurant.id}
                                className='hover:bg-gray-50'
                              >
                                <TableCell>
                                  <ImageViewer
                                    imageUrl={restaurant.image_url}
                                    latitude={restaurant.latitude}
                                    longitude={restaurant.longitude}
                                    name={restaurant.restaurants}
                                    type='restaurant'
                                    alt={restaurant.restaurants}
                                    className='object-cover'
                                    showFallbackText={false}
                                    triggerClassName='w-16 h-12 bg-gray-100 rounded overflow-hidden'
                                  />
                                </TableCell>
                                <TableCell>
                                  <div className='font-medium text-sm leading-tight'>
                                    {restaurant.restaurants || 'N/A'}
                                  </div>
                                  {restaurant.gkp_link && (
                                    <a
                                      href={restaurant.gkp_link}
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='inline-flex items-center text-xs text-vineyard-600 hover:text-vineyard-700 mt-1'
                                    >
                                      <ExternalLink className='h-3 w-3 mr-1' />
                                      Maps
                                    </a>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className='text-sm'>
                                    {restaurant.region || 'N/A'}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className='text-sm'>
                                    {restaurant.sub_region || 'N/A'}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant='secondary'
                                    className='text-xs'
                                  >
                                    {restaurant.actual_type || 'N/A'}
                                  </Badge>
                                </TableCell>
                                <TableCell className='text-center'>
                                  {restaurant.latitude &&
                                  restaurant.longitude ? (
                                    <div className='text-xs'>
                                      <div>{restaurant.latitude}</div>
                                      <div>{restaurant.longitude}</div>
                                    </div>
                                  ) : (
                                    <span className='text-gray-400 text-xs'>
                                      Not set
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className='text-center'>
                                  <div className='flex items-center justify-center text-sm'>
                                    <Star className='h-3 w-3 mr-1 text-yellow-500' />
                                    {restaurant.g_rating}/5
                                  </div>
                                </TableCell>
                                <TableCell className='text-right'>
                                  <div className='text-sm font-medium'>
                                    €{restaurant.avg_est_lunch_cost}
                                  </div>
                                </TableCell>
                                <TableCell className='text-center'>
                                  <div className='text-xs'>
                                    {restaurant.open_days || 'N/A'}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className='flex gap-1'>
                                    <Button
                                      size='sm'
                                      variant='ghost'
                                      onClick={() =>
                                        handleEditRestaurant(restaurant)
                                      }
                                      className='h-8 w-8 p-0'
                                    >
                                      <Edit2 className='h-3 w-3' />
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          size='sm'
                                          variant='ghost'
                                          className='h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50'
                                        >
                                          <Trash2 className='h-3 w-3' />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>
                                            Delete Restaurant
                                          </AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to delete{' '}
                                            {restaurant.restaurants}? This
                                            action cannot be undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>
                                            Cancel
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() =>
                                              handleDeleteRestaurant(restaurant)
                                            }
                                            className='bg-red-600 hover:bg-red-700'
                                            disabled={
                                              deleteRestaurantMutation.isPending
                                            }
                                          >
                                            {deleteRestaurantMutation.isPending ? (
                                              <>
                                                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                                                Deleting...
                                              </>
                                            ) : (
                                              'Delete'
                                            )}
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Pagination */}
                      {restaurantsData && (
                        <Pagination
                          currentPage={restaurantsData.pagination.page}
                          totalPages={restaurantsData.pagination.totalPages}
                          totalCount={restaurantsData.pagination.totalCount}
                          pageSize={restaurantsData.pagination.limit}
                          onPageChange={handlePageChange}
                          onPageSizeChange={handlePageSizeChange}
                          hasNextPage={restaurantsData.pagination.hasNextPage}
                          hasPrevPage={restaurantsData.pagination.hasPrevPage}
                        />
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <BottomNavigation />
    </SimpleAccessGuard>
  );
}
