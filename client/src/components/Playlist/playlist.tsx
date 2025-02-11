import { calculatePlaylistTime } from "@/helpers/general";
import { TrackObject } from "@/types/types";
import { Button, Group, Menu, Table } from "@mantine/core";
import { IconDotsVertical } from "@tabler/icons-react";
import { useRef, useState } from "react";
import SavePlaylistModal from "../SavePlaylist/savePlaylist";
import TableHead from "../TableHead/tableHead";
import TrackRow from "../TrackRow/trackRow";
import styles from "./playlist.module.css";

interface PlaylistProps {
  setMatchingTracks: React.Dispatch<
    React.SetStateAction<Map<string, TrackObject>>
  >;
  matchingTracks: Map<string, TrackObject>;
  playlist: Map<string, TrackObject>;
  setPlaylist: React.Dispatch<React.SetStateAction<Map<string, TrackObject>>>;
  handleSaveClick: (trackObj: TrackObject, saved: boolean) => void;
  loadingSaveStatusTrackIds: string[];
}

export default function Playlist({
  setMatchingTracks,
  matchingTracks,
  playlist,
  setPlaylist,
  handleSaveClick,
  loadingSaveStatusTrackIds,
}: PlaylistProps) {
  const [openTrackMenuId, setOpenTrackMenuId] = useState<string>();
  const [openSavePlaylist, setOpenSavePlaylist] = useState(false);
  const trackMenuRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Removes a given track from the playlist
  function removeFromPlaylist(trackId: string) {
    setPlaylist((prevPlaylist) => {
      const newPlaylist = new Map(prevPlaylist);
      newPlaylist.delete(trackId);
      return newPlaylist;
    });
  }

  // Pins a track to the playlist
  function pinToPlaylist(trackId: string) {
    setPlaylist((prevPlaylist) => {
      // Clone prev playlist to avoid mutation
      const newPlaylist = new Map(prevPlaylist);

      // Retrieve existing track object
      const trackObject = newPlaylist.get(trackId);

      if (trackObject) {
        const updatedTrackObject = {
          ...trackObject,
          pinned: !trackObject.pinned,
        };
        newPlaylist.set(trackId, updatedTrackObject);
      }

      return newPlaylist;
    });
  }

  // Handles track menu open/close
  function handleTrackMenuClick(trackId: string) {
    setOpenTrackMenuId((prev) => (prev === trackId ? "" : trackId));
  }

  const rows = Array.from(playlist).map((track) => (
    <Table.Tr key={track[1].track.id}>
      <TrackRow
        pinToPlaylist={pinToPlaylist}
        listType="Playlist"
        track={track[1]}
        handleSaveClick={handleSaveClick}
        loadingSaveStatusTrackIds={loadingSaveStatusTrackIds}
      />
      <Table.Td>
        <Menu
          opened={track[1].track.id === openTrackMenuId}
          onClose={() => setOpenTrackMenuId("")}
          position="bottom-end"
          offset={1}
          shadow="md"
          width={100}
        >
          <Menu.Target>
            <Button
              ref={(el) => (trackMenuRefs.current[track[1].track.id] = el)}
              className={`${styles.trackActionsMenu} ${
                track[1].track.id === openTrackMenuId ? styles.opened : ""
              }`}
              onClick={() => handleTrackMenuClick(track[1].track.id)}
            >
              <IconDotsVertical stroke={2} size={16} />
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              color="rgba(255,255,255,0.8)"
              onClick={() => removeFromPlaylist(track[1].track.id)}
            >
              Remove
            </Menu.Item>
            <Menu.Item
              color="rgba(255,255,255,0.8)"
              onClick={() => pinToPlaylist(track[1].track.id)}
            >
              {track[1].pinned ? "Unpin" : "Pin"}
            </Menu.Item>
            {/*TODO <Menu.Item
              color="rgba(255,255,255,0.8)"
              onClick={() => console.log("opening features modal")}
            >
              View features
            </Menu.Item>

            <Menu.Item
              color="rgba(255,255,255,0.8)"
              onClick={() => console.log("playing track preview")}
            >
              Play track preview
            </Menu.Item> */}
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </Table.Tr>
  ));

  // Adds 5 more matches to playlist (and removes from matching tracks)
  function showMoreResults() {
    if (!matchingTracks) return null;
    const tempArray = Array.from(matchingTracks).slice(0, 5);

    let moreResults: Map<string, TrackObject> = new Map(tempArray);

    let updatedMatchingTracks: Map<string, TrackObject> = new Map(
      matchingTracks
    );
    for (const key of moreResults.keys()) {
      updatedMatchingTracks?.delete(key);
    }

    const updatedPlaylist: Map<string, TrackObject> = new Map([
      ...playlist!,
      ...moreResults,
    ]);
    setPlaylist(updatedPlaylist);
    setMatchingTracks(updatedMatchingTracks);
  }

  // Add all matches to playlist (and removes from matching tracks)
  function showAllResults() {
    let moreResults: Map<string, TrackObject> = new Map(matchingTracks);

    let updatedMatchingTracks: Map<string, TrackObject> = new Map(
      matchingTracks
    );
    for (const key of moreResults.keys()) {
      updatedMatchingTracks?.delete(key);
    }

    const updatedPlaylist: Map<string, TrackObject> = new Map([
      ...playlist!,
      ...moreResults,
    ]);
    setPlaylist(updatedPlaylist);
    4;
    setMatchingTracks(updatedMatchingTracks);
  }

  const playlistTime = calculatePlaylistTime(playlist);

  return (
    <div className={styles.playlistContainer}>
      <p>
        {playlist.size} songs, {playlistTime}
      </p>
      <Table
        highlightOnHoverColor="rgba(0,0,0,0.1)"
        withRowBorders={false}
        withColumnBorders={false}
        highlightOnHover
        className={styles.table}
      >
        <TableHead type="playlist" />
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
      {playlist.size === 0 && <div>No matches found.</div>}
      <SavePlaylistModal
        playlist={playlist}
        openSavePlaylist={openSavePlaylist}
        setOpenSavePlaylist={setOpenSavePlaylist}
      />
      <Group justify="flex-end" mt="md">
        {matchingTracks && matchingTracks.size > 5 && (
          <Button type="button" onClick={showMoreResults}>
            Show more (+5)
          </Button>
        )}
        {matchingTracks && matchingTracks.size > 0 && (
          <Button type="button" onClick={showAllResults}>
            Show all (+{matchingTracks.size})
          </Button>
        )}
        <Button type="button" onClick={() => setOpenSavePlaylist(true)}>
          Save as playlist
        </Button>
      </Group>
    </div>
  );
}
