import { AdminDashboard } from '@/components/admin-dashboard';
import { SimpleAccessGuard } from '@/components/simple-access-guard';

export default function RestaurantsAdminPage() {
  return (
    <SimpleAccessGuard>
      <AdminDashboard />
    </SimpleAccessGuard>
  );
}
