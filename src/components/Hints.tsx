import React, { FC, FunctionComponent } from "react";
import { useSelector } from "react-redux";
import { selectBank } from "../ducks/bank";
import { selectGameType } from "../ducks/gameSelectors";
import {
  selectHintType,
  selectRefOccurencesToFind,
  selectFoundRefs,
} from "../games/FindGame";
import { recallAnswer } from "../games/RecallGame";
import { Occurrence } from "../utils/occurrences";
import { Passage } from "bible-tools";
import { selectSetting } from "../ducks/settings";
import { HoverReveal } from "./HoverReveal";

export const Hints: FC = () => {
  const type = useSelector(selectGameType);
  if (type === "recall") return <RecallHint />;
  if (type === "find") return <FindHint />;
  return <p>hmm</p>;
};

const RecallHint: FC = () => {
  const answer = useSelector(recallAnswer);
  return <p key={answer}>{answer}</p>;
};

const FindHint: FunctionComponent = () => {
  const refOccurences = useSelector(selectRefOccurencesToFind);
  return (
    <>
      {refOccurences.map(([ref, occurrences]) => (
        <OccurrencesHint key={ref} reff={ref} occurrences={occurrences} />
      ))}
    </>
  );
};

export const MiniHint: FunctionComponent = () => {
  const refOccurences = useSelector(selectRefOccurencesToFind);
  const found = useSelector(selectFoundRefs);
  return (
    <svg
      className="relative -left-4 inline"
      height="40"
      width={(refOccurences.length + 1) * 20}
    >
      {refOccurences.map(([ref, occurrences], i) => (
        <circle
          className="fill-current"
          r="5"
          cy="20"
          cx={20 * (i + 1)}
          key={ref}
          style={{ opacity: found.includes(ref) ? 1 : 0.5 }}
        >
          hi
        </circle>
      ))}
    </svg>
  );
};

interface OccurrencesHintProps {
  reff: string;
  occurrences: Occurrence[];
}
const OccurrencesHint = (props: OccurrencesHintProps) => {
  const { reff: ref, occurrences } = props;
  const parse = useSelector(selectSetting("parseMnemonics"));
  const displayRef = parse ? new Passage(ref).reference : ref;
  const bank = useSelector(selectBank);
  const found = useSelector(selectFoundRefs);
  const refHint = useSelector(selectHintType) === "ref";
  return (
    <p
      style={{ opacity: found.includes(ref) ? 1 : 0.5 }}
      className="leading-tight mt-3 w-100 relative"
    >
      <HoverReveal
        back={<span className="flex items-center h-full">{displayRef}</span>}
        reverse={refHint}
      >
        <HighlightedHint verse={bank[ref]} occurrences={occurrences} />
      </HoverReveal>
    </p>
  );
};

interface HightlightedHintProps {
  verse: string;
  occurrences: Occurrence[];
}
const HighlightedHint: FunctionComponent<HightlightedHintProps> = (props) => {
  const final = props.occurrences[props.occurrences.length - 1];
  return (
    <>
      {props.occurrences.map((occurrence, index, all) => {
        const previous: Occurrence = all[index - 1];
        const start = previous ? previous.index + previous.word.length : 0;
        return (
          <span key={occurrence.ref + start}>
            {props.verse.slice(start, occurrence.index)}
            <span className="animate-pulse" style={{ color: "var(--accent)" }}>
              {occurrence.word}
            </span>
          </span>
        );
      })}
      {props.verse.slice(final.index + final.word.length)}
    </>
  );
};
