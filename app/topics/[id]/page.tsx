import { TopicPage } from '@/src/features/topics/components/TopicPage';

type Props = {
    params: Promise<{ id: string }>
};

export default async function TopicRoute({ params }: Props) {
    const resolvedParams = await params;
    return <TopicPage topicId={resolvedParams.id} />;
}
