import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { FcGoogle }  from "react-icons/fc"
import { FaFacebook } from "react-icons/fa";

export const SignInCard = () => {
   return (
      <Card className="w-full h-full p-8">
         <CardHeader className="px-0 pt-0">
            <CardTitle className="text-2xl font-semibold text-[#0089d0]">
               Login to continue
            </CardTitle>
            <CardDescription>
               Use your email and password to login to your account or use these other methods to login.
            </CardDescription>
         </CardHeader>
         <CardContent className="space-y-5 px-0 pb-0">
            <form className="space-y-2.5">
               <Input disabled={false} value="" onChange={() => {}} placeholder="Email" type="email" required />
               <Input disabled={false} value="" onChange={() => {}} placeholder="Password" type="password" required />
               <Button type="submit" className="w-full rounded-[7px]" size="lg" disabled={false}>
                  Continue
               </Button>
            </form>
            <Separator />
            <div className="flex flex-col gap-y-2.5">
               <Button disabled={false} className="w-full relative" variant="outline" size="lg" onClick={() => {}}
               >
                  <FcGoogle className="size-5 absolute left-2.5 top-3" />
                  Continue with Google
               </Button>
               <Button disabled={false} className="w-full relative" variant="outline" size="lg" onClick={() => {}}
               >
                  <FaFacebook className="size-5 absolute left-2.5 top-3" />
                  Continue with Facebook
               </Button>
            </div>
            <p className="text-xs text-muted-foreground">
               Don&apos;t have an account? <span className="text-orange-400 hover:underline cursor-pointer"
               >Sign Up</span>
            </p>
         </CardContent>
      </Card>
   );
}