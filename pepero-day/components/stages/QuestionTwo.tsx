"use client";
import { motion } from "framer-motion";
import { useRef } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ErrorNotice from "@/components/ui/ErrorNotice";
import MovingNoButton from "./MovingNoButton";
import { fadeUp, staggerParent } from "@/components/motion";
import { TEXT } from "@/lib/texts";

interface Props {
  pending: boolean;
  error: string | null;
  onYes: () => void;
  onDodge: () => void;
}

export default function QuestionTwo({ pending, error, onYes, onDodge }: Props) {
  const yesRef = useRef<HTMLButtonElement>(null);
  return (
    <Card>
      <motion.div variants={staggerParent} initial="initial" animate="animate" className="flex flex-col items-center">
        <motion.span variants={fadeUp} className="mb-5 text-xs font-medium uppercase tracking-[0.3em] text-navy/50">
          Pepero Day
        </motion.span>
        <motion.h1 variants={fadeUp} className="font-serif text-3xl leading-tight text-navy sm:text-4xl">
          {TEXT.q2.title}
        </motion.h1>
        <motion.div variants={fadeUp} className="mt-10 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Button ref={yesRef} onClick={onYes} loading={pending} className="w-full sm:w-auto sm:min-w-[180px]">
            {TEXT.q2.yes}
          </Button>
          <MovingNoButton avoidRef={yesRef} onDodge={onDodge} />
        </motion.div>
      </motion.div>
      <ErrorNotice message={error} />
    </Card>
  );
}
