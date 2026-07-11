import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/password";
import Google from "@auth/core/providers/google";
import { DataModel } from "./_generated/dataModel";

const customPassword = Password<DataModel>({
  profile(params, ctx) {
    return {
      email: params.email as string,
      name: params.name as string,
      image: (params.image as string) || undefined,
    };
  },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [customPassword, Password, Google],
});
