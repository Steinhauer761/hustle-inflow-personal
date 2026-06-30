import { motion } from 'framer-motion';
import { useState } from 'react';

export default function PageHero({ imageUrl, videoUrl, title, subtitle, emoji, children, overlayColor = 'from-background/90 via-background/40 to-background/90' }) {
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-b-3xl mb-5" style={{ minHeight: 180 }}>
      {/* Background: video if provided and not failed, else image */}
      {videoUrl && !videoFailed ? (
        <video
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          onError={() => setVideoFailed(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <img
          src={imageUrl}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-b ${overlayColor}`} />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 px-5 pt-6 pb-5"
      >
        <p className="text-muted-foreground font-bold uppercase tracking-widest mb-1 text-[10px] flex items-center gap-1.5"><span className="text-sm">{emoji}</span> {subtitle}</p>
        <h1 className="text-foreground text-3xl font-display font-bold leading-tight drop-shadow-sm">{title}</h1>
        {children && <div className="mt-4">{children}</div>}
      </motion.div>
    </div>
  );
}