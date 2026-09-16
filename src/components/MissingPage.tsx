import { Stack, type Href } from 'expo-router';
import { Button, Footer, PageHeader, Screen } from './ui';

export function MissingPage({ title = 'Page not found.', description = 'This link is unavailable. Search PTown or return to your saved plans to keep exploring.', browse }: {
  title?: string;
  description?: string;
  browse?: { label: string; href: Href };
}) {
  return <Screen>
    <Stack.Screen options={{ title: 'Link unavailable' }} />
    <PageHeader eyebrow="PTOWN ACCESS" title={title} description={description} />
    {browse && <Button label={browse.label} href={browse.href} />}
    <Button label="Search all PTown" href="/search" secondary={!!browse} />
    <Button label="View your saved plans" href="/profile" secondary />
    <Button label="Return home" href="/" secondary />
    <Footer />
  </Screen>;
}
