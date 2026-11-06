import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Check,
  CheckCheck,
  Volume2,
  VolumeX,
  RotateCcw,
  QrCode,
  Download,
  Smartphone,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import QRCode from 'qrcode';

interface FloatingWhatsAppProps {
  defaultService?: string;
}

export type ReadReceiptStatus = 'sent' | 'delivered' | 'read';

// Standard vCard 3.0 string for Sudip Bhandari (compatible with iOS and Android camera scanners)
const SUDIP_VCARD_DATA = `BEGIN:VCARD
VERSION:3.0
FN:Sudip Bhandari
N:Bhandari;Sudip;;;
TITLE:Creative Graphic Designer & Digital Marketer
ORG:Sudip Bhandari Design
TEL;TYPE=CELL,VOICE,PREF:+9779840631570
TEL;TYPE=WHATSAPP:+9779840631570
EMAIL;TYPE=INTERNET,PREF:bhandarysudip5@gmail.com
URL:https://www.sudipbhandari5.com.np
NOTE:Creative Graphic Designer & Digital Marketer. Available for branding, UI/UX, and marketing creatives.
ADR;TYPE=WORK:;;Kathmandu;;;Nepal
END:VCARD`;

// Subtle organic "pop" sound synthesizer via Web Audio API (zero external asset dependencies)
function playPopSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;

    // Gentle upward pitch sweep characteristic of a water droplet / messaging bubble pop
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(820, now + 0.035);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.08);

    // Fast, smooth attack and decay envelope
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.16, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  } catch {
    // Ignore any browser auto-play restrictions gracefully
  }
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ defaultService }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(true);
  const [showGreeting, setShowGreeting] = useState(false);
  
  // Sound effects state with localStorage persistence (defaults to enabled)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('wa_sound_enabled') !== 'false';
    } catch {
      return true;
    }
  });

  const prevOpenRef = useRef(false);

  const initialMsg = defaultService
    ? `Hello Sudip, I visited your portfolio and would like to discuss a project regarding ${defaultService}.`
    : 'Hello Sudip, I visited your portfolio and would like to discuss a project.';

  const [customMessage, setCustomMessage] = useState(initialMsg);

  useEffect(() => {
    if (defaultService) {
      setCustomMessage(`Hello Sudip, I visited your portfolio and would like to discuss a project regarding ${defaultService}.`);
    }
  }, [defaultService]);

  const [activeTab, setActiveTab] = useState<'chat' | 'qr'>('chat');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [vCardDownloaded, setVCardDownloaded] = useState<boolean>(false);

  // Generate high-resolution vCard QR code data URL once
  useEffect(() => {
    QRCode.toDataURL(SUDIP_VCARD_DATA, {
      width: 260,
      margin: 1.5,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error('Failed to generate vCard QR Code:', err));
  }, []);

  const handleDownloadVCard = () => {
    const blob = new Blob([SUDIP_VCARD_DATA], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Sudip_Bhandari.vcf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setVCardDownloaded(true);
    setTimeout(() => setVCardDownloaded(false), 2500);
  };

  const [readReceipt, setReadReceipt] = useState<ReadReceiptStatus>('sent');
  const [simulationKey, setSimulationKey] = useState(0);
  const [messageTime, setMessageTime] = useState<string>('Just now');

  // Trigger read receipt progression: Sent (0s) -> Delivered (after 2s) -> Read (after 5s)
  useEffect(() => {
    if (!isOpen) {
      prevOpenRef.current = false;
      setIsTyping(false);
      setShowGreeting(false);
      setReadReceipt('sent');
      return;
    }

    // Play subtle opening pop sound
    if (!prevOpenRef.current && soundEnabled) {
      playPopSound();
    }
    prevOpenRef.current = true;

    // Capture current formatted time
    try {
      const now = new Date();
      setMessageTime(now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
    } catch {
      setMessageTime('Just now');
    }

    // 0s: Message is Sent (Single check)
    setReadReceipt('sent');
    setIsTyping(false);
    setShowGreeting(false);

    // After 2 seconds: Message is Delivered to recipient's device (Double gray check)
    const deliveredTimer = setTimeout(() => {
      setReadReceipt('delivered');
    }, 2000);

    // After 5 seconds: Message is Read by Sudip (Double blue check)
    const readTimer = setTimeout(() => {
      setReadReceipt('read');
      // Sudip opens the chat and starts typing his reply
      setIsTyping(true);
    }, 5000);

    // After 6.5 seconds (1.5s of typing): Sudip's reply message is sent!
    const replyTimer = setTimeout(() => {
      setIsTyping(false);
      setShowGreeting(true);
      if (soundEnabled) {
        playPopSound();
      }
    }, 6500);

    return () => {
      clearTimeout(deliveredTimer);
      clearTimeout(readTimer);
      clearTimeout(replyTimer);
    };
  }, [isOpen, simulationKey, soundEnabled]);

  const restartSimulation = () => {
    setSimulationKey(prev => prev + 1);
  };

  const toggleSound = () => {
    setSoundEnabled(prev => {
      const next = !prev;
      try {
        localStorage.setItem('wa_sound_enabled', String(next));
      } catch {}
      if (next) {
        playPopSound();
      }
      return next;
    });
  };

  const getEncodedUrl = (msg: string) => {
    return `https://wa.me/9779840631570?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Quick chat popup */}
      {isOpen && (
        <div className="mb-3 w-84 max-w-[calc(100vw-3rem)] rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#121215] shadow-2xl p-4 text-stone-900 dark:text-stone-100 transition-all animate-in fade-in slide-in-from-bottom-2">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                {/* Avatar with subtle slow-pulsing green glow border */}
                <div className="w-9 h-9 rounded-full overflow-hidden bg-stone-100 dark:bg-stone-800 border-2 avatar-online-glow transition-all">
                  <img
                    src="/assets/aistudio/sudip_3f6de287.jpeg"
                    alt="Sudip Bhandari"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-[center_15%]"
                  />
                </div>
                {/* Active indicator dot with subtle breathing ping */}
                <span className="absolute bottom-0 right-0 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 [animation-duration:3.2s]" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-white dark:border-[#121215]" />
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold leading-tight">Sudip Bhandari</h4>
                {isTyping ? (
                  <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    <span>typing</span>
                    <span className="inline-flex gap-0.5 items-center">
                      <span className="w-1 h-1 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1 h-1 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1 h-1 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-bounce" />
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[11px] text-stone-500 dark:text-stone-400">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Online</span>
                    <span>· Replies quickly</span>
                  </div>
                )}
              </div>
            </div>

            {/* Controls: QR Code contact toggle, Replay simulation, Sound effect toggle, and close button */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab(prev => (prev === 'chat' ? 'qr' : 'chat'))}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'qr'
                    ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-semibold'
                    : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
                title={activeTab === 'qr' ? 'Switch to Chat view' : 'Scan QR code to save contact (vCard)'}
                aria-label="Toggle QR code contact card"
              >
                <QrCode className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={restartSimulation}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                title="Replay Read Receipt simulation (Sent -> Delivered -> Read)"
                aria-label="Replay Read Receipt simulation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={toggleSound}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  soundEnabled
                    ? 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800'
                    : 'text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
                aria-label={soundEnabled ? 'Mute pop sound effect' : 'Unmute pop sound effect'}
                title={soundEnabled ? 'Sound effects enabled (Click to mute)' : 'Sound effects muted (Click to enable)'}
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                aria-label="Close WhatsApp dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* View Mode Switcher: Chat vs. QR Contact Card */}
          <div className="flex items-center gap-1 p-0.5 bg-stone-100 dark:bg-stone-800/80 rounded-xl my-2 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-1 px-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-white dark:bg-[#121215] text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Quick Chat</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('qr')}
              className={`flex-1 py-1 px-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'qr'
                  ? 'bg-white dark:bg-[#121215] text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-600" />
              <span>Save Contact (QR)</span>
            </button>
          </div>

          {activeTab === 'qr' ? (
            /* QR Code Contact Card View */
            <div className="py-2 space-y-3 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-3 bg-stone-50 dark:bg-stone-900/60 rounded-xl border border-stone-200/80 dark:border-stone-800 text-center space-y-2.5">
                {/* QR Code Container with High-Contrast Crisp Backing */}
                <div className="relative inline-block p-2.5 bg-white rounded-2xl shadow-sm border border-stone-200">
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt="Sudip Bhandari vCard Contact QR Code"
                      className="w-40 h-40 mx-auto rounded-lg"
                    />
                  ) : (
                    <div className="w-40 h-40 flex items-center justify-center text-xs text-stone-400">
                      Generating vCard QR Code...
                    </div>
                  )}
                  {/* Center WhatsApp icon badge */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md border-2 border-white pointer-events-none">
                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <h5 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    Sudip Bhandari
                  </h5>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    Creative Graphic Designer & Digital Marketer
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                    +977 9840631570 · bhandarysudip5@gmail.com
                  </p>
                </div>

                {/* Scan Instruction */}
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-600 dark:text-stone-300 font-medium pt-0.5 bg-emerald-50 dark:bg-emerald-950/40 py-1.5 px-2 rounded-lg border border-emerald-200/60 dark:border-emerald-900/40">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Scan with phone camera to save contact instantly</span>
                </div>
              </div>

              {/* Action Buttons: Direct .vcf download and WhatsApp */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleDownloadVCard}
                  className="w-full py-2.5 px-3 bg-stone-900 text-white dark:bg-white dark:text-stone-950 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all cursor-pointer shadow-xs"
                >
                  {vCardDownloaded ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                      <span>Contact File (.vcf) Saved!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .vcf Contact File</span>
                    </>
                  )}
                </button>

                <a
                  href={getEncodedUrl(customMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Open WhatsApp (+977 9840631570)</span>
                </a>
              </div>
            </div>
          ) : (
            /* Interactive Chat Window & Read Receipt Simulation */
            <div className="py-2.5 space-y-2.5">
              {/* Simulation Status Tracker Pill */}
              <div className="flex items-center justify-between text-[10px] px-2.5 py-1 rounded-lg bg-stone-100/80 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 text-stone-500 select-none">
                <span className="font-medium text-stone-600 dark:text-stone-400">Read Receipt:</span>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-0.5 transition-colors duration-200 ${
                    readReceipt === 'sent' ? 'font-bold text-stone-800 dark:text-stone-200' : 'text-stone-400'
                  }`}>
                    <Check className="w-3 h-3 text-[#8696a0]" />
                    <span>Sent</span>
                  </span>
                  <span className="text-stone-300 dark:text-stone-600">→</span>
                  <span className={`inline-flex items-center gap-0.5 transition-colors duration-200 ${
                    readReceipt === 'delivered' ? 'font-bold text-stone-800 dark:text-stone-200' : 'text-stone-400'
                  }`}>
                    <CheckCheck className="w-3 h-3 text-[#8696a0]" />
                    <span>Delivered (2s)</span>
                  </span>
                  <span className="text-stone-300 dark:text-stone-600">→</span>
                  <span className={`inline-flex items-center gap-0.5 transition-colors duration-200 ${
                    readReceipt === 'read' ? 'font-bold text-[#53bdeb]' : 'text-stone-400'
                  }`}>
                    <CheckCheck className={`w-3 h-3 ${readReceipt === 'read' ? 'text-[#53bdeb]' : 'text-stone-400'}`} />
                    <span>Read (5s)</span>
                  </span>
                </div>
              </div>

              {/* Visitor's Outgoing Message Bubble (Right-aligned, WhatsApp green) */}
              <div className="flex flex-col items-end animate-in fade-in duration-200">
                <div className="max-w-[88%] p-2.5 px-3 bg-[#d9fdd3] dark:bg-[#005c4b] text-stone-900 dark:text-stone-100 rounded-2xl rounded-tr-xs text-xs leading-relaxed shadow-xs">
                  <p>
                    {defaultService
                      ? `Hello Sudip, I'm interested in discussing a project regarding ${defaultService}.`
                      : 'Hello Sudip, I visited your portfolio and would like to discuss a project.'}
                  </p>

                  {/* Bubble Footer: Time + Live Read Receipt Indicator */}
                  <div className="flex items-center justify-end gap-1.5 mt-1 text-[10px] text-stone-600/80 dark:text-stone-300/80 select-none">
                    <span className="tabular-nums text-[10px] opacity-80">{messageTime}</span>

                    <span
                      className="inline-flex items-center gap-1 transition-all duration-300"
                      title={`Receipt status: ${readReceipt === 'sent' ? 'Sent (single check)' : readReceipt === 'delivered' ? 'Delivered (double gray check at 2s)' : 'Read (double blue check at 5s)'}`}
                    >
                      <span className={`text-[9px] font-semibold transition-colors duration-300 ${
                        readReceipt === 'read' ? 'text-[#53bdeb]' : 'text-stone-500 dark:text-stone-300'
                      }`}>
                        {readReceipt === 'sent' ? 'Sent' : readReceipt === 'delivered' ? 'Delivered' : 'Read'}
                      </span>

                      {readReceipt === 'sent' && (
                        <Check className="w-3.5 h-3.5 text-[#8696a0] animate-in fade-in zoom-in-75 duration-200 stroke-[2.2]" />
                      )}
                      {readReceipt === 'delivered' && (
                        <CheckCheck className="w-3.5 h-3.5 text-[#8696a0] animate-in fade-in zoom-in-75 duration-200 stroke-[2.2]" />
                      )}
                      {readReceipt === 'read' && (
                        <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] animate-in fade-in scale-110 duration-300 stroke-[2.4]" />
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sudip's Typing Bubble (Triggers after message is Read) */}
              {isTyping && (
                <div className="flex items-end gap-2 animate-in fade-in duration-200">
                  <div className="p-2.5 px-3.5 bg-stone-100 dark:bg-stone-800/90 rounded-2xl rounded-bl-sm flex items-center gap-1.5 shadow-2xs">
                    <span className="w-1.5 h-1.5 bg-stone-400 dark:bg-stone-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-stone-400 dark:bg-stone-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-stone-400 dark:bg-stone-500 rounded-full animate-bounce" />
                  </div>
                </div>
              )}

              {/* Sudip's Incoming Response Bubble */}
              {showGreeting && (
                <div className="flex flex-col items-start gap-1 animate-in fade-in slide-in-from-bottom-1 duration-200">
                  <div className="max-w-[88%] p-2.5 px-3 bg-stone-100 dark:bg-stone-800/90 rounded-2xl rounded-bl-xs text-xs text-stone-800 dark:text-stone-200 leading-relaxed shadow-2xs">
                    Hi there! 👋 I'm ready to discuss your graphic design, UI/UX, or digital branding project. Send me your ideas below!
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-stone-400 pl-1">
                    <span>Just now</span>
                  </div>
                </div>
              )}

              {/* Quick shortcut to switch to QR code */}
              <div className="flex items-center justify-between pt-0.5 px-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setActiveTab('qr')}
                  className="text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 font-medium cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Scan QR to save Sudip to Contacts</span>
                </button>
              </div>

              <div className="pt-1">
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  Your message to Sudip:
                </label>
                <textarea
                  rows={2}
                  value={customMessage}
                  onChange={e => setCustomMessage(e.target.value)}
                  placeholder="Write your project details or questions..."
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-stone-900 dark:text-stone-100 leading-relaxed resize-none"
                />
                <p className="text-[10px] text-stone-400 mt-0.5">
                  Opens directly in WhatsApp or WhatsApp Web.
                </p>
              </div>

              {/* Action Button */}
              <a
                href={getEncodedUrl(customMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Open in WhatsApp (+977 9840631570)</span>
              </a>
            </div>
          )}
        </div>
      )}

      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-label="Chat on WhatsApp with Sudip Bhandari"
        className="group flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
      >
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="text-xs font-semibold tracking-wide hidden sm:inline">WhatsApp</span>
      </button>
    </div>
  );
};
