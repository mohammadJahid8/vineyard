import VineyardEditForm from '@/components/vineyard-edit-form';
import { SimpleAccessGuard } from '@/components/simple-access-guard';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditVineyardPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <SimpleAccessGuard>
      <VineyardEditForm vineyardId={id} />
    </SimpleAccessGuard>
  );
}
