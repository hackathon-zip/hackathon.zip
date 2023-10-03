import { Button, Card, Display, Input, Text } from "@geist-ui/core"
import { Icon } from "@geist-ui/react-icons"
import { Hackathon } from "@prisma/client";
import { useRouter } from "next/router";
import { useState } from "react";

type FeatureKey = 'registerEnabled' | 'checkInEnabled' | 'broadcastEnabled' | 'scheduleEnabled' | 'shipEnabled' | 'integrateEnabled' | 'financeEnabled';

export default function FeatureInfo ({ beforeSubmit, featureKey, featureName, featureDescription, featureIcon: Icon, children, hackathonSlug }: { beforeSubmit?: () => Partial<Hackathon> | Promise<Partial<Hackathon>> | false, featureKey: FeatureKey, featureName: string, featureDescription: string | JSX.Element, featureIcon: Icon, children?: JSX.Element, hackathonSlug: string }) {
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const enableFeature = async () => {
        setLoading(true);

        const additionalOptions = beforeSubmit ? await beforeSubmit() : {};

        if (additionalOptions === false) return setLoading(false);

        await fetch(`/api/hackathons/${hackathonSlug}/update`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                [featureKey]: true,
                ...additionalOptions,
            })
        }).then(res => res.text());

        router.reload();
    }

    return (
        <>
            <Display shadow caption={<Text h3 style={{ lineHeight: '30px' }}>
                {featureDescription}
            </Text>}>
                <div style={{
                    width: "500px",
                    height: "300px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: "10px",
                }}>
                    <Icon size={60} />
                    <Text h2 style={{ fontWeight: '700', fontSize: '48px' }}>{featureName}</Text>
                </div>
            </Display>
            <Card>
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: children ? 'space-between' : 'center',
                }}>
                    {children && <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                    }}>
                        {children}
                    </div>}
                    <Button loading={loading} type="success" onClick={() => enableFeature()} auto icon={<Icon />}>Enable {featureName}</Button>
                </div>
            </Card>
        </>
    )
}
