"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import FloatingDecor from "./FloatingDecor";
import ErrorNotice from "./ui/ErrorNotice";
import QuestionOne from "./stages/QuestionOne";
import QuestionTwo from "./stages/QuestionTwo";
import GiftReveal from "./stages/GiftReveal";
import FinalMessage from "./stages/FinalMessage";
import Declined from "./stages/Declined";
import ThankYou from "./stages/ThankYou";
import { useInvitation } from "./useInvitation";
import { stageOf, type PublicSession } from "@/lib/types";
import { TEXT } from "@/lib/texts";
import { Heart } from "./icons";

export default function Experience() {
  const inv = useInvitation();
  /**
   * Gift нээгдсэнийг сервер хадгалсны дараа reveal animation-ийг үзүүлэх локал төлөв.
   * Refresh хийвэл false → gift аль хэдийн нээгдсэн бол шууд Page 4 руу (progress restore).
   */
  const [revealing, setRevealing] = useState(false);

  const openGift = async () => {
    // Эхлээд reveal горимд оруулна — session шинэчлэгдэх мөчид Page 4 анивчихгүй.
    setRevealing(true);
    const ok = await inv.commit({ type: "gift_opened" });
    if (!ok) setRevealing(false);
  };

  const renderStage = (session: PublicSession) => {
    const stage = stageOf(session);
    if (stage === "gift" || (stage === "final" && revealing)) {
      return (
        <GiftReveal
          key="gift"
          opened={session.gift_opened}
          pending={inv.pending}
          error={inv.error}
          onOpen={openGift}
          onContinue={() => setRevealing(false)}
        />
      );
    }
    switch (stage) {
      case "q1":
        return (
          <QuestionOne
            key="q1"
            pending={inv.pending}
            error={inv.error}
            onAnswer={(a) => void inv.commit({ type: "q1_answered", answer: a })}
          />
        );
      case "declined":
        return <Declined key="declined" />;
      case "q2":
        return (
          <QuestionTwo
            key="q2"
            pending={inv.pending}
            error={inv.error}
            onYes={() => void inv.commit({ type: "q2_answered" })}
            onDodge={inv.trackDodge}
          />
        );
      case "final":
        return (
          <FinalMessage
            key="final"
            pending={inv.pending}
            error={inv.error}
            onSubmit={(m) => void inv.commit({ type: "message_submitted", message: m })}
          />
        );
      case "thanks":
        return <ThankYou key="thanks" />;
    }
  };

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-10 sm:px-6">
      <FloatingDecor />

      <AnimatePresence mode="wait">
        {inv.status === "booting" && (
          <motion.div
            key="boot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-col items-center gap-4 text-navy/70"
          >
            <motion.div animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}>
              <Heart className="h-8 w-8 text-white drop-shadow-[0_6px_14px_rgba(36,60,90,0.25)]" />
            </motion.div>
            <p className="text-sm">{TEXT.loading}</p>
          </motion.div>
        )}

        {inv.status === "boot_error" && (
          <motion.div key="boot-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative z-10 w-full">
            <ErrorNotice message={inv.error} onRetry={inv.boot} />
          </motion.div>
        )}

        {inv.status === "ready" && inv.session && renderStage(inv.session)}
      </AnimatePresence>
    </main>
  );
}
