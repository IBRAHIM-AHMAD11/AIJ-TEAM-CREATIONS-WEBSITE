import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { SignInFlow } from "../types";
import { useRef, useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Camera, TriangleAlert, ArrowLeft } from "lucide-react";
import passwordValidator from "../password_validator";

interface SignUpCardProps {
   setState: (state: SignInFlow) => void;
}

type Step = "signUp" | { email: string };

export const SignUpCard = ({ setState }: SignUpCardProps) => {
   const { signIn } = useAuthActions();
   const [step, setStep] = useState<Step>("signUp");
   const [error, setError] = useState("");
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");
   const [code, setCode] = useState("");
   const [pending, setPending] = useState(false);
   const [name, setName] = useState("");
   const [image, setImage] = useState<string | undefined>(undefined);
   const [imagePreview, setImagePreview] = useState<string | null>(null);
   const fileInputRef = useRef<HTMLInputElement>(null);

   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
         // Create local URL for immediate DOM UI rendering preview
         setImagePreview(URL.createObjectURL(file));

         // Convert file to a string payload for database insertion
         const reader = new FileReader();
         reader.onloadend = () => {
            setImage(reader.result as string);
         };
         reader.readAsDataURL(file);
      }
   };

   // Calculate password metrics in real-time as the user types
   const { success: isPasswordSecure, securityLevel } = passwordValidator(password);

   // Helper to pick the bar color based on the 1-10 security level
   const getBarColor = (level: number) => {
      if (level <= 3) return 'bg-red-500';     // Weak
      if (level <= 5) return 'bg-orange-400';  // Medium
      if (level <= 8) return 'bg-yellow-500';  // Good
      return 'bg-green-500';                   // Excellent
   };

   const onPasswordSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError("");

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
      try {
         await signIn("password", { name, email, password, flow: "signUp", ...(image ? { image } : {}) });
         setStep({ email });
      } catch (err: unknown) {
         if (err instanceof Error) {
            if (err.message.includes("already exists")) {
               setError("An account with this email already exists.");
            } else {
               setError("Something went wrong. Please try again.");
            }
         } else {
            setError("An unexpected error occurred.");
         }
      } finally {
         setPending(false);
      }
   };

   const onVerify = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setPending(true);
      setError("");
      try {
         await signIn("password", { email: (step as { email: string }).email, code, flow: "email-verification" });
      } catch {
         setError("Invalid code. Please try again.");
      } finally {
         setPending(false);
      }
   };

   const handleProviderSignUp = (value: "facebook" | "google") => {
      setPending(true);
      signIn(value)
         .finally(() => setPending(false));
   };

   if (typeof step === "object") {
      return (
         <Card className="w-full h-full p-8">
            <CardHeader className="px-0 pt-0">
               <CardTitle className="text-2xl font-semibold text-black">
                  Check your email
               </CardTitle>
               <CardDescription>
                  Enter the 8-digit code sent to {(step as { email: string }).email}
               </CardDescription>
            </CardHeader>
            {!!error && (
               <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6">
                  <TriangleAlert className="size-4" />
                  <p>{error}</p>
               </div>
            )}
            <CardContent className="space-y-5 px-0 pb-0">
               <form onSubmit={onVerify} className="space-y-2.5">
                  <Input disabled={pending} value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter 8-digit code" required />
                  <Button type="submit" className="w-full rounded-[7px]" size="lg" disabled={pending}>
                     Verify Email
                  </Button>
               </form>
               <Button variant="ghost" size="sm" onClick={() => setStep("signUp")} className="text-xs">
                  <ArrowLeft className="size-3 mr-1" /> Back to sign up
               </Button>
            </CardContent>
         </Card>
      );
   }

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

               {/* --- START IMAGE SELECTOR CIRCLE --- */}
               <div className="flex flex-col items-center justify-center pb-4">
                  <input 
                     type="file" 
                     accept="image/*" 
                     className="hidden" 
                     ref={fileInputRef} 
                     onChange={handleImageChange}
                     disabled={pending}
                  />
                  <div 
                     onClick={() => fileInputRef.current?.click()}
                     className="group relative size-24 rounded-full border border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition hover:border-orange-400 hover:bg-gray-100"
                  >
                     {imagePreview ? (
                        <img 
                           src={imagePreview} 
                           alt="Profile preview" 
                           className="size-full object-cover"
                        />
                     ) : (
                        <div className="flex flex-col items-center text-muted-foreground group-hover:text-orange-400">
                           <Camera className="size-5 mb-1" />
                           <span className="text-[10px] font-medium">Avatar</span>
                        </div>
                     )}
                     
                     {/* Overlay effect on hover when image is present */}
                     {imagePreview && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                           <Camera className="size-5 text-white" />
                        </div>
                     )}
                  </div>
               </div>
               {/* --- END IMAGE SELECTOR CIRCLE --- */}

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
                <Button disabled={pending} className="w-full relative" variant="outline" size="lg" onClick={() => {handleProviderSignUp("facebook")}}>
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