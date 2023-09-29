import { SignUp } from "@clerk/nextjs";
 
import { SignIn } from "@clerk/nextjs";
 
export default function Page() {
  return (
    <>
      <SignUp />
      <span className="thisPageIsClerkSignInOrSignUp" />
    </>
  );
}