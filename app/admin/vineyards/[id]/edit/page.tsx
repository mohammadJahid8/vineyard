import VineyardEditForm from '@/components/vineyard-edit-form';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditVineyardPage({ params }: PageProps) {
  const { id } = await params;
  return <VineyardEditForm vineyardId={id} />;
}
