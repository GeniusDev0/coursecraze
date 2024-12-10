import Link from 'next/link';

import { Button } from '@/components/ui/button';

const CreateArticleButton = () => {
  return (
    <Link href="/teacher/resources/create">
      <Button variant="secondary">Create Article</Button>
    </Link>
  );
};

export default CreateArticleButton;
