import { Button, Card, Footer, PageHeader, Screen, SectionCard, styles } from '../../src/components/ui';
import { View } from 'react-native';
import { sections } from '../../src/data/sections';
export default function PTown() {
  return <Screen><PageHeader eyebrow="PTOWN DINNER CLUB · PADUCAH" title="Culture. Creativity. Community." description="Dinner and a show is only the beginning. PTown connects hospitality, live entertainment, and creative opportunity." /><Card title="Excellence Earns Trust." description="Our standard is simple: serve with care, respect every person, and build experiences our community can be proud of." /><View style={styles.grid}>{sections.slice(2).map(section => <SectionCard key={section.href} {...section} />)}</View><Button label="Explore the weekly program" href="/events" /><Footer /></Screen>;
}
