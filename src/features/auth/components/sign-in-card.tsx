import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { FcGoogle }  from "react-icons/fc"
import { FaFacebook } from "react-icons/fa";
import { SignInFlow } from "../types";
import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { TriangleAlert } from "lucide-react";

interface SignInCardProps {
   setState: (state: SignInFlow) => void;
}

export const SignInCard = ({ setState }: SignInCardProps) => {

   const { signIn } = useAuthActions();
   const [email, setEmail] = useState("");
   const [error, setError] = useState("");
   const [password, setPassword] = useState("");
   const [pending, setPending] = useState(false);
   const onPasswordSignIn = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setPending(true);
      signIn("password", { email, password, flow: "signIn"})
         .catch(() => {
            setError("Invalid email or password");
         })
         .finally(() => {
            setPending(false);
         })
   }

   const handleProviderSignIn = (value: "facebook" | "google") => {
      setPending(true);
      signIn(value)
         .finally(() => setPending(false));
   }

   return (
      <Card className="w-full h-full p-8">
         <CardHeader className="px-0 pt-0">
            {/* text-[#0089d0] */}
            <CardTitle className="text-2xl font-semibold text-black">
               Login to continue
            </CardTitle>
            <CardDescription>
               Use your email and password to login to your account or use these other methods to login.
            </CardDescription>
         </CardHeader>
         {!!error && (
            <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6">
               <TriangleAlert className="size-4" />
               <p>{error}</p>
            </div>
         )}
         <CardContent className="space-y-5 px-0 pb-0">
            <form onSubmit={onPasswordSignIn} className="space-y-2.5">
               <Input disabled={pending} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required />
               <Input disabled={pending} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" required />
               <Button type="submit" className="w-full rounded-[7px]" size="lg" disabled={pending}>
                  Continue
               </Button>
            </form>
            <Separator />
            <div className="flex flex-col gap-y-2.5">
               <Button disabled={pending} className="w-full relative" variant="outline" size="lg" onClick={() => {handleProviderSignIn("google")}}
               >
                  <FcGoogle className="size-5 absolute left-2.5 top-3" />
                  Continue with Google
               </Button>
               <Button disabled={pending} className="w-full relative" variant="outline" size="lg" onClick={() => {handleProviderSignIn("facebook")}}
               >
                  <FaFacebook className="size-5 absolute left-2.5 top-3" />
                  Continue with Facebook
               </Button>
            </div>
            <p className="text-sm text-center text-muted-foreground">
               Don&apos;t have an account? <span onClick={() => setState("signUp")} className="text-orange-400 hover:underline cursor-pointer"
               >Sign Up</span>
            </p>
         </CardContent>
      </Card>
   );
}