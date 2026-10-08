import React from "react";
import { GlobalDiscussionBox } from "../../components/GlobalDiscussionBox";
import { PageHeader } from "../../components/ui";

export const DiscussionPage = () => (
  <>
    <PageHeader title="Discussion" subtitle="Open to students, teachers and alumni." />
    <GlobalDiscussionBox className="h-[calc(100dvh-14rem)] min-h-[420px] lg:h-[calc(100vh-11rem)]" />
  </>
);
