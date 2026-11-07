"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { TEXT } from "@/lib/texts";

interface Props {
  /** "Тэгье 🤍" товчны ref — түүнийг хэзээ ч халхлахгүй. */
  avoidRef: RefObject<HTMLElement | null>;
  onDodge: () => void;
}

interface Pos {
  x: number;
  y: number;
}

const MARGIN = 16;
const AVOID_PAD = 28;
const MIN_JUMP = 110;

function overlaps(a: DOMRect, x: number, y: number, w: number, h: number, pad: number) {
  return !(x + w + pad < a.left || x > a.right + pad || y + h + pad < a.top || y > a.bottom + pad);
}

/**
 * Хулгана ойртох / хүрэх үед viewport дотор өөр байрлал руу зөөлөн зугтах "Үгүй" товч.
 * Эхлээд урсгалд (inline) байрлана; анх зугтсанаас хойш fixed болж transform-оор хөдөлнө.
 */
export default function MovingNoButton({ avoidRef, onDodge }: Props) {
  const reduce = useReducedMotion();
  const inlineRef = useRef<HTMLButtonElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [from, setFrom] = useState<Pos | null>(null);
  const [pos, setPos] = useState<Pos | null>(null);
  const [wobble, setWobble] = useState(0);

  const pickTarget = useCallback(
    (cur: Pos, w: number, h: number): Pos => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const maxX = Math.max(MARGIN, W - w - MARGIN);
      const maxY = Math.max(MARGIN, H - h - MARGIN);
      const avoid = avoidRef.current?.getBoundingClientRect() ?? null;

      let best: Pos | null = null;
      let bestDist = -1;
      for (let i = 0; i < 30; i++) {
        const x = MARGIN + Math.random() * (maxX - MARGIN);
        const y = MARGIN + Math.random() * (maxY - MARGIN);
        if (avoid && overlaps(avoid, x, y, w, h, AVOID_PAD)) continue;
        const dist = Math.hypot(x - cur.x, y - cur.y);
        if (dist >= MIN_JUMP) return { x, y };
        if (dist > bestDist) {
          bestDist = dist;
          best = { x, y };
        }
      }
      if (best) return best;
      // Fallback: аль ч булан "Тэгье"-гээс хол байна
      const corners: Pos[] = [
        { x: MARGIN, y: MARGIN },
        { x: maxX, y: MARGIN },
        { x: MARGIN, y: maxY },
        { x: maxX, y: maxY },
      ];
      return corners.find((c) => !avoid || !overlaps(avoid, c.x, c.y, w, h, AVOID_PAD)) ?? corners[0];
    },
    [avoidRef],
  );

  const dodge = useCallback(() => {
    let w = size?.w;
    let h = size?.h;
    let cur = pos;
    if (!cur) {
      const rect = inlineRef.current?.getBoundingClientRect();
      if (!rect) return;
      w = rect.width;
      h = rect.height;
      cur = { x: rect.left, y: rect.top };
      setSize({ w, h });
      setFrom(cur);
    }
    if (!w || !h) return;
    setPos(pickTarget(cur, w, h));
    setWobble((n) => n + 1);
    onDodge();
  }, [size, pos, pickTarget, onDodge]);

  // Viewport өөрчлөгдвөл (эргүүлэх, гар товчлуур) хүрээнд нь багтаана
  useEffect(() => {
    if (!pos || !size) return;
    const clamp = () => {
      const maxX = Math.max(MARGIN, window.innerWidth - size.w - MARGIN);
      const maxY = Math.max(MARGIN, window.innerHeight - size.h - MARGIN);
      setPos((p) => (p ? { x: Math.min(Math.max(p.x, MARGIN), maxX), y: Math.min(Math.max(p.y, MARGIN), maxY) } : p));
    };
    window.addEventListener("resize", clamp);
    return () => window.removeEventListener("resize", clamp);
  }, [pos, size]);

  const handlers = {
    onPointerEnter: (e: React.PointerEvent) => {
      if (e.pointerType === "mouse") dodge();
    },
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      dodge();
    },
    onTouchStart: (e: React.TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      dodge();
    },
    onFocus: (e: React.FocusEvent<HTMLButtonElement>) => {
      e.currentTarget.blur();
      dodge();
    },
    onClick: (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dodge();
    },
  };

  const common = {
    type: "button" as const,
    tabIndex: -1,
    "aria-disabled": true,
    className: "btn-ghost w-full cursor-default touch-none sm:w-auto sm:min-w-[180px]",
    children: TEXT.q2.no,
    ...handlers,
  };

  if (!pos || !from || !size) {
    return <motion.button ref={inlineRef} {...common} whileHover={{ scale: 1.02 }} />;
  }

  return (
    <>
      {/* Урсгалд байрлаж байсан зайг хадгална — layout үсрэхгүй */}
      <span aria-hidden className="block w-full sm:w-auto" style={{ width: size.w, height: size.h }} />
      {/* body-д portal хийнэ: card-ын backdrop-filter/transform нь fixed байрлалыг гажуудуулахгүй */}
      {createPortal(
        <motion.button
          key="floating-no"
          {...common}
          className={`${common.className} fixed left-0 top-0 z-50`}
          style={{ width: size.w, height: size.h }}
          initial={{ x: from.x, y: from.y, rotate: 0 }}
          animate={{ x: pos.x, y: pos.y, rotate: reduce ? 0 : wobble % 2 === 0 ? -4 : 4 }}
          transition={
            reduce
              ? { duration: 0.15 }
              : { type: "spring", stiffness: 420, damping: 28, mass: 0.7, rotate: { type: "spring", stiffness: 200, damping: 10 } }
          }
        />,
        document.body,
      )}
    </>
  );
}
