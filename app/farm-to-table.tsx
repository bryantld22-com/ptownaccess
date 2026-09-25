import { Stack } from 'expo-router';
import { View } from 'react-native';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';

const connections = [
  { title: 'Local growers', description: 'Explore seasonal produce, harvest windows, and how a dish can name the people and places behind its ingredients when permission is granted.' },
  { title: 'Meat and specialty suppliers', description: 'Explore regional meat, dairy, bakery, and specialty sources with the kitchen team. Supplier availability, food safety, pricing, and purchasing terms need review.' },
  { title: 'Chefs and students', description: 'Let culinary learners trace an ingredient from sourcing to prep, service, cost, and a portfolio story under qualified supervision.' },
  { title: 'Guests and community', description: 'Turn an approved ingredient story into a menu feature, chef conversation, or community visit. Show an actual source only after confirming the relationship and permissions.' },
];

export default function FarmToTable() {
  return <Screen>
    <Stack.Screen options={{ title: 'PTown Farm To Table' }} />
    <PageHeader eyebrow="PTOWN AGRICULTURE · BUILD 111" title="Meet the people behind the plate." description="A proposed Farm To Table program connecting regional agriculture with PTown’s culinary training, menu, and storytelling." />
    <PreviewNotice />
    <Card title="Agriculture meets Culinary Artist Development" description="PTown’s agriculture direction starts with relationships among local farmers, produce growers, meat suppliers, chefs, and students. The Culinary Academy can turn those relationships into practical sourcing and hospitality learning. This is a plan, not an active supplier or enrollment program." />
    <SectionHeader title="The proposed connection" />
    <View style={styles.grid}>{connections.map(item => <Card key={item.title} title={item.title} description={item.description} />)}</View>
    <SectionHeader title="Stories worth developing" />
    <Card title="Farm To Table" description="A producer and chef could explain a seasonal ingredient, demonstrate a dish, and show how students learn sourcing, preparation, service, and cost. Record only with consent and a cleared production plan." />
    <Card title="PTown Table Talk and Chef Spotlight" description="Possible culinary conversations can connect farmers, chefs, students, and the community. PTown Media Group handles editorial and production review before anything is released." />
    <Card title="Kentucky heritage and a future festival" description="Southern cuisine, local producers, bourbon education, blues, and jazz can inform a proposed Kentucky Food, Bourbon, Blues & Jazz Festival. Dates, partners, alcohol service, and event commitments are not established here." />
    <SectionHeader title="What must be confirmed" />
    <Body>Identify willing growers and suppliers; verify sourcing, pricing, food safety, seasonality, and permission to name or film each partner. Agree on curriculum and student supervision before describing training or placement outcomes. Publish specific menus and events only after PTown approves them.</Body>
    <Button label="Explore Culinary Artist Development" href="/programs/culinary-development" secondary />
    <Button label="Explore PTown Media Group" href="/media-group" secondary />
    <Button label="Return to PTown" href="/ptown" secondary />
    <Footer />
  </Screen>;
}
