"use client";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ErrorNotice from "@/components/ui/ErrorNotice";
import { fadeUp, staggerParent } from "@/components/motion";
import { TEXT } from "@/lib/texts";
import type { Q1Answer } from "@/lib/types";

interface Props {
  pending: boolean;
  error: string | null;
  onAnswer: (a: Q1Answer) => void;
}

export default function QuestionOne({ pending, error, onAnswer }: Props) {
  return (
    <Card>
      <motion.div variants={staggerParent} initial="initial" animate="animate" className="flex flex-col items-center">
        <motion.span variants={fadeUp} className="mb-5 text-xs font-medium uppercase tracking-[0.3em] text-navy/50">
          Pepero Day
        </motion.span>
        <motion.h1 variants={fadeUp} className="font-serif text-3xl leading-tight text-navy sm:text-4xl">
          {TEXT.q1.title}
        </motion.h1>
        <motion.div variants={fadeUp} className="mt-10 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => onAnswer("yes")} loading={pending} className="w-full sm:w-auto sm:min-w-[180px]">
            {TEXT.q1.yes}
          </Button>
          <Button variant="ghost" onClick={() => onAnswer("no")} disabled={pending} className="w-full sm:w-auto sm:min-w-[180px]">
            {TEXT.q1.no}
          </Button>
        </motion.div>
      </motion.div>
      <ErrorNotice message={error} />
    </Card>
  );
}
