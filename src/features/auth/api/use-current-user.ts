import { useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"

export const useCurrentUser = () => {
   const data = useQuery(api.users.getCurrentUser)
   const isLoading = data === undefined;

   return { data, isLoading }
}