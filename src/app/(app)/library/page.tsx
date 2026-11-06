import { PageHeader } from '@/components/page-header';
import { LibraryClient } from './library-client';

export default function LibraryPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        titleKey="library.title"
        descriptionKey="library.description"
      />
      <LibraryClient />
    </div>
  );
}
