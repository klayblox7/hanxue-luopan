import type { ReactNode } from "react";

type DetailPageContainerProps = {
  children: ReactNode;
  className?: string;
  id?: string;
};

export function DetailPageContainer({ children, className = "", id }: DetailPageContainerProps) {
  return (
    <section className={`detail-page-container ${className}`.trim()} id={id}>
      {children}
    </section>
  );
}
