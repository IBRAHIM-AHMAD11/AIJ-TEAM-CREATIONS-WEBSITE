import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Separator } from "@/components/ui/separator";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { SignInFlow } from "../types";
import { useRef, useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { motion, AnimatePresence } from "framer-motion";
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
   const verifyFormRef = useRef<HTMLFormElement>(null);

   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
         setImagePreview(URL.createObjectURL(file));
         const reader = new FileReader();
         reader.onloadend = () => {
            setImage(reader.result as string);
         };
         reader.readAsDataURL(file);
      }
   };

   const { success: isPasswordSecure, securityLevel } = passwordValidator(password);

   const getBarColor = (level: number) => {
      if (level <= 3) return 'bg-red-500';
      if (level <= 5) return 'bg-orange-400';
      if (level <= 8) return 'bg-yellow-500';
      return 'bg-green-500';
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
         await signIn("password", { name, email, password, flow: "signUp", redirectTo: "/store", ...(image ? { image } : {}) });
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
      if (code.length !== 8) return;
      setPending(true);
      setError("");
      try {
         await signIn("password", { email: (step as { email: string }).email, code, flow: "email-verification" });
      } catch {
         setError("Invalid code. Please try again.");
         setCode("");
      } finally {
         setPending(false);
      }
   };

   const handleProviderSignUp = (value: "facebook" | "google") => {
      setPending(true);
      signIn(value, {redirectTo: "/store"})
         .finally(() => setPending(false));
   };

   return (
      <Card className="w-full h-full p-8 shadow-lg border-border/50">
         <AnimatePresence mode="wait">
            {typeof step === "object" ? (
               <motion.div
                  key="verify"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
               >
                  <CardHeader className="px-0 pt-0">
                     <CardTitle className="text-2xl font-semibold">
                        Check your email
                     </CardTitle>
                     <CardDescription>
                        Enter the 8-digit code sent to{" "}
                        <span className="font-medium text-foreground">
                           {(step as { email: string }).email}
                        </span>
                     </CardDescription>
                  </CardHeader>

                  <div className="flex items-start gap-2 mb-5 text-xs text-red-500 bg-red-500/10 px-3 py-2 rounded-md">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5 mt-0.5 shrink-0"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                     <span>The email might be sent to your spam folder. Check there if you don&apos;t see it.</span>
                  </div>

                  <AnimatePresence>
                     {!!error && (
                        <motion.div
                           initial={{ opacity: 0, height: 0 }}
                           animate={{ opacity: 1, height: "auto" }}
                           exit={{ opacity: 0, height: 0 }}
                           className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-5 overflow-hidden"
                        >
                           <TriangleAlert className="size-4 shrink-0" />
                           <p>{error}</p>
                        </motion.div>
                     )}
                  </AnimatePresence>

                  <CardContent className="space-y-5 px-0 pb-0">
                     <form ref={verifyFormRef} onSubmit={onVerify} className="space-y-5">
                        <div className="flex justify-center">
                           <InputOTP
                              maxLength={8}
                              inputMode="numeric"
                              value={code}
                              onChange={(val) => setCode(val)}
                              onComplete={() => verifyFormRef.current?.requestSubmit()}
                              disabled={pending}
                           >
                              <InputOTPGroup className="gap-2 bg-transparent">
                                 <InputOTPSlot index={0} className="rounded-md border first:rounded-md last:rounded-md size-11 text-lg font-semibold data-[active=true]:border-orange-400 data-[active=true]:ring-orange-400/30" />
                                 <InputOTPSlot index={1} className="rounded-md border first:rounded-md last:rounded-md size-11 text-lg font-semibold data-[active=true]:border-orange-400 data-[active=true]:ring-orange-400/30" />
                                 <InputOTPSlot index={2} className="rounded-md border first:rounded-md last:rounded-md size-11 text-lg font-semibold data-[active=true]:border-orange-400 data-[active=true]:ring-orange-400/30" />
                                 <InputOTPSlot index={3} className="rounded-md border first:rounded-md last:rounded-md size-11 text-lg font-semibold data-[active=true]:border-orange-400 data-[active=true]:ring-orange-400/30" />
                              </InputOTPGroup>
                              <InputOTPGroup className="gap-2 bg-transparent">
                                 <InputOTPSlot index={4} className="rounded-md border first:rounded-md last:rounded-md size-11 text-lg font-semibold data-[active=true]:border-orange-400 data-[active=true]:ring-orange-400/30" />
                                 <InputOTPSlot index={5} className="rounded-md border first:rounded-md last:rounded-md size-11 text-lg font-semibold data-[active=true]:border-orange-400 data-[active=true]:ring-orange-400/30" />
                                 <InputOTPSlot index={6} className="rounded-md border first:rounded-md last:rounded-md size-11 text-lg font-semibold data-[active=true]:border-orange-400 data-[active=true]:ring-orange-400/30" />
                                 <InputOTPSlot index={7} className="rounded-md border first:rounded-md last:rounded-md size-11 text-lg font-semibold data-[active=true]:border-orange-400 data-[active=true]:ring-orange-400/30" />
                              </InputOTPGroup>
                           </InputOTP>
                        </div>
                        <Button type="submit" className="w-full rounded-[7px]" size="lg" disabled={pending || code.length !== 8}>
                           {pending ? "Verifying..." : "Verify Email"}
                        </Button>
                     </form>
                     <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15 }}
                     >
                        <Button variant="ghost" size="sm" onClick={() => { setCode(""); setStep("signUp"); }} className="text-xs">
                           <ArrowLeft className="size-3 mr-1" /> Back to sign up
                        </Button>
                     </motion.div>
                  </CardContent>
               </motion.div>
            ) : (
               <motion.div
                  key="signUp"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
               >
                  <CardHeader className="px-0 pt-0">
                     <CardTitle className="text-2xl font-semibold">
                        Sign Up to continue
                     </CardTitle>
                     <CardDescription>
                        Use your email and password to create an account or use these other methods.
                     </CardDescription>
                  </CardHeader>
                  
                  <AnimatePresence>
                     {!!error && (
                        <motion.div
                           initial={{ opacity: 0, height: 0 }}
                           animate={{ opacity: 1, height: "auto" }}
                           exit={{ opacity: 0, height: 0 }}
                           className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-5 overflow-hidden"
                        >
                           <TriangleAlert className="size-4 shrink-0" />
                           <p>{error}</p>
                        </motion.div>
                     )}
                  </AnimatePresence>
                  
                  <CardContent className="space-y-5 px-0 pb-0">
                     <form onSubmit={onPasswordSignUp} className="space-y-2.5">
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
                              className="group relative size-24 rounded-full border border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition hover:border-yellow-400 hover:bg-gray-100"
                           >
                              {imagePreview ? (
                                 <img 
                                    src={imagePreview} 
                                    alt="Profile preview" 
                                    className="size-full object-cover"
                                 />
                              ) : (
                                 <div className="flex flex-col items-center text-muted-foreground group-hover:text-yellow-400">
                                    <Camera className="size-5 mb-1" />
                                    <span className="text-[10px] font-medium">Avatar</span>
                                 </div>
                              )}
                              
                              {imagePreview && (
                                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                                    <Camera className="size-5 text-white" />
                                 </div>
                              )}
                           </div>
                        </div>

                        <Input disabled={pending} value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" required />
                        <Input disabled={pending} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required />
                        <Input disabled={pending} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" required />
                        <Input disabled={pending} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" type="password" required />
                        
                        <Button type="submit" className="w-full rounded-[7px]" size="lg" disabled={pending}>
                           {pending ? "Creating account..." : "Continue"}
                        </Button>

                        {password.length > 0 && (
                           <div className="space-y-1.5 pt-1.5">
                              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
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
                        <Button disabled={pending} className="w-full relative bg-background hover:bg-muted" variant="outline" size="lg" onClick={() => {handleProviderSignUp("google")}}>
                           <FcGoogle className="size-5 absolute left-2.5 top-3" />
                           Continue with Google
                        </Button>
                         <Button disabled={pending} className="w-full relative bg-background hover:bg-muted" variant="outline" size="lg" onClick={() => {handleProviderSignUp("facebook")}}>
                            <FaFacebook className="size-5 absolute left-2.5 top-3" />
                            Continue with Facebook
                         </Button>
                     </div>
                     
                     <p className="text-sm text-center text-muted-foreground">
                        Already have an account?{" "}
                        <span onClick={() => setState("signIn")} className="text-yellow-600 hover:underline cursor-pointer">Sign In</span>
                     </p>
                  </CardContent>
               </motion.div>
            )}
         </AnimatePresence>
      </Card>
   );
};