import React  from 'react';
import AutoSizer from "react-virtualized-auto-sizer";
import {FixedSizeList as List} from "react-window";
import MusicCard from "@/components/MusicCard";
import {IMetadata} from "../../electron/main/music";

type IMusicsList = {
    musics : IMetadata[],
    onItemsClick : (index : number) => void,
    currentMusicIndex : number
    isPaused? : boolean
}

function MusicsList({musics , currentMusicIndex , onItemsClick , isPaused} : IMusicsList) {

    return (
        <div className="w-full min-h-full my-8">
            {

                <AutoSizer>
                    {({height, width}) => (
                        <List
                            height={height}
                            itemCount={musics?.length}
                            itemSize={52}
                            width={width}
                            overscanCount={10}
                        >
                            {
                                ({index, style}) => (
                                    <div style={style} key={index}
                                         onClick={() => onItemsClick(index)}
                                         className={`flex ${index %2 === 0 ? "bg-neutral-100": ""}`}
                                    >
                                        <MusicCard
                                            key={"items" + index} title={musics[index].title}
                                            artist={musics[index].artist}
                                            album={musics[index].album}
                                            picture={musics[index].picture}
                                            file={""}
                                            isPlaying={index === currentMusicIndex}
                                            isPaused={isPaused}
                                            albumArts={index === currentMusicIndex}
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