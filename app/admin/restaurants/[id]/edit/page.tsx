import { RestaurantEditForm } from '@/components/restaurant-edit-form';
import { SimpleAccessGuard } from '@/components/simple-access-guard';

interface RestaurantEditPageProps {
  params: {
    id: string;
  };
}

export default async function RestaurantEditPage({
  params,
}: RestaurantEditPageProps) {
  const { id } = await params;
  return (
    <SimpleAccessGuard>
      <RestaurantEditForm restaurantId={id} />
    </SimpleAccessGuard>
  );
}
