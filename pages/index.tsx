import { getAuth } from "@clerk/nextjs/server";
import Home from "./home";

export default Home;

export const getServerSideProps = async (context: any) => {
  const { userId } = getAuth(context.req);

  return {
    props: {},
    redirect: userId
      ? {
          destination: "/dashboard",
          permanent: false
        }
      : undefined
  };
};
