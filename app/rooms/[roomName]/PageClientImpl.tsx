'use client';

import React from 'react';
import { decodePassphrase } from '@/lib/client-utils';
import { DebugMode } from '@/lib/Debug';
import { KeyboardShortcuts } from '@/lib/KeyboardShortcuts';
import { RecordingIndicator } from '@/lib/RecordingIndicator';
import { SettingsMenu } from '@/lib/SettingsMenu';
import { ConnectionDetails } from '@/lib/types';
import {
  formatChatMessageLinks,
  LocalUserChoices,
  PreJoin,
  RoomContext,
  VideoConference,
  useChat,
  useRoomContext,
} from '@livekit/components-react';
import {
  ExternalE2EEKeyProvider,
  RoomOptions,
  VideoCodec,
  VideoPresets,
  Room,
  DeviceUnsupportedError,
  RoomConnectOptions,
  RoomEvent,
  TrackPublishDefaults,
  VideoCaptureOptions,
  RemoteParticipant,
  ParticipantEvent,
} from 'livekit-client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSetupE2EE } from '@/lib/useSetupE2EE';
import { useLowCPUOptimizer } from '@/lib/usePerfomanceOptimiser';
import PostMeetFeedback from '../../../components/PostMeetFeedback';

const CONN_DETAILS_ENDPOINT =
  process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT ?? '/api/connection-details';
const SHOW_SETTINGS_MENU = process.env.NEXT_PUBLIC_SHOW_SETTINGS_MENU == 'true';

/* Helper: Send logs to server terminal */
const logToTerminal = async (message: string, level: 'INFO' | 'ERROR' = 'INFO') => {
  try {
    await fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, level })
    });
  } catch (e) {
    console.error('Failed to log to terminal:', e);
  }
};

/* Helper Component to Handle Agent Context via useChat (Function Calls) */
/* Helper Component to Handle Agent Context via useChat (Function Calls) */
/* Helper Component to Handle Agent Context via useChat (Function Calls) */
function AgentContextHandler(props: {
  context: { jobTitle?: string | null; company?: string | null };
  participantName: string;
}) {
  const room = useRoomContext();
  const { send } = useChat();
  // Track if we've sent to specific participants to avoid double-sending on re-renders/race conditions
  const sentRef = React.useRef<Set<string>>(new Set());

  React.useEffect(() => {
    if (!room) return;

    // Helper to force name override
    const enforceAgentName = (p: RemoteParticipant) => {
      // Logic: If it's a remote participant (agent), force name
      const isTherapist = process.env.NEXT_PUBLIC_APP_MODE === 'therapist';
      const expectedName = isTherapist ? 'Dr. Hannibal Lecter' : 'Anika';
      if (p.name !== expectedName) {
        console.log(`[AgentContextHandler] Enforcing name '${expectedName}' for ${p.identity} (was '${p.name}')`);

        // Use Object.defineProperty to override the getter so it always returns the expected name
        Object.defineProperty(p, 'name', {
          get: () => expectedName,
          set: (val) => {
            // Ignore any attempts by the LiveKit SDK to revert the name
            console.log(`[AgentContextHandler] Ignored attempt to set name to '${val}'`);
          },
          configurable: true,
          enumerable: true,
        });

        // Force the UI to re-render with the new name
        p.emit(ParticipantEvent.ParticipantNameChanged, expectedName);
      }
    };

    // 1. Define Message Function
    const sendMessage = async (reason: string, targetIdentity: string) => {
      if (sentRef.current.has(targetIdentity)) {
        return;
      }

      // CHAT DISABLED AS PER USER REQUEST
      try {
        await logToTerminal(`[AgentContextHandler] Chat disabled. Skipping send for ${targetIdentity} (${reason}).`);
      } catch (e: any) {
        // ignore
      }
    };

    // 2. Handle Existing Participants
    room.remoteParticipants.forEach((p) => {
      enforceAgentName(p);
      if (!sentRef.current.has(p.identity)) {
        logToTerminal(`[AgentContextHandler] Found existing participant: ${p.identity}`);
        sendMessage('ExistingParticipant', p.identity);
      }
    });

    // 3. Listen for New Participants
    const handleParticipantConnected = (participant: RemoteParticipant) => {
      if (!participant.isLocal) {
        enforceAgentName(participant);
        logToTerminal(`[AgentContextHandler] Event: New participant connected: ${participant.identity}`);
        // Small delay to ensure they are ready to receive
        setTimeout(() => sendMessage('NewParticipantEvent', participant.identity), 1000);
      }
    };

    // 4. Enforce Name on Updates (Anti-Flicker/Persistent)
    const handleParticipantNameChanged = (arg1: any, arg2: any) => {
      // Identify participant arg (could be 1st or 2nd)
      let p: RemoteParticipant | undefined;
      if (arg1 && (arg1 as RemoteParticipant).isLocal !== undefined) p = arg1;
      else if (arg2 && (arg2 as RemoteParticipant).isLocal !== undefined) p = arg2;

      // Check if it is a remote participant
      if (p && !p.isLocal) {
        enforceAgentName(p);
      }
    };

    room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
    // Note: RoomEvent.ParticipantNameChanged usually passes the participant as argument.
    // If not, we might need to check args. Assuming standard LiveKit behavior.
    room.on(RoomEvent.ParticipantNameChanged, handleParticipantNameChanged);

    return () => {
      room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
      room.off(RoomEvent.ParticipantNameChanged, handleParticipantNameChanged);
    };
  }, [room, send, props.context, props.participantName]);

  return null;
}

export function PageClientImpl(props: {
  roomName: string;
  region?: string;
  hq: boolean;
  codec: VideoCodec;
}) {
  const searchParams = useSearchParams();
  const jobTitle = searchParams?.get('jobTitle');
  const company = searchParams?.get('company');

  const [preJoinChoices, setPreJoinChoices] = React.useState<LocalUserChoices | undefined>(
    undefined,
  );
  const preJoinDefaults = React.useMemo(() => {
    return {
      username: '',
      videoEnabled: true,
      audioEnabled: true,
    };
  }, []);
  const [connectionDetails, setConnectionDetails] = React.useState<ConnectionDetails | undefined>(
    undefined,
  );

  const handlePreJoinSubmit = React.useCallback(async (values: LocalUserChoices) => {
    setPreJoinChoices(values);
    const url = new URL(CONN_DETAILS_ENDPOINT, window.location.origin);
    url.searchParams.append('roomName', props.roomName);
    url.searchParams.append('participantName', values.username);
    if (props.region) {
      url.searchParams.append('region', props.region);
    }
    const jobTitle = searchParams?.get('jobTitle');
    const company = searchParams?.get('company');
    if (jobTitle) url.searchParams.append('jobTitle', jobTitle);
    if (company) url.searchParams.append('company', company);

    const connectionDetailsResp = await fetch(url.toString());
    const connectionDetailsData = await connectionDetailsResp.json();
    setConnectionDetails(connectionDetailsData);
  }, [props.roomName, props.region, searchParams]);
  const handlePreJoinError = React.useCallback((e: any) => console.error(e), []);

  return (
    <main data-lk-theme="default" style={{ height: '100%' }}>
      {connectionDetails === undefined || preJoinChoices === undefined ? (
        <div style={{ display: 'grid', placeItems: 'center', height: '100%', alignContent: 'center' }}>
          <div style={{ marginBottom: '20px', textAlign: 'center', color: 'white', maxWidth: '400px', fontWeight: 'bold', fontSize: '1.2rem' }}>
            <p>Please note: You may need to wait for a minute before the {process.env.NEXT_PUBLIC_APP_MODE === 'therapist' ? 'session' : 'interview'} starts.</p>
          </div>
          <PreJoin
            defaults={preJoinDefaults}
            onSubmit={handlePreJoinSubmit}
            onError={handlePreJoinError}
            joinLabel="Join"
          />
        </div>
      ) : (
        <VideoConferenceComponent
          connectionDetails={connectionDetails}
          userChoices={preJoinChoices}
          options={{ codec: props.codec, hq: props.hq }}
          context={{ jobTitle, company }}
        />
      )}
    </main>
  );
}

function VideoConferenceComponent(props: {
  userChoices: LocalUserChoices;
  connectionDetails: ConnectionDetails;
  options: {
    hq: boolean;
    codec: VideoCodec;
  };
  context: {
    jobTitle?: string | null;
    company?: string | null;
  };
}) {
  const { worker, e2eePassphrase } = useSetupE2EE();
  const e2eeEnabled = !!(e2eePassphrase && worker);
  const keyProvider = new ExternalE2EEKeyProvider();

  const [e2eeSetupComplete, setE2eeSetupComplete] = React.useState(false);

  const roomOptions = React.useMemo((): RoomOptions => {
    let videoCodec: VideoCodec | undefined = props.options.codec ? props.options.codec : 'vp9';
    if (e2eeEnabled && (videoCodec === 'av1' || videoCodec === 'vp9')) {
      videoCodec = undefined;
    }
    const videoCaptureDefaults: VideoCaptureOptions = {
      deviceId: props.userChoices.videoDeviceId ?? undefined,
      resolution: props.options.hq ? VideoPresets.h2160 : VideoPresets.h720,
    };
    const publishDefaults: TrackPublishDefaults = {
      dtx: false,
      videoSimulcastLayers: props.options.hq
        ? [VideoPresets.h1080, VideoPresets.h720]
        : [VideoPresets.h540, VideoPresets.h216],
      red: !e2eeEnabled,
      videoCodec,
    };
    return {
      videoCaptureDefaults: videoCaptureDefaults,
      publishDefaults: publishDefaults,
      audioCaptureDefaults: {
        deviceId: props.userChoices.audioDeviceId ?? undefined,
      },
      adaptiveStream: true,
      dynacast: true,
      e2ee: keyProvider && worker && e2eeEnabled ? { keyProvider, worker } : undefined,
    };
  }, [props.userChoices, props.options.hq, props.options.codec]);

  const room = React.useMemo(() => new Room(roomOptions), []);

  React.useEffect(() => {
    if (e2eeEnabled) {
      keyProvider
        .setKey(decodePassphrase(e2eePassphrase!))
        .then(() => {
          room.setE2EEEnabled(true).catch((e) => {
            if (e instanceof DeviceUnsupportedError) {
              alert(
                `You're trying to join an encrypted meeting, but your browser does not support it. Please update it to the latest version and try again.`,
              );
              console.error(e);
            } else {
              throw e;
            }
          });
        })
        .then(() => setE2eeSetupComplete(true));
    } else {
      setE2eeSetupComplete(true);
    }
  }, [e2eeEnabled, room, e2eePassphrase]);

  const connectOptions = React.useMemo((): RoomConnectOptions => {
    return {
      autoSubscribe: true,
    };
  }, []);

  const [isDisconnected, setIsDisconnected] = React.useState(false);
  const handleOnLeave = React.useCallback(() => setIsDisconnected(true), []);
  const handleError = React.useCallback((error: Error) => {
    console.error(error);
    alert(`Encountered an unexpected error, check the console logs for details: ${error.message}`);
  }, []);
  const handleEncryptionError = React.useCallback((error: Error) => {
    console.error(error);
    alert(
      `Encountered an unexpected encryption error, check the console logs for details: ${error.message}`,
    );
  }, []);

  React.useEffect(() => {
    room.on(RoomEvent.Disconnected, handleOnLeave);
    room.on(RoomEvent.EncryptionError, handleEncryptionError);
    room.on(RoomEvent.MediaDevicesError, handleError);

    if (e2eeSetupComplete) {
      room
        .connect(
          props.connectionDetails.serverUrl,
          props.connectionDetails.participantToken,
          connectOptions,
        )
        .catch((error) => {
          handleError(error);
        });
      if (props.userChoices.videoEnabled) {
        room.localParticipant.setCameraEnabled(true).catch((error) => handleError(error));
      }
      if (props.userChoices.audioEnabled) {
        room.localParticipant.setMicrophoneEnabled(true).catch((error) => handleError(error));
      }
    }
    return () => {
      room.off(RoomEvent.Disconnected, handleOnLeave);
      room.off(RoomEvent.EncryptionError, handleEncryptionError);
      room.off(RoomEvent.MediaDevicesError, handleError);
    };
  }, [e2eeSetupComplete, room, props.connectionDetails, props.userChoices, handleOnLeave, handleError, handleEncryptionError]); // Added deps

  const lowPowerMode = useLowCPUOptimizer(room);

  React.useEffect(() => {
    if (lowPowerMode) {
      console.warn('Low power mode enabled');
    }
  }, [lowPowerMode]);

  if (isDisconnected) {
    return (
      <main data-lk-theme="default" style={{ height: '100%', display: 'grid', placeItems: 'center' }}>
        <PostMeetFeedback />
      </main>
    );
  }

  const isTherapist = process.env.NEXT_PUBLIC_APP_MODE === 'therapist';
  const expectedName = isTherapist ? 'Dr. Hannibal Lecter' : 'Anika';

  return (
    <div className="lk-room-container">
      <style dangerouslySetInnerHTML={{
        __html: `
        .lk-participant-tile[data-lk-local-participant="false"] .lk-participant-name {
          font-size: 0px;
        }
        .lk-participant-tile[data-lk-local-participant="false"] .lk-participant-name::after {
          content: "${expectedName}";
          font-size: 15px;
        }
      `}} />
      <RoomContext.Provider value={room}>
        <KeyboardShortcuts />
        <VideoConference
          chatMessageFormatter={formatChatMessageLinks}
          SettingsComponent={SHOW_SETTINGS_MENU ? SettingsMenu : undefined}
        >
          {/* Note: AgentContextHandler cannot simply be a child of VideoConference unless VideoConference supports children rendering.
                 Standard LiveKit VideoConference does support children as overlays or standard layout modifications? 
                 Actually, VideoConference is often a self-contained layout.
                 If it doesn't render children, this Handler won't run.
                 However, AgentContextHandler returns 'null', so it just needs to be MOUNTED.
                 If VideoConference doesn't yield children, we must place it OUTSIDE but inside RoomContext.Provider.
                 BUT `useChat` hook requires to be inside `ChatContext`?
                 `useChat` docs say: "If you use useChat outside of a ChatContext it will create a new one based on the room context"
                 So it SHOULD work here.
             */}
        </VideoConference>
        <AgentContextHandler
          context={props.context}
          participantName={props.connectionDetails.participantName}
        />
        <RecordingIndicator />
      </RoomContext.Provider>
    </div>
  );
}
