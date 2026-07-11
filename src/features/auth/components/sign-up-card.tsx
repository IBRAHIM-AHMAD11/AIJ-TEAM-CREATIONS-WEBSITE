import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { SignInFlow } from "../types";
import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { TriangleAlert } from "lucide-react";
import passwordValidator from "../password_validator";

interface SignUpCardProps {
   setState: (state: SignInFlow) => void;
}

export const SignUpCard = ({ setState }: SignUpCardProps) => {
   const { signIn } = useAuthActions();
   const [error, setError] = useState("");
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");
   const [pending, setPending] = useState(false);
   const [name, setName] = useState("");

   // Calculate password metrics in real-time as the user types
   const { success: isPasswordSecure, securityLevel } = passwordValidator(password);

   // Helper to pick the bar color based on the 1-10 security level
   const getBarColor = (level: number) => {
      if (level <= 3) return 'bg-red-500';     // Weak
      if (level <= 5) return 'bg-orange-400';  // Medium
      if (level <= 8) return 'bg-yellow-500';  // Good
      return 'bg-green-500';                   // Excellent
   };

   const onPasswordSignUp = (e: React.FormEvent<HTMLFormElement>) => {
   e.preventDefault();
   setError(""); // Clear any previous errors

   if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
   }
   
   const passwordValidation = passwordValidator(password);
   if (!passwordValidation.success) {
      setError(passwordValidation.errorMessage || "Password validation failed");
      return;
   }

   setPending(true);
   signIn("password", { name, email, password, flow: "signUp" })
      .catch((err: unknown) => {
         // 1. Cast or verify the error is an Error object
         if (err instanceof Error) {
            // 2. Check if the error message contains the "already exists" string
            if (err.message.includes("already exists")) {
               setError("An account with this email already exists.");
            } else {
               // Fallback for other server errors
               setError("Something went wrong. Please try again.");
            }
         } else {
            // Fallback for mysterious errors
            setError("An unexpected error occurred.");
         }
      })
      .finally(() => {
         setPending(false);
      });
   };

   const handleProviderSignUp = (value: "facebook" | "google") => {
      setPending(true);
      signIn(value)
         .finally(() => setPending(false));
   };

   return (
      <Card className="w-full h-full p-8">
         <CardHeader className="px-0 pt-0">
            <CardTitle className="text-2xl font-semibold text-black">
               Sign Up to continue
            </CardTitle>
            <CardDescription>
               Use your email and password to create an account or use these other methods.
            </CardDescription>
         </CardHeader>
         
         {!!error && (
            <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6">
               <TriangleAlert className="size-4" />
               <p>{error}</p>
            </div>
         )}
         
         <CardContent className="space-y-5 px-0 pb-0">
            <form onSubmit={onPasswordSignUp} className="space-y-2.5">
               <Input disabled={pending} value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" required />
               <Input disabled={pending} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required />
               <Input disabled={pending} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" required />
               <Input disabled={pending} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" type="password" required />
               
               <Button type="submit" className="w-full rounded-[7px]" size="lg" disabled={pending}>
                  Continue
               </Button>

               {/* Strength Bar Component - Placed right underneath the Continue button */}
               {password.length > 0 && (
                  <div className="space-y-1.5 pt-1.5">
                     {/* The Track */}
                     <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        {/* The Dynamic Strength Bar */}
                        <div
                           className={`h-full transition-all duration-300 ease-out ${getBarColor(securityLevel)}`}
                           style={{ width: `${securityLevel * 10}%` }}
                        />
                     </div>
                     <div className="flex justify-between text-[11px] text-muted-foreground font-medium px-0.5">
                        <span>Password Strength</span>
                        <span>Level {securityLevel} / 10</span>
                     </div>
                  </div>
               )}
            </form>
            
            <Separator />
            
            <div className="flex flex-col gap-y-2.5">
               <Button disabled={pending} className="w-full relative" variant="outline" size="lg" onClick={() => {handleProviderSignUp("google")}}>
                  <FcGoogle className="size-5 absolute left-2.5 top-3" />
                  Continue with Google
               </Button>
               <Button disabled={pending} className="w-full relative" variant="outline" size="lg" onClick={() => {}}>
                  <FaFacebook className="size-5 absolute left-2.5 top-3" />
                  Continue with Facebook
               </Button>
            </div>
            
            <p className="text-sm text-center text-muted-foreground">
               Already have an account? <span onClick={() => setState("signIn")} className="text-orange-400 hover:underline cursor-pointer">Sign In</span>
            </p>
         </CardContent>
      </Card>
   );
};