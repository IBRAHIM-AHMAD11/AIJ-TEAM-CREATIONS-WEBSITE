import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Separator } from "@/components/ui/separator";
import { FcGoogle }  from "react-icons/fc"
import { FaFacebook } from "react-icons/fa";
import { SignInFlow } from "../types";
import { useRef, useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { TriangleAlert, ArrowLeft } from "lucide-react";

interface SignInCardProps {
   setState: (state: SignInFlow) => void;
}

type Step = "signIn" | { email: string };

export const SignInCard = ({ setState }: SignInCardProps) => {

   const { signIn } = useAuthActions();
   const [step, setStep] = useState<Step>("signIn");
   const [email, setEmail] = useState("");
   const [error, setError] = useState("");
   const [password, setPassword] = useState("");
   const [code, setCode] = useState("");
   const [pending, setPending] = useState(false);
   const verifyFormRef = useRef<HTMLFormElement>(null);

   const onPasswordSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setPending(true);
      setError("");
      try {
         await signIn("password", { email, password, flow: "signIn"});
         setStep({ email });
      } catch {
         setError("Invalid email or password");
      } finally {
         setPending(false);
      }
   }

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
   }

   const handleProviderSignIn = (value: "facebook" | "google") => {
      setPending(true);
      signIn(value)
         .finally(() => setPending(false));
   }

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
                        <Button variant="ghost" size="sm" onClick={() => { setCode(""); setStep("signIn"); }} className="text-xs">
                           <ArrowLeft className="size-3 mr-1" /> Back to sign in
                        </Button>
                     </motion.div>
                  </CardContent>
               </motion.div>
            ) : (
               <motion.div
                  key="signIn"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
               >
                  <CardHeader className="px-0 pt-0">
                     <CardTitle className="text-2xl font-semibold">
                        Login to continue
                     </CardTitle>
                     <CardDescription>
                        Use your email and password to login to your account or use these other methods to login.
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
                     <form onSubmit={onPasswordSignIn} className="space-y-2.5">
                        <Input disabled={pending} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required />
                        <Input disabled={pending} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" required />
                        <Button type="submit" className="w-full rounded-[7px]" size="lg" disabled={pending}>
                           {pending ? "Signing in..." : "Continue"}
                        </Button>
                     </form>
                     <Separator />
                     <div className="flex flex-col gap-y-2.5">
                        <Button disabled={pending} className="w-full relative bg-background hover:bg-muted" variant="outline" size="lg" onClick={() => {handleProviderSignIn("google")}}
                        >
                           <FcGoogle className="size-5 absolute left-2.5 top-3" />
                           Continue with Google
                        </Button>
                        <Button disabled={pending} className="w-full relative bg-background hover:bg-muted" variant="outline" size="lg" onClick={() => {handleProviderSignIn("facebook")}}
                        >
                           <FaFacebook className="size-5 absolute left-2.5 top-3" />
                           Continue with Facebook
                        </Button>
                     </div>
                     <p className="text-sm text-center text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <span onClick={() => setState("signUp")} className="text-yellow-600 hover:underline cursor-pointer"
                        >Sign Up</span>
                     </p>
                  </CardContent>
               </motion.div>
            )}
         </AnimatePresence>
      </Card>
   );
}