import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import Google from "@auth/core/providers/google";
import { DataModel } from "./_generated/dataModel";
import { ResendOTPPasswordReset, ResendOTPEmailVerification } from "./ResendOTP";

const customPassword = Password<DataModel>({
  profile(params, ctx) {
    return {
      email: params.email as string,
      name: params.name as string,
      image: (params.image as string) || undefined,
      role: "customer",
    };
  },
  reset: ResendOTPPasswordReset,
  verify: ResendOTPEmailVerification,
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [customPassword, Google({
    profile(profile) {
      return {
        id: profile.sub,
        email: profile.email,
        name: profile.name,
        image: profile.picture,
      };
    }
  })],
});
