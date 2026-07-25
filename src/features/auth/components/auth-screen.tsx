"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SignInFlow } from "../types";
import { SignInCard } from "./sign-in-card";
import { SignUpCard } from "./sign-up-card";

export const AuthScreen = () => {

   const [state, setState] = useState<SignInFlow>("signIn");

   return (
      <div className="min-h-full flex items-center justify-center bg-[#faca61]">
         <div className="md:h-auto md:w-105">
            <AnimatePresence mode="wait">
               <motion.div
                  key={state}
                  initial={{ opacity: 0, y: 30, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
               >
                  {state === "signIn" ? <SignInCard setState={setState} /> : <SignUpCard setState={setState} />}
               </motion.div>
            </AnimatePresence>
         </div>
      </div>
   );
};

 