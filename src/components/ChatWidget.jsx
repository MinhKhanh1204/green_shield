import React, { useEffect, useMemo, useRef, useState } from 'react';
import NormalImg from '../assets/Normal.PNG';
import FlyingImg from '../assets/Flying.PNG';
import ChatboxImg from '../assets/chatbox.png';
import LogoFade from '../assets/logo-fade.png';
import LubiSound from '../assets/Lubi-sound.m4a';
import { getTopics, selectTopic, sendMessage } from '../services/chat';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import ScrollToBottom from 'react-scroll-to-bottom';
import '../styles/chat-widget.css';
import { Select } from 'antd';
import 'antd/dist/reset.css';
import { useTranslation } from 'react-i18next';

const ChatMarkdown = React.lazy(() => import('./ChatMarkdown'));

const TOPIC_LABELS = {
  vi: {
    tong_quan_du_an: 'Tổng quan dự án',
    san_pham: 'Sản phẩm',
    vat_lieu_cong_nghe: 'Vật liệu & công nghệ',
    thi_truong_khach_hang: 'Thị trường & khách hàng',
    esg_ben_vung: 'ESG & bền vững',
    rui_ro_thoai_von: 'Rủi ro & thoái vốn',
    doi_ngu: 'Đội ngũ',
    lien_ket_lien_he: 'Liên kết & liên hệ',
    ho_tro_khach_hang: 'Hỗ trợ khách hàng',
    ho_so_thanh_tich: 'Hồ sơ & thành tích',
    hoi_dap_chung: 'Hỏi đáp chung',
    company: 'Về chúng tôi',
    products: 'Về sản phẩm',
    order: 'Đặt hàng',
    shipping: 'Vận chuyển',
    payment: 'Thanh toán',
    contact: 'Liên hệ',
    sustainability: 'Bền vững',
    feedback: 'Góp ý',
    default: 'Tổng quan',
  },
  en: {
    tong_quan_du_an: 'Project overview',
    san_pham: 'Products',
    vat_lieu_cong_nghe: 'Materials & technology',
    thi_truong_khach_hang: 'Market & customers',
    esg_ben_vung: 'ESG & sustainability',
    rui_ro_thoai_von: 'Risks & exit strategy',
    doi_ngu: 'Team',
    lien_ket_lien_he: 'Links & contact',
    ho_tro_khach_hang: 'Customer support',
    ho_so_thanh_tich: 'Profile & achievements',
    hoi_dap_chung: 'General questions',
    company: 'About us',
    products: 'Products',
    order: 'Ordering',
    shipping: 'Shipping',
    payment: 'Payment',
    contact: 'Contact',
    sustainability: 'Sustainability',
    feedback: 'Feedback',
    default: 'Overview',
  },
};

const TOPIC_ICONS = {
  tong_quan_du_an: 'domain',
  san_pham: 'shopping_bag',
  vat_lieu_cong_nghe: 'biotech',
  thi_truong_khach_hang: 'groups',
  esg_ben_vung: 'eco',
  rui_ro_thoai_von: 'warning',
  doi_ngu: 'badge',
  lien_ket_lien_he: 'link',
  ho_tro_khach_hang: 'support_agent',
  ho_so_thanh_tich: 'workspace_premium',
  hoi_dap_chung: 'help',
  company: 'apartment',
  products: 'shopping_bag',
  order: 'shopping_cart',
  shipping: 'local_shipping',
  payment: 'credit_card',
  contact: 'call',
  sustainability: 'eco',
  feedback: 'rate_review',
  default: 'help',
};

const CHAT_COPY = {
  vi: {
    greeting: 'Vui lòng chọn chủ đề!',
    loadTopicsError: 'Không thể tải danh sách chủ đề.',
    selectTopicError: 'Không thể chọn chủ đề.',
    selectTopicFirst: 'Vui lòng chọn chủ đề trước.',
    sendMessageError: 'Không thể gửi tin nhắn.',
    unavailable: '- Lubot đang bận, bạn vui lòng liên hệ lại nhé!',
    notification: 'Bot đã phản hồi tin nhắn của bạn.',
    teaserPrefix: 'Bạn cần gì đó có',
    teaserSuffix: 'lo!',
    openChat: 'Mở chatbot',
    closeChat: 'Đóng chatbot',
    chatDialog: 'Chatbot GreenShield',
    loadingTopics: 'Đang tải chủ đề…',
    topicPlaceholder: 'Chọn chủ đề…',
    empty: 'Chọn một chủ đề, sau đó đặt câu hỏi cho Lubot.',
    messagePlaceholder: 'Nhập tin nhắn…',
  },
  en: {
    greeting: 'Please select a topic!',
    loadTopicsError: 'Unable to load topics.',
    selectTopicError: 'Unable to select the topic.',
    selectTopicFirst: 'Please select a topic first.',
    sendMessageError: 'Unable to send the message.',
    unavailable: '- Lubot is busy right now. Please try again later!',
    notification: 'Lubot has replied to your message.',
    teaserPrefix: 'Need a hand? Let',
    teaserSuffix: 'handle it!',
    openChat: 'Open chatbot',
    closeChat: 'Close chatbot',
    chatDialog: 'GreenShield chatbot',
    loadingTopics: 'Loading topics…',
    topicPlaceholder: 'Select a topic…',
    empty: 'Select a topic, then ask Lubot anything.',
    messagePlaceholder: 'Type your message…',
  },
};

// Simple floating chat widget overlay
export default function ChatWidget() {
  const { i18n } = useTranslation();
  const language = (i18n.resolvedLanguage || i18n.language || 'vi').toLowerCase().startsWith('en')
    ? 'en'
    : 'vi';
  const copy = CHAT_COPY[language];
  const topicLabels = TOPIC_LABELS[language];
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState({}); // {key: description}
  const [selectedTopic, setSelectedTopic] = useState('');
  const [messages, setMessages] = useState([]); // {role: 'user'|'ai'|'system', text}
  const [error, setError] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const inputRef = useRef(null);
  const panelRef = useRef(null);
  const [hasGreeted, setHasGreeted] = useState(false);
  const bodyRef = useRef(null);
  // Track whether the user is actively scrolling (vs. just being at a scrolled position)
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimerRef = useRef(null);
  const [showButton, setShowButton] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);
  const lubiAudioRef = useRef(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false,
  );

  const topicKeys = useMemo(() => Object.keys(topics), [topics]);

  useEffect(() => {
    if (!open) return;
    // Lazy-load topics when the widget opens
    (async () => {
      try {
        setLoading(true);
        setError('');
        const t = await getTopics();
        setTopics(t || {});
      } catch (e) {
        setError(e?.message || copy.loadTopicsError);
      } finally {
        setLoading(false);
      }
    })();
  }, [copy.loadTopicsError, open]);

  useEffect(() => {
    // Send a one-time greeting when the widget first opens
    if (open && !hasGreeted) {
      setMessages((prev) => ([
        ...prev,
        { role: 'system', text: copy.greeting },
      ]));
      setHasGreeted(true);
    }
  }, [copy.greeting, open, hasGreeted]);

  useEffect(() => {
    setMessages((prev) => prev.map((message) => {
      const isGreeting = message.role === 'system'
        && Object.values(CHAT_COPY).some((translation) => translation.greeting === message.text);
      return isGreeting ? { ...message, text: copy.greeting } : message;
    }));
  }, [copy.greeting]);

  useEffect(() => {
    // Ask permission for browser notifications once when opened
    if (open && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      try { Notification.requestPermission(); } catch { /* ignore */ }
    }
  }, [open]);

  // Keep input focused when widget is open
  useEffect(() => {
    if (!open) return;
    const focus = () => inputRef.current?.focus();
    // Delay slightly to ensure element is rendered/enabled
    const t = setTimeout(focus, 0);
    return () => clearTimeout(t);
  }, [open]);

  // Refocus after bot finishes typing or after selecting topic
  useEffect(() => {
    if (open && !isBotTyping) {
      inputRef.current?.focus();
    }
  }, [isBotTyping, open]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [selectedTopic, open]);

  useEffect(() => {
    // Auto scroll to bottom on new messages
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, open]);

  // Show Flying image while the user is actively scrolling within the app's main scroll container; revert shortly after stop
  useEffect(() => {
    const appScrollEl = document.querySelector('.app-scroll');
    const target = appScrollEl || window;

    const onScroll = () => {
      setIsScrolling(true);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 400);
    };

    target.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      target.removeEventListener('scroll', onScroll);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
      setShowTeaser(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);


  // Auto-hide the teaser after ~30s or when panel opens
  useEffect(() => {
    if (!showTeaser || open) return;
    const tm = setTimeout(() => setShowTeaser(false), 30000);
    return () => clearTimeout(tm);
  }, [showTeaser, open]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const syncViewport = () => setIsMobileViewport(window.innerWidth <= 768);
    syncViewport();

    window.addEventListener('resize', syncViewport);
    return () => window.removeEventListener('resize', syncViewport);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (!root) return undefined;

    if (open) {
      root.classList.add('chat-widget-open');
    } else {
      root.classList.remove('chat-widget-open');
    }

    return () => root.classList.remove('chat-widget-open');
  }, [open]);

  async function handleSelectTopic(key) {
    try {
      setLoading(true);
      setError('');
      const ack = await selectTopic(key, language);
      setSelectedTopic(key);
      setMessages((prev) => ([...prev, { role: 'system', text: String(ack) }]));
    } catch (e) {
      setError(e?.message || copy.selectTopicError);
      setMessages((prev) => ([...prev, { role: 'ai', text: copy.unavailable }]));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);


  async function handleSend(ev) {
    ev?.preventDefault?.();
    if (!selectedTopic) {
      setError(copy.selectTopicFirst);
      return;
    }
    const text = inputRef.current?.value || '';
    if (!text.trim()) return;

    // Optimistic UI update
    setMessages((prev) => ([...prev, { role: 'user', text }]));
    inputRef.current.value = '';

    try {
      setLoading(true);
      setError('');
      setIsBotTyping(true);
      const reply = await sendMessage(text, language);
      setMessages((prev) => ([...prev, { role: 'ai', text: String(reply) }]));
      setIsBotTyping(false);
      // Refocus after bot reply
      inputRef.current?.focus();

      // Optional notify when widget is closed
      try {
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted' && !open) {
          new Notification('GreenShield Assistant', { body: copy.notification });
        }
      } catch { /* ignore */ }
    } catch (e) {
      setError(e?.message || copy.sendMessageError);
      // Graceful bot reply on error (e.g., 400/503)
      setMessages((prev) => ([...prev, { role: 'ai', text: copy.unavailable }]));
    } finally {
      setLoading(false);
      setIsBotTyping(false);
      // Ensure focus returns to input even if request failed
      inputRef.current?.focus();
    }
  }

  // Close when clicking outside the panel (since overlay doesn't capture clicks now)
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      const panel = panelRef.current;
      if (!panel) return;
      // Ignore clicks inside Antd Select dropdown belonging to this widget
      const inSelectDropdown = e.target?.closest?.('.cwp-select-dropdown');
      if (inSelectDropdown) return;

      if (!panel.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown, { passive: true });
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
    };
  }, [open]);

  return (
    <>
      {/* Floating open button (hide when panel is open) */}
      <AnimatePresence>
      {!open && showButton && (
        <Motion.div
          key="launcher"
          initial={{ opacity: 0, y: 24, scale: 0.88 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24, mass: 0.9 }}
        >
          {/* Desktop / Tablet: large mascot visual with hotspot */}
          {!isMobileViewport && (
          <div className="chat-widget-button cwb-desktop" aria-hidden={false}>
            {showTeaser && (
              <div className="chat-widget-teaser" aria-hidden>
                {copy.teaserPrefix} <strong>Lubi</strong> {copy.teaserSuffix}
              </div>
            )}
            <img
              src={isScrolling ? FlyingImg : NormalImg}
              alt=""
              className="chat-widget-icon"
              aria-hidden
              draggable={false}
            />
            {/* Smaller clickable hotspot so scrolling passes through around it */}
            <button
              type="button"
              aria-label={copy.openChat}
              className="chat-widget-hotspot"
              onClick={() => {
                setOpen(true);
                setShowTeaser(false);

                // 🔊 Play Lubi sound mỗi lần mở chat
                try {
                  let audio = lubiAudioRef.current;
                  if (!audio) {
                    audio = new Audio(LubiSound);
                    audio.preload = 'auto';
                    audio.volume = 0.6;
                    lubiAudioRef.current = audio;
                  }
                  audio.currentTime = 0;
                  const playPromise = audio.play();
                  if (playPromise && typeof playPromise.then === 'function') {
                    playPromise.catch(() => {
                      // nếu bị chặn autoplay thì phát lại khi user click
                      const unlock = () => {
                        try {
                          audio.currentTime = 0;
                          audio.play().catch(() => { });
                        } catch { /* ignore */ }
                      };
                      window.addEventListener('pointerdown', unlock, { once: true });
                      window.addEventListener('keydown', unlock, { once: true });
                      window.addEventListener('touchstart', unlock, { once: true });
                    });
                  }
                } catch (err) {
                  console.warn('Cannot play Lubi sound', err);
                }
              }}
            />
          </div>
          )}

          {/* Mobile: small round button with logo-like image and back-to-top effects */}
          {isMobileViewport && (
          <button
            type="button"
            aria-label={copy.openChat}
            className="chat-mobile-button cwb-mobile"
            onClick={() => {
              setOpen(true);
              setShowTeaser(false);
              try {
                let audio = lubiAudioRef.current;
                if (!audio) {
                  audio = new Audio(LubiSound);
                  audio.preload = 'auto';
                  audio.volume = 0.6;
                  lubiAudioRef.current = audio;
                }
                audio.currentTime = 0;
                audio.play().catch(() => { /* ignore */ });
              } catch {
                /* ignore */
              }
            }}
          >
            <img src={LogoFade} alt={copy.openChat} className="chat-mobile-icon" draggable={false} />
          </button>
          )}
        </Motion.div>
      )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Outside click overlay (sibling) */}
            <Motion.div
              key="overlay"
              className="cwp-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            />
            <Motion.div
              key="panel"
              className={`chat-widget-panel ${keyboardOpen ? 'is-keyboard' : ''}`}
              role="dialog"
              aria-label={copy.chatDialog}
              aria-modal="false"
              initial={{ opacity: 0, y: 26, scale: 0.88 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26, mass: 0.9 }}
              style={{ transformOrigin: 'right bottom' }}
              ref={panelRef}
            >
              {/* Mascot image floating above the panel */}
              <img
                src={ChatboxImg}
                alt=""
                className="cwp-mascot"
                aria-hidden
                draggable={false}
              />
              <div className="cwp-inner">
                <div className="cwp-header">
                  <div className="cwp-title">
                    Lubot
                  </div>
                  <button className="cwp-x" onClick={() => setOpen(false)} aria-label={copy.closeChat}>
                    <span className="material-symbols-rounded" aria-hidden>close</span>
                  </button>
                </div>

                <div className="cwp-topics">
                  {loading && topicKeys.length === 0 && (
                    <div className="cwp-hint">{copy.loadingTopics}</div>
                  )}
                  {error && (
                    <div className="cwp-error" role="alert">{error}</div>
                  )}
                  {topicKeys.length > 0 && (
                    <Select
                      className="cwp-select"
                      placeholder={copy.topicPlaceholder}
                      value={selectedTopic || undefined}
                      onChange={(val) => handleSelectTopic(val)}
                      disabled={loading}
                      loading={loading}
                      size="middle"
                      popupClassName="cwp-select-dropdown"
                      options={topicKeys.map((key) => ({
                        value: key,
                        label: (
                          <span className="cwp-opt" title={topicLabels[key] || key}>
                            <span className="material-symbols-rounded cwp-opt-ic" aria-hidden>
                              {TOPIC_ICONS[key] || TOPIC_ICONS.default}
                            </span>
                            {topicLabels[key] || key}
                          </span>
                        ),
                      }))}
                    />
                  )}
                </div>

                <div className="cwp-body" ref={bodyRef}>
                  {messages.length === 0 ? (
                    <div className="cwp-empty">{copy.empty}</div>
                  ) : (
                    <ScrollToBottom className="cwp-scroll">
                      <ul className="cwp-messages">
                        {messages.map((m, i) => {
                          // System notice centered outside bubbles
                          if (m.role === 'system') {
                            return (
                              <li key={i} className="cwp-notice">
                                <span>{m.text}</span>
                              </li>
                            );
                          }

                          // AI message: two rows (logo+name) then content
                          if (m.role === 'ai') {
                            return (
                              <Motion.li
                                key={i}
                                className="msg msg--ai"
                                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.22, ease: 'easeOut' }}
                              >
                                <div className="msg-ai">
                                  <div className="msg-ai-head">
                                    <span className="material-symbols-rounded msg-ai-logo" aria-hidden>auto_awesome</span>
                                    <span className="msg-ai-name">Lubot</span>
                                  </div>
                                  <div className="msg-bubble msg-ai-body">
                                    <React.Suspense fallback={<span>{m.text}</span>}>
                                      <ChatMarkdown text={m.text} />
                                    </React.Suspense>
                                  </div>
                                </div>
                              </Motion.li>
                            );
                          }

                          // User message: regular bubble
                          return (
                            <Motion.li
                              key={i}
                              className="msg msg--user"
                              initial={{ opacity: 0, y: 8, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ duration: 0.22, ease: 'easeOut' }}
                            >
                              <div className="msg-bubble">
                                <React.Suspense fallback={<span>{m.text}</span>}>
                                  <ChatMarkdown text={m.text} />
                                </React.Suspense>
                              </div>
                            </Motion.li>
                          );
                        })}
                        {isBotTyping && (
                          <li className="msg msg--ai">
                            <div className="msg-bubble typing">
                              <span></span><span></span><span></span>
                            </div>
                          </li>
                        )}
                      </ul>
                    </ScrollToBottom>
                  )}
                </div>

                <form className="cwp-input" onSubmit={handleSend}>
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={selectedTopic ? copy.messagePlaceholder : copy.selectTopicFirst}
                    disabled={!selectedTopic || loading}
                    aria-disabled={!selectedTopic || loading}
                    onFocus={() => setKeyboardOpen(true)}
                    onBlur={() => setKeyboardOpen(false)}
                  />
                  <button type="submit" disabled={!selectedTopic || loading}>
                    <span className="material-symbols-rounded" aria-hidden>arrow_outward</span>
                  </button>
                </form>
              </div>
            </Motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
