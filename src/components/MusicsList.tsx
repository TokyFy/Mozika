import React from 'react';
import AutoSizer from "react-virtualized-auto-sizer";
import {FixedSizeList as List} from "react-window";
import MusicCard from "@/components/MusicCard";
import {IMetadata} from "@electron/main/music";

type IMusicsList = {
    musics: IMetadata[],
    onItemsClick: (index: number) => void,
    onContextMenu : (index: number) => void,
    currentMusicIndex: number
    isPaused?: boolean,
    listRef?: React.Ref<any>,
    playerRef : React.RefObject<HTMLAudioElement>
    marker? : number
}

function MusicsList({musics, currentMusicIndex, onItemsClick, isPaused, listRef , playerRef , marker , onContextMenu}: IMusicsList) {

    return (
        <div className="w-full min-h-full">
            {

                <AutoSizer>
                    {({height, width}) => (
                        <List
                            height={height}
                            itemCount={musics?.length}
                            itemSize={52}
                            width={width}
                            overscanCount={5}
                            ref={listRef}
                        >
                            {
                                ({index, style, isScrolling}) => (
                                    <div style={style} key={index}
                                         onClick={() => onItemsClick(index)}
                                         onContextMenu={()=>onContextMenu(index)}
                                         className={`flex duration-1000 transition-all border border-dashed ${marker === index ? "border-neutral-300 dark:border-neutral-500" : "border-transparent"} ${index % 2 === 0 ? "bg-neutral-100 dark:bg-neutral-800 dark:bg-opacity-10" : ""}`}
                                    >
                                        <MusicCard
                                            key={"items" + index}
                                            title={musics[index].title}
                                            artist={musics[index].artist}
                                            album={musics[index].album}
                                            picture={musics[index].picture}
                                            file={""}
                                            isPlaying={index === currentMusicIndex}
                                            isPaused={isPaused}
                                            albumArts={index === currentMusicIndex}
                                            playerRef={playerRef}
                                            index={index}
                                        />
                                    </div>
                                )
                            }
                        </List>
                    )}
                </AutoSizer>
            }
        </div>
    );
}

export default MusicsList;
