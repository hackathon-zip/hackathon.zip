import { Grid, Card, Text, Divider, Link } from "@geist-ui/core"
import NextLink from "next/link";
import type { Hackathon } from "@prisma/client";
import { useRouter } from "next/router";
import Head from "next/head";

export default function AttendeeLayout ({ children, hackathon }: { children: React.ReactNode, hackathon: Hackathon | null }) {
    const router = useRouter()
    const transformURL = (path: string) => router.asPath.startsWith("/attendee/") ? `/attendee/${hackathon?.slug}${path}` : path
    return (
        <>
            <Head>
                <title>{hackathon?.name}</title>
            </Head>
            <Grid.Container gap={4} justify="center" style={{ padding: '2rem' }}>
                <Grid xs={6}>
                <div style={{width: '100%', position: 'relative'}}>
                    <Card style={{overflow: 'hidden'}}>
                        <div style={{ 
                            backgroundImage: 'linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.5)), url(https://pbs.twimg.com/media/FZmKOGwUcAApTR7.jpg)', 
                            minHeight: '100px', 
                            padding: '16px',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}>
                            <Text h3 b style={{ 
                                    color: 'white',
                                    fontWeight: '800'
                                }}>
                                    {hackathon?.name}
                            </Text>
                        </div>
                        <Card.Content>
                            <Text b my={0}>
                                <NextLink href={transformURL("/")}>
                                    <Link color underline>Home</Link>
                                </NextLink>
                            </Text>
                        </Card.Content>
                        <Divider h="1px" my={0} />
                        <Card.Content>
                            <Text b my={0}>
                                <NextLink href={transformURL("/register")}>
                                    <Link color underline>Register</Link>
                                </NextLink>
                            </Text>
                        </Card.Content>
                        <Divider h="1px" my={0} />
                        <Card.Content>
                            <Text b my={0}>
                                <NextLink href={transformURL("/schedule")}>
                                    <Link color underline>Schedule</Link>
                                </NextLink>
                            </Text>
                        </Card.Content>
                        <Divider h="1px" my={0} />
                        <Card.Content>
                            <Text b my={0}>
                                <NextLink href={transformURL("/ship")}>
                                    <Link color underline>Ship</Link>
                                </NextLink>
                            </Text>
                        </Card.Content>
                    </Card>
                </div>
                </Grid>
                <Grid xs>{children}</Grid>
            </Grid.Container>
        </>
    )
}
