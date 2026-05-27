import { useId } from 'react';

export type MyraBotAvatarSize = 'small' | 'medium' | 'large';
export type MyraBotAvatarVariant = 'full' | 'head';

interface MyraBotAvatarProps {
  size?: MyraBotAvatarSize;
  variant?: MyraBotAvatarVariant;
  className?: string;
}

export default function MyraBotAvatar({ size = 'medium', variant = 'full', className = '' }: MyraBotAvatarProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const id = (name: string) => `myra-bot-${uid}-${name}`;
  const url = (name: string) => `url(#${id(name)})`;

  return (
    <div className={`myra-bot-avatar myra-bot-avatar-${size} myra-bot-avatar-${variant} ${className}`.trim()} aria-hidden="true">
      <span className="myra-bot-ambient myra-bot-ambient-one" />
      <span className="myra-bot-ambient myra-bot-ambient-two" />
      <span className="myra-bot-ambient myra-bot-ambient-three" />

      <svg className="myra-bot-svg" viewBox="0 0 240 240" role="img">
        <defs>
          <radialGradient id={id('bg')} cx="50%" cy="43%" r="64%">
            <stop offset="0%" stopColor="#0c3659" stopOpacity="0.9" />
            <stop offset="46%" stopColor="#04182b" stopOpacity="0.66" />
            <stop offset="100%" stopColor="#010714" stopOpacity="0" />
          </radialGradient>

          <radialGradient id={id('floor')} cx="50%" cy="44%" r="52%">
            <stop offset="0%" stopColor="#b9fbff" stopOpacity="0.72" />
            <stop offset="35%" stopColor="#13d8ff" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#0068ff" stopOpacity="0" />
          </radialGradient>

          <linearGradient id={id('shell')} x1="18%" y1="4%" x2="86%" y2="96%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="23%" stopColor="#f4f9fd" />
            <stop offset="48%" stopColor="#adc0cf" />
            <stop offset="70%" stopColor="#4f6578" />
            <stop offset="88%" stopColor="#cfdce7" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>

          <linearGradient id={id('limb')} x1="20%" y1="6%" x2="82%" y2="96%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="32%" stopColor="#ccd9e3" />
            <stop offset="58%" stopColor="#697f92" />
            <stop offset="78%" stopColor="#142b3e" />
            <stop offset="100%" stopColor="#f3f9fd" />
          </linearGradient>

          <linearGradient id={id('joint')} x1="22%" y1="8%" x2="82%" y2="92%">
            <stop offset="0%" stopColor="#eaf5fb" />
            <stop offset="38%" stopColor="#768da0" />
            <stop offset="70%" stopColor="#081d30" />
            <stop offset="100%" stopColor="#d8e8f2" />
          </linearGradient>

          <radialGradient id={id('core')} cx="47%" cy="43%" r="58%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#9dfbff" />
            <stop offset="68%" stopColor="#0dd4ff" />
            <stop offset="100%" stopColor="#0078ff" stopOpacity="0.16" />
          </radialGradient>

          <radialGradient id={id('face')} cx="46%" cy="30%" r="76%">
            <stop offset="0%" stopColor="#183b5e" />
            <stop offset="42%" stopColor="#061527" />
            <stop offset="100%" stopColor="#01040c" />
          </radialGradient>

          <linearGradient id={id('face-glass')} x1="16%" y1="2%" x2="78%" y2="92%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="20%" stopColor="#c4f7ff" stopOpacity="0.15" />
            <stop offset="55%" stopColor="#020817" stopOpacity="0" />
            <stop offset="100%" stopColor="#00040b" stopOpacity="0.36" />
          </linearGradient>

          <radialGradient id={id('eye')} cx="46%" cy="45%" r="56%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="27%" stopColor="#9afaff" />
            <stop offset="62%" stopColor="#0bd8ff" />
            <stop offset="100%" stopColor="#0078ff" stopOpacity="0.18" />
          </radialGradient>

          <linearGradient id={id('cyan-line')} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#008cff" stopOpacity="0" />
            <stop offset="16%" stopColor="#0fd8ff" stopOpacity="0.9" />
            <stop offset="48%" stopColor="#e8feff" stopOpacity="1" />
            <stop offset="82%" stopColor="#10d4ff" stopOpacity="0.86" />
            <stop offset="100%" stopColor="#008cff" stopOpacity="0" />
          </linearGradient>

          <linearGradient id={id('gold-line')} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f6b62d" stopOpacity="0" />
            <stop offset="42%" stopColor="#ffe38a" stopOpacity="1" />
            <stop offset="100%" stopColor="#f6b62d" stopOpacity="0" />
          </linearGradient>

          <linearGradient id={id('emblem')} x1="16%" y1="0%" x2="84%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="42%" stopColor="#ddfdff" />
            <stop offset="100%" stopColor="#5beeff" />
          </linearGradient>

          <linearGradient id={id('panel-line')} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
            <stop offset="54%" stopColor="#42e7ff" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#041827" stopOpacity="0.56" />
          </linearGradient>

          <filter id={id('soft-glow')} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id={id('hard-glow')} x="-130%" y="-130%" width="360%" height="360%">
            <feGaussianBlur stdDeviation="7.5" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="0 0 0 0 0.02  0 0 0 0 0.72  0 0 0 0 1  0 0 0 0.78 0"
              result="cyanGlow"
            />
            <feMerge>
              <feMergeNode in="cyanGlow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id={id('ring-blur')} x="-90%" y="-160%" width="280%" height="420%">
            <feGaussianBlur stdDeviation="2.35" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id={id('robot-shadow')} x="-70%" y="-70%" width="240%" height="250%">
            <feDropShadow dx="0" dy="13" stdDeviation="11" floodColor="#020617" floodOpacity="0.7" />
            <feDropShadow dx="-5" dy="-2" stdDeviation="8" floodColor="#60e7ff" floodOpacity="0.32" />
            <feDropShadow dx="5" dy="1" stdDeviation="8" floodColor="#f6c14f" floodOpacity="0.14" />
          </filter>

          <clipPath id={id('face-clip')}>
            <rect x="65" y="54" width="110" height="67" rx="31" />
          </clipPath>
        </defs>

        <circle cx="120" cy="116" r="112" fill={url('bg')} />

        <g className="myra-bot-stars">
          <circle className="myra-bot-star myra-bot-star-one" cx="34" cy="62" r="1.7" fill="#ffd66d" />
          <circle className="myra-bot-star myra-bot-star-two" cx="198" cy="50" r="1.8" fill="#20d4ff" />
          <circle className="myra-bot-star myra-bot-star-three" cx="211" cy="116" r="1.4" fill="#ffd66d" />
          <circle className="myra-bot-star myra-bot-star-four" cx="40" cy="136" r="1.25" fill="#20d4ff" />
          <path className="myra-bot-star myra-bot-star-line" d="M36 134c18-61 141-87 171-18" fill="none" stroke="#0b8dff" strokeWidth="0.8" strokeLinecap="round" opacity="0.22" />
        </g>

        <g className="myra-bot-floor">
          <ellipse cx="120" cy="206" rx="108" ry="29" fill={url('floor')} opacity="0.74" />
          <ellipse className="myra-bot-floor-ring myra-bot-floor-ring-glow" cx="120" cy="203" rx="101" ry="24" fill="none" stroke="#0bd8ff" strokeWidth="6" opacity="0.22" filter={url('ring-blur')} />
          <ellipse className="myra-bot-floor-ring" cx="120" cy="202" rx="98" ry="23" fill="none" stroke="#0bd8ff" strokeWidth="2.45" opacity="0.92" />
          <ellipse className="myra-bot-floor-ring myra-bot-floor-ring-two" cx="120" cy="203" rx="70" ry="16.5" fill="none" stroke="#7df2ff" strokeWidth="1.45" opacity="0.62" />
          <ellipse className="myra-bot-floor-ring myra-bot-floor-ring-three" cx="120" cy="204" rx="43" ry="10.2" fill="none" stroke="#087fff" strokeWidth="1.1" opacity="0.56" strokeDasharray="2.2 3.4" />
        </g>

        <g className="myra-bot-float" filter={url('robot-shadow')}>
          <g className="myra-bot-orbit-back">
            <ellipse cx="120" cy="161" rx="96" ry="29" fill="none" stroke="#0bd8ff" strokeWidth="7" opacity="0.13" filter={url('ring-blur')} />
            <ellipse cx="120" cy="161" rx="92" ry="28" fill="none" stroke="#0bd8ff" strokeWidth="2.2" opacity="0.4" />
            <path d="M28 162c34-26 150-36 184-1" fill="none" stroke={url('cyan-line')} strokeWidth="2" strokeLinecap="round" opacity="0.92" />
          </g>

          <g className="myra-bot-body">
            <rect x="100" y="119" width="40" height="25" rx="12" fill="#081827" stroke="#6f8798" strokeWidth="1.4" />
            <rect x="104" y="119" width="32" height="18" rx="8" fill="#142c40" opacity="0.78" />
            <path className="myra-bot-body-rim" d="M70 151c2.3-31 21.8-48 50-48s47.7 17 50 48l-2.6 29.7c-12.5 18.5-82.3 18.5-94.8 0L70 151Z" fill="#0bd8ff" opacity="0.16" filter={url('soft-glow')} />
            <path d="M76 150c2.1-27.7 19.5-41.5 44-41.5s41.9 13.8 44 41.5l-2.7 28.6c-10.4 15.6-72.2 15.6-82.6 0L76 150Z" fill={url('shell')} stroke="#eaf9ff" strokeOpacity="0.72" strokeWidth="1.45" />
            <path d="M84 150c1.6-21.2 15.6-33.4 36-33.4s34.4 12.2 36 33.4l-2.1 25.2c-8.1 10.4-59.7 10.4-67.8 0L84 150Z" fill="#ffffff" opacity="0.16" />
            <path d="M94 134c8 8.5 16.8 13 26 15.2 9.2-2.2 18-6.7 26-15.2" fill="none" stroke={url('panel-line')} strokeWidth="1.2" strokeLinecap="round" opacity="0.78" />
            <path d="M91 143c-4.4 13.4-4.6 27.5-1.6 41" fill="none" stroke="#10304a" strokeWidth="1.05" strokeLinecap="round" opacity="0.46" />
            <path d="M149 143c4.4 13.4 4.6 27.5 1.6 41" fill="none" stroke="#041525" strokeWidth="1.05" strokeLinecap="round" opacity="0.48" />
            <path d="M120 138v51" fill="none" stroke="#061827" strokeWidth="1.05" strokeLinecap="round" opacity="0.36" />

            <g className="myra-bot-arm myra-bot-arm-left">
              <circle cx="75" cy="141" r="15.5" fill={url('joint')} stroke="#071b2d" strokeWidth="3.2" />
              <path d="M68 150c-14 7-22.4 19-25 34" fill="none" stroke={url('limb')} strokeWidth="17.8" strokeLinecap="round" />
              <circle cx="45.8" cy="183" r="8.4" fill={url('joint')} stroke="#071b2d" strokeWidth="2.5" />
              <path d="M47 188c6 7.8 14.2 11.2 25 10.5" fill="none" stroke={url('limb')} strokeWidth="15.5" strokeLinecap="round" />
              <ellipse cx="66.5" cy="194.5" rx="14.2" ry="12.4" fill={url('shell')} stroke="#eaf9ff" strokeOpacity="0.52" strokeWidth="1" />
              <circle cx="54.8" cy="197.7" r="5.3" fill={url('shell')} stroke="#0c2437" strokeOpacity="0.45" />
              <circle cx="63.5" cy="204.4" r="4.8" fill={url('shell')} stroke="#0c2437" strokeOpacity="0.4" />
              <circle cx="73.2" cy="202.6" r="4.9" fill={url('shell')} stroke="#0c2437" strokeOpacity="0.38" />
              <circle cx="81.3" cy="197.5" r="4.7" fill={url('shell')} stroke="#0c2437" strokeOpacity="0.34" />
              <circle className="myra-bot-hand-glow" cx="65.6" cy="185.5" r="7.2" fill={url('core')} filter={url('hard-glow')} opacity="0.72" />
            </g>

            <g className="myra-bot-arm myra-bot-arm-right">
              <circle cx="165" cy="141" r="15.5" fill={url('joint')} stroke="#071b2d" strokeWidth="3.2" />
              <path d="M172 150c14 7 22.4 19 25 34" fill="none" stroke={url('limb')} strokeWidth="17.8" strokeLinecap="round" />
              <circle cx="194.2" cy="183" r="8.4" fill={url('joint')} stroke="#071b2d" strokeWidth="2.5" />
              <path d="M193 188c-6 7.8-14.2 11.2-25 10.5" fill="none" stroke={url('limb')} strokeWidth="15.5" strokeLinecap="round" />
              <ellipse cx="173.5" cy="194.5" rx="14.2" ry="12.4" fill={url('shell')} stroke="#eaf9ff" strokeOpacity="0.52" strokeWidth="1" />
              <circle cx="185.2" cy="197.7" r="5.3" fill={url('shell')} stroke="#0c2437" strokeOpacity="0.45" />
              <circle cx="176.5" cy="204.4" r="4.8" fill={url('shell')} stroke="#0c2437" strokeOpacity="0.4" />
              <circle cx="166.8" cy="202.6" r="4.9" fill={url('shell')} stroke="#0c2437" strokeOpacity="0.38" />
              <circle cx="158.7" cy="197.5" r="4.7" fill={url('shell')} stroke="#0c2437" strokeOpacity="0.34" />
              <circle className="myra-bot-hand-glow" cx="174.4" cy="185.5" r="7.2" fill={url('core')} filter={url('hard-glow')} opacity="0.72" />
            </g>

            <circle className="myra-bot-core" cx="120" cy="159" r="18.8" fill={url('core')} filter={url('hard-glow')} />
            <circle cx="120" cy="159" r="15" fill="#05283f" opacity="0.74" />
            <circle cx="120" cy="159" r="14.3" fill="none" stroke="#0bdbff" strokeWidth="2.2" opacity="0.86" />
            <circle cx="120" cy="159" r="10.7" fill={url('core')} opacity="0.42" />
            <text className="myra-bot-emblem" x="120" y="166" textAnchor="middle" fill={url('emblem')} filter={url('soft-glow')}
              style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', fontSize: 22, fontWeight: 900, letterSpacing: -1 }}>
              M
            </text>
            <circle cx="116" cy="153.8" r="2.6" fill="#ffffff" opacity="0.72" />
          </g>

          <g className="myra-bot-orbit-front">
            <path d="M25 170c43 27 147 27 190 0" fill="none" stroke="#0bd8ff" strokeWidth="12" strokeLinecap="round" opacity="0.08" filter={url('ring-blur')} />
            <path d="M28 170c41 23 143 23 184 0" fill="none" stroke={url('cyan-line')} strokeWidth="4.35" strokeLinecap="round" filter={url('soft-glow')} />
            <path d="M48 158c29-7.6 55.4-9.8 92-7.2" fill="none" stroke={url('gold-line')} strokeWidth="2.1" strokeLinecap="round" opacity="0.72" />
          </g>

          <g className="myra-bot-head">
            <path d="M120 39V20" stroke="#8ca3b3" strokeWidth="4" strokeLinecap="round" />
            <circle className="myra-bot-antenna" cx="120" cy="16" r="6.3" fill="#ffc33d" filter={url('soft-glow')} />
            <ellipse cx="120" cy="40" rx="31" ry="7" fill="#ffffff" opacity="0.34" />
            <ellipse cx="48" cy="86" rx="21" ry="29" fill={url('shell')} stroke="#dff8ff" strokeOpacity="0.7" strokeWidth="1.2" />
            <ellipse cx="53" cy="86" rx="14" ry="23" fill="#081827" stroke="#7eefff" strokeOpacity="0.45" strokeWidth="1.3" />
            <ellipse cx="192" cy="86" rx="21" ry="29" fill={url('shell')} stroke="#dff8ff" strokeOpacity="0.7" strokeWidth="1.2" />
            <ellipse cx="187" cy="86" rx="14" ry="23" fill="#081827" stroke="#7eefff" strokeOpacity="0.45" strokeWidth="1.3" />
            <rect x="45" y="35" width="150" height="98" rx="48" fill={url('shell')} stroke="#ffffff" strokeOpacity="0.76" strokeWidth="1.5" />
            <path d="M69 45c28-18 76-19 104-1" fill="none" stroke="#ffffff" strokeWidth="9" strokeLinecap="round" opacity="0.34" />
            <path d="M86 41c0.8 8 1.7 14.5 3.4 21" fill="none" stroke="#1e4863" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
            <path d="M154 41c-0.8 8-1.7 14.5-3.4 21" fill="none" stroke="#7a8f9e" strokeWidth="1.4" strokeLinecap="round" opacity="0.52" />
            <rect x="65" y="54" width="110" height="67" rx="31" fill={url('face')} stroke="#071827" strokeWidth="3.2" />
            <g clipPath={`url(#${id('face-clip')})`}>
              <rect x="65" y="54" width="110" height="67" rx="31" fill={url('face-glass')} opacity="0.94" />
              <ellipse cx="89" cy="64" rx="20" ry="9" fill="#ffffff" opacity="0.22" transform="rotate(-18 89 64)" />
              <path d="M76 61c19-8.8 66-9.2 88 0" fill="none" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.2" />
              <ellipse cx="158" cy="91" rx="16" ry="30" fill="#00050d" opacity="0.24" />
            </g>
            <circle className="myra-bot-eye-glow" cx="99" cy="85" r="13.2" fill="#12dfff" opacity="0.2" filter={url('hard-glow')} />
            <circle className="myra-bot-eye-glow" cx="141" cy="85" r="13.2" fill="#12dfff" opacity="0.2" filter={url('hard-glow')} />
            <circle className="myra-bot-eye myra-bot-eye-left" cx="99" cy="85" r="8" fill={url('eye')} filter={url('hard-glow')} />
            <circle className="myra-bot-eye myra-bot-eye-right" cx="141" cy="85" r="8" fill={url('eye')} filter={url('hard-glow')} />
            <path className="myra-bot-smile" d="M107 106c7.8 6.4 18.2 6.4 26 0" fill="none" stroke="#4bedff" strokeWidth="2.4" strokeLinecap="round" opacity="0.95" />
          </g>
        </g>
      </svg>
    </div>
  );
}
