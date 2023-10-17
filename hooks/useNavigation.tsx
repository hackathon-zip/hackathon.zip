import { delay, StateTuple } from "@/lib/utils";
import { createContext, useContext, useEffect, useState } from "react";
import useDeviceId from "./useDeviceId";

type View = JSX.Element | React.ReactNode | string | any;

type NavigationStore = {
  viewStack: View[];
};

type NavigationConfiguration = {
  defaultView: View;
  layout: JSX.Element | any;
};

const NavigationContext = createContext<StateTuple<NavigationStore>>([
  {
    viewStack: []
  },
  () => null
]);

function LoadingView({ layout: Layout }: { layout: JSX.Element | any }) {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center w-full h-full gap-8">
        <img
          src="/wordmark-light.svg"
          alt="Hackathon.zip"
          width="350"
          height="40"
        />
      </div>
    </Layout>
  );
}

export function NavigationProvider({
  defaultView,
  layout: Layout
}: NavigationConfiguration) {
  const [loading, setLoading] = useState(true);

  const [state, setState] = useState<NavigationStore>({
    viewStack: [defaultView]
  });

  const deviceId = useDeviceId();

  useEffect(() => {
    if (!deviceId) return;
    (async () => {
      await delay(1000);

      setLoading(false);
    })();
  }, [deviceId]);

  return (
    <NavigationContext.Provider value={[state, setState]}>
      <Layout basic={loading}>
        {loading && (
          <>
            <div className="flex flex-col items-center justify-center w-full h-full gap-8">
              <img
                src="/wordmark-light.svg"
                alt="Hackathon.zip"
                width="350"
                height="40"
              />
            </div>
            <div
              style={{
                display: "none"
              }}
            >
              {state.viewStack[state.viewStack.length - 1]}
            </div>
          </>
        )}

        {!loading && state.viewStack[state.viewStack.length - 1]}
      </Layout>
    </NavigationContext.Provider>
  );
}

export default function useNavigation() {
  const [{ viewStack }, setState] = useContext(NavigationContext);

  const push = (view: JSX.Element) => {
    window.blur();
    setState((old: NavigationStore) => {
      return {
        ...old,
        viewStack: [...old.viewStack, view]
      };
    });
  };

  const pop = () => {
    setState((old: NavigationStore) => {
      return {
        ...old,
        viewStack: old.viewStack.slice(0, old.viewStack.length - 1)
      };
    });
  };

  return { currentView: viewStack[viewStack.length - 1], push, pop };
}
