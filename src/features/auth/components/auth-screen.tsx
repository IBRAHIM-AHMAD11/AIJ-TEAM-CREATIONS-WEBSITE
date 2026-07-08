"use client";

import { useState } from "react";
import { SignInFlow } from "../types";
import { SignInCard } from "./sign-in-card";
import { SignUpCard } from "./sign-up-card";

export const AuthScreen = () => {

   const [state, setState] = useState<SignInFlow>("signIn");

   return (
      <div className="min-h-full flex items-center justify-center bg-[#faca61]">
         <div className="md:h-auto md:w-105">
            {state === "signIn" ? <SignInCard /> : <SignUpCard />}
         </div>
      </div>
   );
};

 