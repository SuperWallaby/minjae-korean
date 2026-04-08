"use client";

import * as React from "react";

import { Describe } from "./Describe";

type DescribeProps = React.ComponentProps<typeof Describe>;

export function NewsDescribe(
  props: Omit<DescribeProps, "interpretationTrigger">,
) {
  return <Describe interpretationTrigger="icon" {...props} />;
}
