import { useEffect, useState } from 'react';

export default function useDeviceId() {
    const [deviceId, setDeviceId] = useState<string | null>(null);

    useEffect(() => {
        const currentId = localStorage.getItem('ht-client-deviceid');
        const set = (id: string) => localStorage.setItem('ht-client-deviceid', id);

        if (currentId) return setDeviceId(currentId);

        const newId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        set(newId);

        return setDeviceId(newId);
    }, []);

    return deviceId;
}