import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import {
  ActionButton,
  Feedback,
  Field,
  formStyles,
} from "../src/components/forms";
import {
  Body,
  Button,
  Card,
  Footer,
  PageHeader,
  PreviewNotice,
  Screen,
  SectionHeader,
  styles,
} from "../src/components/ui";
import {
  ARTIST_PROSPECT_ACTIONS_KEY,
  prospectActionTiming,
  readArtistProspectActions,
  type ArtistProspectAction,
} from "../src/utils/artistProspectActions";
import {
  ARTIST_PROSPECTS_KEY,
  artistProspectReadiness,
  readArtistProspects,
  type ArtistProspect,
  type ArtistProspectTrack,
} from "../src/utils/artistProspects";
import { theme } from "../src/theme";

const tracks: ArtistProspectTrack[] = ["Performance", "Production", "Culinary"];
const trackFilters = ["All tracks", ...tracks];
const attentionFilters = [
  "All attention",
  "Overdue",
  "High priority",
  "Needs details",
];
const sortOptions = ["Urgency", "Readiness", "Name", "Recently updated"];
const statusFilters = [
  "All statuses",
  "New lead",
  "Needs materials",
  "Ready for owner review",
];

export default function ArtistDevelopmentDashboard() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    track?: string | string[];
    attention?: string | string[];
    sort?: string | string[];
    status?: string | string[];
  }>();
  const routeTrack =
    trackFilters.find((item) => item === params.track) ?? "All tracks";
  const routeAttention =
    attentionFilters.find((item) => item === params.attention) ??
    "All attention";
  const routeSort =
    sortOptions.find((item) => item === params.sort) ?? "Urgency";
  const routeStatus =
    statusFilters.find((item) => item === params.status) ?? "All statuses";
  const [prospects, setProspects] = useState<ArtistProspect[]>([]);
  const [actions, setActions] = useState<ArtistProspectAction[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [track, setTrack] = useState("All tracks");
  const [attentionFilter, setAttentionFilter] = useState("All attention");
  const [sort, setSort] = useState("Urgency");
  const [status, setStatus] = useState("All statuses");
  const [message, setMessage] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  useEffect(() => setTrack(routeTrack), [routeTrack]);
  useEffect(() => setAttentionFilter(routeAttention), [routeAttention]);
  useEffect(() => setSort(routeSort), [routeSort]);
  useEffect(() => setStatus(routeStatus), [routeStatus]);
  useEffect(() => {
    void Promise.all([
      AsyncStorage.getItem(ARTIST_PROSPECTS_KEY),
      AsyncStorage.getItem(ARTIST_PROSPECT_ACTIONS_KEY),
    ])
      .then(([prospectValue, actionValue]) => {
        setProspects(readArtistProspects(prospectValue));
        setActions(readArtistProspectActions(actionValue));
      })
      .catch(() => setError(true))
      .finally(() => setReady(true));
  }, []);
  const open = actions.filter((item) => !item.completed);
  const overdue = open.filter(
    (item) => prospectActionTiming(item.dueDate).state === "overdue",
  );
  const high = open.filter((item) => item.priority === "High");
  const withoutTiming = open.filter(
    (item) => prospectActionTiming(item.dueDate).state === "missing",
  );
  const readyForReview = prospects.filter(
    (item) => artistProspectReadiness(item).ready,
  );
  const needsDetails = prospects.filter(
    (item) => !artistProspectReadiness(item).ready,
  );
  const unlinked = actions.filter(
    (item) => !prospects.some((prospect) => prospect.id === item.prospectId),
  );
  const attention = prospects.map((prospect) => {
    const prospectActions = open.filter(
      (item) => item.prospectId === prospect.id,
    );
    const overdueCount = prospectActions.filter(
      (item) => prospectActionTiming(item.dueDate).state === "overdue",
    ).length;
    const highCount = prospectActions.filter(
      (item) => item.priority === "High",
    ).length;
    const readiness = artistProspectReadiness(prospect);
    return {
      prospect,
      prospectActions,
      overdueCount,
      highCount,
      readiness,
      latestUpdated:
        [prospect.updatedAt, ...prospectActions.map((item) => item.updatedAt)]
          .sort()
          .at(-1) ?? prospect.updatedAt,
      score:
        overdueCount * 10 +
        highCount * 4 +
        readiness.missing.length * 2 +
        (prospectActions.length ? 1 : 0),
    };
  });
  const visibleAttention = attention
    .filter(
      (item) =>
        (track === "All tracks" || item.prospect.track === track) &&
        (status === "All statuses" || item.prospect.status === status) &&
        (attentionFilter === "All attention" ||
          (attentionFilter === "Overdue" && item.overdueCount > 0) ||
          (attentionFilter === "High priority" && item.highCount > 0) ||
          (attentionFilter === "Needs details" && !item.readiness.ready)),
    )
    .sort((a, b) =>
      sort === "Name"
        ? a.prospect.name.localeCompare(b.prospect.name)
        : sort === "Recently updated"
          ? b.latestUpdated.localeCompare(a.latestUpdated) ||
            a.prospect.name.localeCompare(b.prospect.name)
          : sort === "Readiness"
            ? b.readiness.missing.length - a.readiness.missing.length ||
              a.prospect.name.localeCompare(b.prospect.name)
            : b.score - a.score ||
              a.prospect.name.localeCompare(b.prospect.name),
    );
  const report = [
    "PTOWN ARTIST DEVELOPMENT — PRIVATE PIPELINE REPORT",
    "",
    `View: ${track} · ${status} · ${attentionFilter} · ${sort}`,
    `Prospects shown: ${visibleAttention.length} of ${prospects.length}`,
    `Ready for owner review: ${readyForReview.length}`,
    `Need planning details: ${needsDetails.length}`,
    `Open follow-ups: ${open.length}`,
    `Overdue follow-ups: ${overdue.length}`,
    `High-priority open follow-ups: ${high.length}`,
    `Open follow-ups without timing: ${withoutTiming.length}`,
    `Completed follow-ups: ${actions.length - open.length}`,
    `Unlinked history: ${unlinked.length}`,
    `New leads: ${prospects.filter((item) => item.status === "New lead").length}`,
    `Needs materials: ${prospects.filter((item) => item.status === "Needs materials").length}`,
    `Ready for owner review status: ${prospects.filter((item) => item.status === "Ready for owner review").length}`,
    "",
    "VISIBLE OWNER ATTENTION QUEUE",
    ...(visibleAttention.length
      ? visibleAttention.flatMap((item) => [
          `${item.prospect.name} · ${item.prospect.track}`,
          `Status: ${item.prospect.status}`,
          `Open: ${item.prospectActions.length} · Overdue: ${item.overdueCount} · High priority: ${item.highCount}`,
          `Readiness: ${item.readiness.ready ? "Planning details complete" : `Missing ${item.readiness.missing.join(", ")}`}`,
          "",
        ])
      : ["No prospects match this view.", ""]),
    "PRIVATE DEVICE PLANNING — Not outreach, assignment, approval, booking, promise, or enrollment.",
  ].join("\n");
  async function copyReport() {
    setMessage(null);
    setCopyError(null);
    try {
      if (Platform.OS === "web") {
        if (typeof navigator.clipboard?.writeText !== "function")
          throw new Error();
        await navigator.clipboard.writeText(report);
      } else if (!(await Clipboard.setStringAsync(report))) throw new Error();
      setMessage("Private Artist Development pipeline report copied.");
    } catch {
      setCopyError(
        "Copy is unavailable. Select the report and copy it manually.",
      );
    }
  }
  return (
    <Screen>
      <PageHeader
        eyebrow="PTOWN ARTIST DEVELOPMENT · PRIVATE PIPELINE"
        title="See the whole development pipeline."
        description="Review device-local prospects, readiness, follow-up priorities, and timing in one owner-facing dashboard."
      />
      <PreviewNotice />
      <Card
        title="Planning view—not outreach or assignment"
        description="Counts reflect only this device. This dashboard does not contact prospects, assign staff, approve talent, promise bookings, or enroll participants."
      />
      {!ready ? (
        <Body>Loading the private Artist Development pipeline…</Body>
      ) : error ? (
        <Card
          title="Private pipeline unavailable"
          description="The saved prospect or follow-up data could not be read. Existing device data was not changed."
        />
      ) : (
        <>
          <SectionHeader title="Pipeline at a glance" />
          <View style={styles.grid}>
            <Metric title="Prospects" value={prospects.length} />
            <Metric title="Ready for review" value={readyForReview.length} />
            <Metric title="Need details" value={needsDetails.length} />
            <Metric title="Open follow-ups" value={open.length} />
            <Metric
              title="Overdue"
              value={overdue.length}
              alert={overdue.length > 0}
            />
            <Metric
              title="High priority"
              value={high.length}
              alert={high.length > 0}
            />
          </View>
          <SectionHeader title="Decision stages" />
          <View style={styles.grid}>
            {statusFilters.slice(1).map((item) => (
              <Metric
                key={item}
                title={item}
                value={
                  prospects.filter((prospect) => prospect.status === item)
                    .length
                }
              />
            ))}
          </View>
          <SectionHeader title="Development tracks" />
          <View style={styles.grid}>
            {tracks.map((track) => {
              const trackProspects = prospects.filter(
                (item) => item.track === track,
              );
              const trackOpen = open.filter((action) =>
                trackProspects.some(
                  (prospect) => prospect.id === action.prospectId,
                ),
              );
              return (
                <View
                  key={track}
                  style={[styles.card, { minWidth: 190, flexGrow: 1 }]}
                >
                  <Text style={styles.cardTitle}>{track}</Text>
                  <Body>
                    {trackProspects.length} private{" "}
                    {trackProspects.length === 1 ? "prospect" : "prospects"}
                    {`\n`}
                    {
                      trackProspects.filter(
                        (item) => artistProspectReadiness(item).ready,
                      ).length
                    }{" "}
                    ready for review{`\n`}
                    {trackOpen.length} open follow-ups
                  </Body>
                </View>
              );
            })}
          </View>
          <SectionHeader title="Owner attention queue" />
          <Text style={styles.cardTitle}>Development track</Text>
          <View
            accessibilityRole="tablist"
            accessibilityLabel="Pipeline track"
            style={styles.grid}
          >
            {trackFilters.map((item) => (
              <Filter
                key={item}
                label={item}
                selected={track === item}
                onPress={() => {
                  setTrack(item);
                  router.setParams({
                    track: item === "All tracks" ? undefined : item,
                  });
                }}
              />
            ))}
          </View>
          <Text style={styles.cardTitle}>Planning status</Text>
          <View
            accessibilityRole="tablist"
            accessibilityLabel="Pipeline planning status"
            style={styles.grid}
          >
            {statusFilters.map((item) => (
              <Filter
                key={item}
                label={item}
                selected={status === item}
                onPress={() => {
                  setStatus(item);
                  router.setParams({
                    status: item === "All statuses" ? undefined : item,
                  });
                }}
              />
            ))}
          </View>
          <Text style={styles.cardTitle}>Attention type</Text>
          <View
            accessibilityRole="tablist"
            accessibilityLabel="Pipeline attention type"
            style={styles.grid}
          >
            {attentionFilters.map((item) => (
              <Filter
                key={item}
                label={item}
                selected={attentionFilter === item}
                onPress={() => {
                  setAttentionFilter(item);
                  router.setParams({
                    attention: item === "All attention" ? undefined : item,
                  });
                }}
              />
            ))}
          </View>
          <Text style={styles.cardTitle}>Sort owner queue</Text>
          <View
            accessibilityRole="tablist"
            accessibilityLabel="Pipeline sort"
            style={styles.grid}
          >
            {sortOptions.map((item) => (
              <Filter
                key={item}
                label={item}
                selected={sort === item}
                onPress={() => {
                  setSort(item);
                  router.setParams({
                    sort: item === "Urgency" ? undefined : item,
                  });
                }}
              />
            ))}
          </View>
          {(track !== "All tracks" ||
            status !== "All statuses" ||
            attentionFilter !== "All attention" ||
            sort !== "Urgency") && (
            <ActionButton
              label="Reset pipeline view"
              secondary
              onPress={() => {
                setTrack("All tracks");
                setStatus("All statuses");
                setAttentionFilter("All attention");
                setSort("Urgency");
                router.setParams({
                  track: undefined,
                  status: undefined,
                  attention: undefined,
                  sort: undefined,
                });
              }}
            />
          )}
          <Text accessibilityLiveRegion="polite" style={styles.smallBody}>
            {visibleAttention.length} of {prospects.length} private prospects
            shown
          </Text>
          {visibleAttention.length ? (
            visibleAttention.map((item) => (
              <View key={item.prospect.id} style={styles.card}>
                <Text
                  style={{
                    color: item.overdueCount
                      ? "#E8AAA2"
                      : item.readiness.ready
                        ? theme.colors.green
                        : theme.colors.gold,
                    fontSize: 12,
                    fontWeight: "700",
                  }}
                >
                  {item.overdueCount
                    ? `${item.overdueCount} OVERDUE`
                    : item.readiness.ready
                      ? "READY FOR OWNER REVIEW"
                      : "NEEDS PLANNING DETAILS"}{" "}
                  · {item.prospect.track.toUpperCase()}
                </Text>
                <Text style={styles.cardTitle}>{item.prospect.name}</Text>
                <Body>
                  Status: {item.prospect.status}
                  {`\n`}Open follow-ups: {item.prospectActions.length}
                  {`\n`}High priority: {item.highCount}
                  {item.readiness.missing.length
                    ? `\nMissing: ${item.readiness.missing.join(", ")}`
                    : ""}
                </Body>
                <Button
                  label={`Review ${item.prospect.name}`}
                  href={{
                    pathname: "/artist-prospects/[id]",
                    params: { id: item.prospect.id },
                  }}
                />
                <Button
                  label={`Open ${item.prospect.name} follow-ups`}
                  href={{
                    pathname: "/artist-prospect-actions",
                    params: { prospect: item.prospect.id },
                  }}
                  secondary
                />
              </View>
            ))
          ) : (
            <Card
              title={
                prospects.length
                  ? "No private prospects match"
                  : "No private prospects yet"
              }
              description={
                prospects.length
                  ? "Choose another pipeline view or reset the filters."
                  : "Create a prospect profile to begin the owner pipeline."
              }
            />
          )}
          <SectionHeader title="Follow-up watch" />
          <View style={styles.grid}>
            <Metric
              title="No timing entered"
              value={withoutTiming.length}
              alert={withoutTiming.length > 0}
            />
            <Metric title="Completed" value={actions.length - open.length} />
            <Metric
              title="Unlinked history"
              value={unlinked.length}
              alert={unlinked.length > 0}
            />
          </View>
          {unlinked.length > 0 && (
            <Button
              label={`Review ${unlinked.length} unlinked ${unlinked.length === 1 ? "follow-up" : "follow-ups"}`}
              href="/artist-prospect-actions-unlinked"
            />
          )}
          <SectionHeader title="Copy owner pipeline report" />
          <Field
            label="Private Artist Development pipeline report"
            value={report}
            multiline
            editable={false}
            style={{ minHeight: 340, textAlignVertical: "top", lineHeight: 22 }}
          />
          <ActionButton
            label="Copy private Artist Development pipeline report"
            onPress={() => {
              void copyReport();
            }}
          />
          <Feedback message={message} />
          {copyError && (
            <Text accessibilityRole="alert" style={formStyles.error}>
              {copyError}
            </Text>
          )}
        </>
      )}
      <Button label="Prepare post-showcase owner handoff" href="/artist-handoff" secondary />
      <Button label="Manage private prospects" href="/artist-prospects" />
      <Button
        label="Open private prospect follow-ups"
        href="/artist-prospect-actions"
        secondary
      />
      <Button
        label="Back up the Artist Development pipeline"
        href="/artist-prospect-backup"
        secondary
      />
      <Button
        label="Return to Artist Development"
        href="/artist-development"
        secondary
      />
      <Footer />
    </Screen>
  );
}

function Filter({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      aria-selected={selected}
      onPress={onPress}
      style={{
        minHeight: 48,
        paddingHorizontal: 16,
        paddingVertical: 13,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: selected ? theme.colors.gold : theme.colors.surface,
      }}
    >
      <Text
        style={{
          color: selected ? theme.colors.background : theme.colors.cream,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function Metric({
  title,
  value,
  alert = false,
}: {
  title: string;
  value: number;
  alert?: boolean;
}) {
  return (
    <View style={[styles.card, { minWidth: 150, flexGrow: 1 }]}>
      <Text
        style={{
          color: alert ? "#E8AAA2" : theme.colors.gold,
          fontSize: 28,
          fontWeight: "700",
        }}
      >
        {value}
      </Text>
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
  );
}
