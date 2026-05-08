import React from 'react';

export default function CameraStream({ title = 'Camera stream', status = 'Live', streamUrl, posterUrl }) {
  return (
    <section className="camera-stream">
      <div className="camera-stream__header">
        <h3>{title}</h3>
        <span>{status}</span>
      </div>
      <div className="camera-stream__viewport">
        {streamUrl ? (
          <video controls muted playsInline poster={posterUrl} src={streamUrl} />
        ) : (
          <div className="camera-stream__placeholder">
            Live video feed will appear here.
          </div>
        )}
      </div>
    </section>
  );
}

