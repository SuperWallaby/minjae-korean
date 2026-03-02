import { Gap } from "@/components/article/Gap";
import { VerbEndingTable } from "@/components/article/VerbEndingTable";
import { verbEndingData } from "./korean-verb-ending";
import type { BlogPost } from "../types";

/** Freq 높은 순(자주 나오는 순)으로 정렬 */
const verbEndingDataSorted = [...verbEndingData].sort(
  (a, b) => (b.frequency ?? 0) - (a.frequency ?? 0),
);

export const post: BlogPost = {
  slug: "korean-verb-endings",
  title: "Top 100 Korean Verb Endings (eomi) You Actually Must Know.",
  level: 3,
  createdAt: "2026-02-27",
  paragraphs: [
    {
      subtitle: "Why verb endings matter",
      content: (
        <>
          In Korean, a lot of meaning comes from <strong>endings</strong> you
          attach to the verb stem.
          <br />
          The same stem can become a statement, a question, a reason, a
          condition, or a wish—depending on the ending.
          <Gap />
          This post is a quick reference table for some of the most common
          endings<br></br> <strong>connection</strong>,
          <strong> auxiliary</strong>, and <strong>sentence-ending</strong>{" "}
          forms.
        </>
      ),
    },
    {
      subtitle: "Reference table",
      content: (
        <>
          Form, meaning, type, form rule, and example sentences.
          <Gap />
          <VerbEndingTable data={verbEndingDataSorted} />
        </>
      ),
    },
    {
      subtitle: "How to use this",
      content: (
        <>
          Use the table to compare endings and see how they change the role of
          the verb in the sentence.
          <br />
          <strong>Connection</strong> endings link two clauses (and, but,
          because, if…). <strong>Auxiliary</strong> ones add meaning like “want
          to” or “have to.” <strong>Sentence-ending</strong> ones finish the
          sentence with a certain tone (realization, confirmation,
          recollection).
        </>
      ),
    },
  ],
};
