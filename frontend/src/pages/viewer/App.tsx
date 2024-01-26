import { observer, useObservable } from "@legendapp/state/react";
import {
  Button,
  TextInput,
  Title,
  Text,
  Group,
  Blockquote,
  Stack,
  Tabs,
} from "@mantine/core";
import {
  isWebSocketOpen$,
  startWebSockets,
} from "../../state/websocket-manager";
// import { webSocketCommands } from "../../state/websocket-commands";
import { globalState$ } from "../../state/global-state";
import { orgUser$, embed, accessToken$ } from "../../truffle-sdk";
import { createViewerEntry } from "../../state/viewer-commands";
import { FullPageInfoMessage } from "../../components/full-page-info-message/full-page-info-message";
const App = observer(() => {
  startWebSockets();
  const activeTab = useObservable("Rules");
  const text = useObservable("");
  const hasAlerted = useObservable(false);
  const accessToken = accessToken$.get();

  if (accessToken instanceof Promise) {
    console.log(accessToken.catch());
    return <FullPageInfoMessage message="waiting for access token/no token" />;
  }
  if (isWebSocketOpen$.get() === false) {
    return (
      <FullPageInfoMessage message="not connected to websocket">
        <Button onClick={() => startWebSockets()}>try to reconnect</Button>
      </FullPageInfoMessage>
    );
  }
  if (
    !globalState$.isAcceptingEntries.get() ||
    !globalState$.isGameStarted.get()
  ) {
    const list = [];
    if (!globalState$.isAcceptingEntries.get()) {
      list.push("start accepting entries");
    }
    if (!globalState$.isGameStarted.get()) {
      list.push("start the game");
    }

    return;
  } else {
    // alert the user once on page load
    if (!hasAlerted.get()) {
      embed.showToast({
        title: "Spin The Wheel",
        body: "Entries are open for spin the wheel!",
        onClick: () => {
          embed.openWindow();
        },
      });
      hasAlerted.set(true);
    }
  }
  return (
    <main>
      <Text>{accessToken}</Text>
      <Tabs value={activeTab.get()} onChange={(e) => activeTab.set(e)}>
        <Tabs.List>
          <Tabs.Tab value="Rules">Rules</Tabs.Tab>
          <Tabs.Tab value="Submit">Submit</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="Rules">
          <Stack p="lg">
            <Title>Rules for wheel entries</Title>
            <Blockquote p="sm">
              {globalState$.rules.get() ||
                "creator hasn't submitted any rules yet"}
            </Blockquote>
            <Text>
              By submitting an entry to the wheel, you agree to the rules set by
              the creator. Entries that violate the rules may be removed.
            </Text>
            <Group justify="flex-end" pt="md">
              <Button m="md" onClick={() => activeTab.set("Submit")}>
                lets do it
              </Button>
            </Group>
          </Stack>
        </Tabs.Panel>
        <Tabs.Panel value="Submit">
          {/* <Flex
        direction="column"
        align="center"
        justify="center"
        style={{ height: "100vh" }}
      > */}
          <Stack p="lg">
            <Title>Submit an item to the wheel</Title>
            <TextInput
              size="md"
              label="Enter an item to add to the wheel"
              placeholder="end stream"
              value={text.get()}
              onChange={(e) => text.set(e.currentTarget.value)}
            />
            <Text>
              This entry will be attached to your Truffle username:{" "}
              {orgUser$.name.get() || "anonymous"}
            </Text>
            <Button
              m="xs"
              onClick={() => {
                createViewerEntry(text.get());
              }}
            >
              Add to wheel (100 sparks)
            </Button>
          </Stack>
          {/* </Flex> */}
        </Tabs.Panel>
      </Tabs>
    </main>
  );
});

export default App;
