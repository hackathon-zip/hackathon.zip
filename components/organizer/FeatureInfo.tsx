import { Button, Card, Display, Input, Text } from "@geist-ui/core"
import { Icon } from "@geist-ui/react-icons"

export default function FeatureInfo ({ featureName, featureDescription, featureIcon: Icon, children }: { featureName: string, featureDescription: string | JSX.Element, featureIcon: Icon, children?: JSX.Element }) {
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
                    <Button type="success" auto icon={<Icon />}>Enable {featureName}</Button>
                </div>
            </Card>
        </>
    )
}

