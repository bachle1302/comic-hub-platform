"use client";

import Link from "next/link";
import { ComponentProps, forwardRef } from "react";

type AdminLinkProps = Omit<ComponentProps<typeof Link>, "prefetch">;

export const AdminLink = forwardRef<HTMLAnchorElement, AdminLinkProps>(
  function AdminLink(props, ref) {
    return <Link ref={ref} {...props} prefetch={false} />;
  },
);
