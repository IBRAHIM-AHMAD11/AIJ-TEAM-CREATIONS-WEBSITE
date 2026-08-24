import { redirect } from "next/navigation";

export default function NotFound() {
  // Anytime a user hits a route that doesn't exist, 
  // immediately bounce them to the store.
  redirect("/store");
}