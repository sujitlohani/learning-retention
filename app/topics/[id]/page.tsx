import { TopicPage } from '@/src/features/topics/components/TopicPage';

export default async function TopicPageRoute({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    return <TopicPage topicId={resolvedParams.id} />;
}
