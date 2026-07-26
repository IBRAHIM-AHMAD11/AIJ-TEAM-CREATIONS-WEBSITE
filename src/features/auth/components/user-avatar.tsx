"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "../use-current-user";
import { Loader, LogOut, User, MapPin, Package } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";

export const UserButton = () => {
  const router = useRouter();
  const { signOut } = useAuthActions()
  const { data, isLoading } = useCurrentUser()

  if (isLoading) {
    return <Loader className="size-4 animate-spin text-muted-foreground"   />
  }

  if (!data) {
    return null
  }

  const { image, name } = data
  const avatarFallBackImage = name!.charAt(0).toUpperCase()

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="outline-none relative">
         <Avatar className="size-10 hover:opacity-75 transition">
            <AvatarImage alt={name} src={image} />
            <AvatarFallback>
                {avatarFallBackImage}
            </AvatarFallback>
         </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" side="right" className="w-60">
         <div className="px-3 py-2 border-b border-gray-100">
           <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
           <p className="text-xs text-gray-500 truncate">{data.email}</p>
         </div>
         <DropdownMenuItem onClick={() => router.push("/store/profile")} className="cursor-pointer">
            <User className="size-4 mr-2" />
            My Profile
         </DropdownMenuItem>
         <DropdownMenuItem onClick={() => router.push("/store/orders")} className="cursor-pointer">
            <Package className="size-4 mr-2" />
            Order History
         </DropdownMenuItem>
         <DropdownMenuItem onClick={() => router.push("/store/addresses")} className="cursor-pointer">
            <MapPin className="size-4 mr-2" />
            Addresses
         </DropdownMenuItem>
         <DropdownMenuSeparator />
         <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
            <LogOut className="size-4 mr-2" />
            Log Out
         </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
