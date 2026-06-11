"use client";

import { CrewPhoneFrame } from "@/components/crew-app/CrewPhoneFrame";
import { useClientReady } from "@/lib/hooks/use-client-ready";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

type CrewAppChromeProps = {
  children: ReactNode;
};

export function CrewAppChrome({ children }: CrewAppChromeProps) {
  const searchParams = useSearchParams();
  const clientReady = useClientReady();
  const [phoneFrame, setPhoneFrame] = useState(false);

  useEffect(() => {
    setPhoneFrame(searchParams.get("phoneFrame") === "1");
  }, [searchParams]);

  if (clientReady && phoneFrame) {
    return <CrewPhoneFrame fillHeight>{children}</CrewPhoneFrame>;
  }

  return children;
}
