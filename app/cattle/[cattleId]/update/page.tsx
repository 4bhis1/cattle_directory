import CattleForm from '../../../form/cattle_form';

interface UpdateCattlePageProps {
  params: Promise<{
    cattleId: string;
  }>;
}

export default async function UpdateCattlePage({ params }: UpdateCattlePageProps) {
  const { cattleId } = await params;
  
  // TODO: Fetch cattle data by ID and pass to form
  // For now, using the same form component
  return <CattleForm cattleId={cattleId} />;
}

