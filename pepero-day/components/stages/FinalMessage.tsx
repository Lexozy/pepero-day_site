"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ErrorNotice from "@/components/ui/ErrorNotice";
import { fadeUp, staggerParent } from "@/components/motion";
import { TEXT } from "@/lib/texts";

interface Props {
  pending: boolean;
  error: string | null;
  onSubmit: (message: string) => void;
}

const MAX = 2000;

export default function FinalMessage({ pending, error, onSubmit }: Props) {
  const [value, setValue] = useState("");
  const trimmed = value.trim();
  const canSubmit = trimmed.length > 0 && trimmed.length <= MAX && !pending;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit(trimmed);
  };

  return (
    <Card>
      <motion.form onSubmit={submit} variants={staggerParent} initial="initial" animate="animate" className="flex flex-col items-center">
        <motion.h1 variants={fadeUp} className="font-serif text-3xl leading-tight text-navy sm:text-4xl">
          {TEXT.final.title}
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-5 max-w-md text-base leading-relaxed text-navy/80 sm:text-lg">
          {TEXT.final.body}
        </motion.p>
        <motion.div variants={fadeUp} className="mt-8 w-full text-left">
          <label htmlFor="message" className="sr-only">
            {TEXT.final.placeholder}
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            maxLength={MAX}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={TEXT.final.placeholder}
            disabled={pending}
            className="field min-h-[160px] text-[16px] sm:min-h-[180px]"
            autoComplete="off"
            enterKeyHint="done"
          />
          <div className="mt-2 text-right text-xs tabular-nums text-navy/40">
            {value.length} / {MAX}
          </div>
        </motion.div>
        <motion.div variants={fadeUp} className="mt-6 w-full sm:w-auto">
          <Button type="submit" disabled={!canSubmit} loading={pending} className="w-full sm:min-w-[220px]">
            {pending ? TEXT.final.sending : TEXT.final.submit}
          </Button>
        </motion.div>
      </motion.form>
      <ErrorNotice message={error} />
    </Card>
  );
}
