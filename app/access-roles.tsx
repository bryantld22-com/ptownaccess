import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Body, Button, Card, Footer, PageHeader, PreviewNotice, Screen, SectionHeader, styles } from '../src/components/ui';
import { SectionIcon } from '../src/components/SectionIcon';
import { accessRoles, type AccessRoleId } from '../src/data/accessRoles';
import { theme } from '../src/theme';

const defaultRole = accessRoles[0];

export default function AccessRoles() {
  const { role } = useLocalSearchParams<{ role?: string | string[] }>();
  const router = useRouter();
  const routeRole = typeof role === 'string' && accessRoles.some(item => item.id === role) ? role as AccessRoleId : defaultRole.id;
  const [selected, setSelected] = useState<AccessRoleId>(defaultRole.id);
  useEffect(() => { setSelected(routeRole); }, [routeRole]);
  const active = accessRoles.find(item => item.id === selected) ?? defaultRole;
  function choose(id: AccessRoleId) { setSelected(id); router.setParams({ role: id === defaultRole.id ? undefined : id }); }

  return <Screen>
    <Stack.Screen options={{ title: 'PTown Access roles' }} />
    <PageHeader eyebrow="PTOWN ACCESS · ROLE BLUEPRINT" title="Right access. Right responsibility." description="Map each real PTown workflow and its information boundary before accounts, permissions, and live systems are connected." />
    <PreviewNotice />
    <Card title="Blueprint—not live security" description="This page defines future role boundaries. It does not create an account, verify an identity, grant access, hide an existing page, assign work, or enforce a permission. Live roles require authentication, backend authorization, consent, audit records, and a reviewed operating policy." />
    <SectionHeader title="Choose a role" />
    <View accessibilityRole="tablist" accessibilityLabel="PTown Access roles" style={styles.grid}>
      {accessRoles.map(item => <Pressable key={item.id} accessibilityRole="tab" accessibilityState={{ selected: selected === item.id }} aria-selected={selected === item.id} onPress={() => choose(item.id)} style={[local.roleTab, selected === item.id && local.roleTabSelected]}><Text style={[local.roleTabText, selected === item.id && local.roleTabTextSelected]}>{item.title}</Text></Pressable>)}
    </View>
    <Text accessibilityLiveRegion="polite" style={styles.smallBody}>{active.group} · Selected role</Text>
    <View style={local.roleCard}>
      <SectionIcon name={active.icon} />
      <Text style={styles.eyebrow}>ACCESS ROLE</Text>
      <Text accessibilityRole="header" style={local.roleTitle}>{active.title}</Text>
      <Body>{active.summary}</Body>
    </View>
    <SectionHeader title="Workflow to map before launch" />
    <RoleList items={active.workflow} numbered />
    <SectionHeader title="Future permission boundary" />
    <RoleList items={active.futurePermissions} />
    <SectionHeader title="Denied by default" />
    <RoleList items={active.deniedByDefault} blocked />
    <SectionHeader title="Relevant preview areas" />
    <Body>These links demonstrate related PTown work already in the preview. They are not permissioned dashboards and opening one does not grant this role.</Body>
    <View style={styles.grid}>{active.links.map(link => <Button key={link.label} label={link.label} href={link.href} secondary />)}</View>
    <SectionHeader title="Plan the review" />
    <Card title="Turn this boundary into a limited worksheet" description="Choose one responsibility, one access window, and every safeguard required for owner review. The worksheet does not submit, approve, assign, or grant access." />
    <Button label={`Build a ${active.title} review worksheet`} href={{ pathname: '/access-request', params: { role: active.id } }} />
    <SectionHeader title="Controls required before live roles" />
    <View style={styles.grid}>
      <Card title="Identity before access" description="Verify the person and account before attaching a member, performer, staff, production, director, or administrative role." />
      <Card title="Least privilege" description="Grant only the specific information and actions required for the assigned responsibility, event, shift, production, or department." />
      <Card title="Consent, safety, and confidentiality" description="Protect payment, emergency and medical, staff, performer-contract, student, youth, financial, and internal business information with need-to-know controls." />
      <Card title="Review, audit, and revoke" description="Record sensitive grants and actions, review access regularly, expire temporary authority, and remove access immediately when responsibility ends." />
    </View>
    <Button label="Return to PTown" href="/ptown" secondary /><Footer />
  </Screen>;
}

function RoleList({ items, numbered = false, blocked = false }: { items: readonly string[]; numbered?: boolean; blocked?: boolean }) {
  return <View style={[local.list, blocked && local.blockedList]}>{items.map((item, index) => <View key={item} style={local.listRow}><Text aria-hidden style={[local.marker, blocked && local.blockedMarker]}>{numbered ? `${index + 1}` : blocked ? '×' : '•'}</Text><Text style={local.listText}>{item}</Text></View>)}</View>;
}

const local = StyleSheet.create({
  roleTab: { minHeight: 48, paddingHorizontal: 18, paddingVertical: 14, borderRadius: 30, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, justifyContent: 'center' },
  roleTabSelected: { backgroundColor: theme.colors.gold, borderColor: theme.colors.gold },
  roleTabText: { color: theme.colors.cream, fontSize: 14, fontWeight: '600' },
  roleTabTextSelected: { color: theme.colors.background },
  roleCard: { backgroundColor: theme.colors.elevated, padding: 24, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.gold, gap: 10 },
  roleTitle: { color: theme.colors.cream, fontSize: 28, lineHeight: 35, fontWeight: '600' },
  list: { backgroundColor: theme.colors.surface, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, gap: 14 },
  blockedList: { borderLeftWidth: 3, borderLeftColor: theme.colors.gold },
  listRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  marker: { width: 22, color: theme.colors.gold, fontSize: 15, lineHeight: 25, fontWeight: '700', textAlign: 'center' },
  blockedMarker: { color: theme.colors.muted },
  listText: { flex: 1, color: theme.colors.muted, fontSize: 16, lineHeight: 25 },
});
