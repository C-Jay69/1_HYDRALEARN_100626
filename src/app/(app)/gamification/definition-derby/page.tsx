import type { Metadata } from 'next';
import { PageHeader } from '@/components/page-header';
import { DefinitionDerbyGame } from './definition-derby-game';

export const metadata: Metadata = {
  title: 'Definition Derby | HydraLearn',
  description:
    'A classroom gameshow based on Balderdash: teams write fake definitions, the host reads them aloud, and everyone votes for the real answer.',
};

export default function DefinitionDerbyPage() {
  return (
    <div>
      <PageHeader
        title="Definition Derby"
        description="A classroom gameshow based on Balderdash. Teams bluff, vote, and score their way through definitions."
      />
      <DefinitionDerbyGame />
    </div>
  );
}
