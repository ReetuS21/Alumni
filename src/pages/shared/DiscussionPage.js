import React from "react";
import { GlobalDiscussionBox } from "../../components/GlobalDiscussionBox";
import { PageHeader } from "../../components/ui";

export const DiscussionPage = () => (
  <>
    <PageHeader
      title="Global Discussion"
      subtitle="Ask a question, answer one, or share an update. Every message shows whether it came from a student, teacher or alumnus."
    />
    <GlobalDiscussionBox className="h-[calc(100vh-14rem)] min-h-[480px]" />
  </>
);
