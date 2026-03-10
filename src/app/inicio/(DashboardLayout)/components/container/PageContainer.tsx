import { ReactNode } from 'react';

type Props = {
  description?: string;
  children: ReactNode;
  title?: string;
};

export const metadata = {
  title: 'Dashboard',
  description: 'Dashboard description',
};

const PageContainer = ({ children }: Props) => {
  return (
    <main>
      {children}
    </main>
  );
};

export default PageContainer;
