"use client";

import type { GrammarBlock } from "@/data/grammarTypes";

import { BlockBulletedList } from "./blocks/BlockBulletedList";
import { BlockCallout } from "./blocks/BlockCallout";
import { BlockCode } from "./blocks/BlockCode";
import { BlockDivider } from "./blocks/BlockDivider";
import { BlockHeading } from "./blocks/BlockHeading";
import { BlockNumberedList } from "./blocks/BlockNumberedList";
import { BlockParagraph } from "./blocks/BlockParagraph";
import { BlockQuote } from "./blocks/BlockQuote";
import { BlockSoundword } from "./blocks/BlockSoundword";

type Props = {
  blocks: GrammarBlock[];
  /** 연속된 bullet/numbered 리스트를 그룹으로 묶어서 렌더 (선택) */
  groupLists?: boolean;
};

export function BlockRenderer({ blocks, groupLists = true }: Props) {
  if (groupLists) {
    return <BlockRendererGrouped blocks={blocks} />;
  }
  return (
    <div className="grammar-blocks space-y-4">
      {blocks.map((block, i) => (
        <BlockRendererOne key={i} block={block} />
      ))}
    </div>
  );
}

function BlockRendererGrouped({ blocks }: { blocks: GrammarBlock[] }) {
  const nodes: React.ReactNode[] = [];
  let i = 0;
  let bulletAccum: string[] = [];
  let numberedAccum: string[] = [];

  const flushBullet = () => {
    if (bulletAccum.length > 0) {
      nodes.push(
        <BlockBulletedList key={`b-${i}`} items={bulletAccum} />,
      );
      bulletAccum = [];
      i += 1;
    }
  };
  const flushNumbered = () => {
    if (numberedAccum.length > 0) {
      nodes.push(
        <BlockNumberedList key={`n-${i}`} items={numberedAccum} />,
      );
      numberedAccum = [];
      i += 1;
    }
  };

  for (const block of blocks) {
    if (block.type === "bulleted_list_item") {
      flushNumbered();
      bulletAccum.push(block.text);
      continue;
    }
    if (block.type === "numbered_list_item") {
      flushBullet();
      numberedAccum.push(block.text);
      continue;
    }
    flushBullet();
    flushNumbered();
    nodes.push(<BlockRendererOne key={i} block={block} />);
    i += 1;
  }
  flushBullet();
  flushNumbered();

  return <div className="grammar-blocks space-y-4">{nodes}</div>;
}

function BlockRendererOne({ block }: { block: GrammarBlock }) {
  switch (block.type) {
    case "paragraph":
      return <BlockParagraph text={block.text} />;
    case "heading_1":
      return <BlockHeading level={1} text={block.text} />;
    case "heading_2":
      return <BlockHeading level={2} text={block.text} />;
    case "heading_3":
      return <BlockHeading level={3} text={block.text} />;
    case "quote":
      return <BlockQuote text={block.text} />;
    case "code":
      return <BlockCode code={block.code} language={block.language} />;
    case "divider":
      return <BlockDivider />;
    case "callout":
      return <BlockCallout text={block.text} emoji={block.emoji} />;
    case "soundword":
      return (
        <BlockSoundword
          word={block.word}
          sound={block.sound}
          phonetic={block.phonetic}
          meaning={block.meaning}
        />
      );
    case "bulleted_list_item":
      return <BlockBulletedList items={[block.text]} />;
    case "numbered_list_item":
      return <BlockNumberedList items={[block.text]} />;
    default:
      return null;
  }
}
