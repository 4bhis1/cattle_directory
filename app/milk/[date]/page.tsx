import MilkStatsForm from '../../form/mils_stats_form';

interface MilkDatePageProps {
  params: Promise<{
    date: string;
  }>;
}

export default async function MilkDatePage({ params }: MilkDatePageProps) {
  const { date } = await params;
  
  // Parse date from mm-dd-yyyy format
  const parseDate = (dateStr: string): string => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      // mm-dd-yyyy to yyyy-mm-dd
      return `${parts[2]}-${parts[0]}-${parts[1]}`;
    }
    return dateStr;
  };

  const formattedDate = parseDate(date);

  return <MilkStatsForm initialDate={formattedDate} />;
}

