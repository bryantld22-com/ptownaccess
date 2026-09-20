import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
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

export default function ArtistDevelopmentDashboard() {
  const [prospects, setProspects] = useState<ArtistProspect[]>([]);
  const [actions, setActions] = useState<ArtistProspectAction[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
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
  const attention = prospects
    .map((prospect) => {
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
        score:
          overdueCount * 10 +
          highCount * 4 +
          readiness.missing.length * 2 +
          (prospectActions.length ? 1 : 0),
      };
    })
    .sort(
      (a, b) =>
        b.score - a.score || a.prospect.name.localeCompare(b.prospect.name),
    );
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
          {attention.length ? (
            attention.map((item) => (
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
              title="No private prospects yet"
              description="Create a prospect profile to begin the owner pipeline."
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
        </>
      )}
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
