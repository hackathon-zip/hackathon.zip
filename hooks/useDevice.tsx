import { useEffect } from "react";
import useDeviceId from "./useDeviceId";

export default function useDevice() {
  const id = useDeviceId();

  useEffect(() => {
    if (!id) return;

    fetch("/api/device", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id })
    });
  }, [id]);
}
