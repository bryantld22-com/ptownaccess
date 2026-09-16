import { Button, Card, Footer, PageHeader, PreviewNotice, Screen } from '../../src/components/ui';
export default function Profile() {
  return <Screen><PageHeader eyebrow="WELCOME TO PTOWN" title="Your place in the club." description="Explore as a guest while we prepare the PTown Access experience." /><PreviewNotice /><Card title="Guest preview" description="No account is needed to explore this build. Personal profiles and sign-in will be introduced in a later release." /><Button label="Explore memberships" href="/memberships" /><Button label="Discover VIP Society" href="/vip" secondary /><Footer /></Screen>;
}
