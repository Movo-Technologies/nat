'use client';
/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- The scrollable transcript must support keyboard scrolling. */
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check, RotateCcw, Pause } from 'lucide-react';
import { Pulse } from './site-shell';
import content from '@/content/marketing.json';
import { track } from '@/lib/analytics';
export function NatDemo() {
  const [beat, setBeat] = useState(8);
  const [playing, setPlaying] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const completed = useRef(false);
  useEffect(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const timer = setTimeout(() => {
      if (!motion.matches && !document.hidden) {
        setBeat(1);
        setPlaying(true);
        track('demo_started', { mode: 'auto' });
      }
    }, 800);
    const change = () => {
      if (motion.matches) {
        setPlaying(false);
        setBeat(8);
      }
    };
    motion.addEventListener('change', change);
    return () => {
      clearTimeout(timer);
      motion.removeEventListener('change', change);
    };
  }, []);
  useEffect(() => {
    if (!playing || beat >= 8) return;
    const t = setInterval(() => {
      if (document.hidden) return;
      setBeat((b) => {
        if (b >= 8) {
          return 8;
        }
        return b + 1;
      });
    }, 1800);
    return () => clearInterval(t);
  }, [playing, beat]);
  useEffect(() => {
    const node = messagesRef.current;
    if (node && playing) node.scrollTop = node.scrollHeight;
    if (playing && beat === 8 && !completed.current) {
      completed.current = true;
      track('demo_completed', { loop_number: 1 });
    }
  }, [beat, playing]);
  return (
    <div className="demo-wrap" id="demo" tabIndex={-1}>
      <div className="demo-topline">
        <span>YOUR WEBSITE, IN CONVERSATION</span>
        <ArrowUpRight size={17} />
      </div>
      <div className="demo">
        <div className="demo-header">
          <Pulse />
          <div>
            <strong>Nat</strong>
            <span>Here to help you move forward.</span>
          </div>
          <span className="demo-live">
            <i /> Online
          </span>
        </div>
        <div
          ref={messagesRef}
          className="demo-messages"
          aria-live="off"
          tabIndex={0}
          aria-label="Scripted product concept conversation"
          onFocus={() => setPlaying(false)}
          onPointerDown={() => setPlaying(false)}
        >
          {content.demo.slice(0, beat).map(([n, speaker, msg]) => {
            const who = speaker === 'UI' ? 'route' : speaker.toLowerCase();
            const clean = msg
              .replace('Route card appears: ', '')
              .replace(/^“|”$/g, '');
            return (
              <div key={n} className={'message ' + who}>
                {who === 'nat' && <span className="nat-label">Nat</span>}
                {who === 'route' && <Check size={16} />}
                <p>{clean}</p>
                {n === '8' && (
                  <small>
                    <Check size={12} /> Conversation routed
                  </small>
                )}
              </div>
            );
          })}
        </div>
        <div className="demo-bottom">
          <span>
            <span className="status-dot" /> Product concept demo
          </span>
          <button
            onClick={() => {
              if (playing && beat < 8) {
                setPlaying(false);
                return;
              }
              setBeat(1);
              completed.current = false;
              track('demo_started', { mode: 'manual' });
              setPlaying(
                !matchMedia('(prefers-reduced-motion: reduce)').matches,
              );
              if (matchMedia('(prefers-reduced-motion: reduce)').matches)
                setBeat(8);
            }}
          >
            {playing && beat < 8 ? (
              <>
                <Pause size={14} />
                Pause
              </>
            ) : (
              <>
                <RotateCcw size={14} />
                Replay
              </>
            )}
          </button>
        </div>
      </div>
      <div className="demo-caption">
        <span>More than an answer. A next step.</span>
        <ArrowUpRight size={17} />
      </div>
    </div>
  );
}
