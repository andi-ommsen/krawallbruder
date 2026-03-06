import { useState } from 'react'
import ReactPlayer from 'react-player/youtube'
import './VideoPlayer.css'

export default function VideoPlayer({ url, title, thumbnail }) {
  const [playing, setPlaying] = useState(false)

  if (!url) return null

  return (
    <div className="video-player">
      {title && <h3 className="video-player__title">{title}</h3>}
      <div className="video-player__wrapper">
        <ReactPlayer
          url={url}
          width="100%"
          height="100%"
          controls
          playing={playing}
          light={thumbnail || true}
          onClickPreview={() => setPlaying(true)}
          className="video-player__react-player"
        />
      </div>
    </div>
  )
}
