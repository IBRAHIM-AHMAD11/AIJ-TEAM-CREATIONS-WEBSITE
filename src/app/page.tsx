"use client"

import { Button } from "@/components/ui/button";
import { useAuthActions } from "@convex-dev/auth/react";

const Home = () => {
   const { signOut } = useAuthActions();

  return (
    <div>
      Logged In!
      <Button variant="outline" onClick={() => signOut()}>Sign Out</Button>
    </div>
  )
}

export default Home