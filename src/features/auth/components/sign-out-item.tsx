"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { signOutAction } from "../actions";

export function SignOutItem() {
  const router = useRouter();

  async function handleSignOut() {
    await signOutAction();
    router.push("/login");
    router.refresh();
  }

  return (
    <DropdownMenuItem onSelect={(e) => {
      e.preventDefault();
      void handleSignOut();
    }}>
      <LogOut /> Sair
    </DropdownMenuItem>
  );
}
