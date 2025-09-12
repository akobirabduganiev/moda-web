"use client";

import React from "react";
import ErrorNotice, { type ErrorNoticeProps } from "@/components/ErrorNotice";

export default function ErrorBanner(props: ErrorNoticeProps) {
  return <ErrorNotice {...props} />;
}
