### Exams 작성 가이드

`/exams` 페이지에 보이는 시험은 **데이터 + 렌더러**로 동작합니다. 새 시험을 만들려면 아래 3가지를 세트로 준비하면 됩니다.

- **1) Exam 정의 (`Exam`)**
- **2) 문항 뱅크 (`AssessmentItem[]`)**
- **3) exams 목록에 등록 (카드 노출용 메타데이터)**

아래 예시는 `placement` 시험 구조를 기준으로 설명합니다.

---

### 1. Exam 본체 만들기 (`src/data/exams/*.ts`)

1. `src/data/exams/placementExam.ts`를 참고해서 **새 파일**을 만듭니다. 예: `src/data/exams/levelA1Exam.ts`.
2. 상단에서 필요한 타입을 import 합니다.

```ts
import type {
  Exam,
  AssessmentItem,
  MCQItem,
  ShortAnswerItem,
  TrueFalseItem,
} from "@/types/exam";
```

3. 각 시험마다 고유 **ID / 섹션 ID / 아이템 ID**를 선언합니다.

```ts
const EXAM_ID = "exam-level-a1-01";
const SECTION_ID = "section-level-a1-01";

const ITEM_IDS = {
  mcq1: "item-level-a1-mcq1",
  // ...
} as const;
```

4. `AssessmentItem[]`로 **문항들**을 만듭니다.

- `type`에 따라 필요한 필드가 달라집니다.
- 대표 타입:
  - `mcq` (객관식 1개 정답)
  - `multi_select` (객관식 복수 정답)
  - `short_answer` (짧은 서술형)
  - `true_false`
  - `cloze` (빈칸)
  - `reorder_tokens` (순서 배열)
  - `dictation` (받아쓰기)
  - `audio_mcq` (오디오 듣고 객관식)
  - `match_pairs` (짝 맞추기)

간단한 `mcq` 예시:

```ts
export const levelA1Items: AssessmentItem[] = [
  {
    id: ITEM_IDS.mcq1,
    type: "mcq",
    level: "A1",
    skill: "vocab",
    stem: {
      instruction: { default: "Choose the correct meaning of “학교”." },
    },
    interaction: {
      options: [
        { id: "opt-school", text: { default: "school" } },
        { id: "opt-home", text: { default: "home" } },
        { id: "opt-work", text: { default: "workplace" } },
      ],
    },
    scoring: {
      points: 1,
      autoGrade: true,
      key: { kind: "mcq", correctOptionId: "opt-school" },
    },
  } as MCQItem,
];
```

5. 마지막에 `Exam` 객체를 export 합니다.

```ts
export const levelA1Exam: Exam = {
  id: EXAM_ID,
  slug: "level-a1",
  title: "Level A1",
  description: "Short level test for A1.",
  kind: "level_test", // placement | level_test | mock_topik
  uiLocale: "en",
  blueprint: {
    timeLimitSec: 900,
    sections: [
      {
        id: SECTION_ID,
        title: "Part 1",
        description: "Vocabulary and grammar",
        shuffleItems: false,
        source: {
          type: "explicit",
          itemIds: [ITEM_IDS.mcq1 /*, ...*/],
        },
      },
    ],
    placementRule: null, // level test이면 보통 null
    gradingRule: {
      showPercent: true,
      bands: [
        { label: "Pass", minScoreInclusive: 0 },
        // 필요에 따라 구간 정의
      ],
    },
  },
  createdAt: "2026-03-01T00:00:00Z",
  updatedAt: "2026-03-01T00:00:00Z",
  version: 1,
};
```

---

### 2. exams 목록에 등록 (`src/data/examsList.ts`)

1. `src/data/examsList.ts`에서 새 시험을 import 합니다.
2. `LEVEL_EXAM_SLUGS` 또는 `MOCK_EXAM_SLUGS` 배열에 **카드용 메타데이터**를 추가합니다.

필드 예시:
- `slug`: 위 `Exam.slug`와 동일
- `title`: 카드에 보일 제목
- `description`: 한 줄 설명
- `kind`: `"placement" | "level_test" | "mock_topik"`
- `targetLevel`: level test인 경우 (예: `"A1"`)
- `imageThumb`: `/exams/…` 카드 썸네일 (선택)

이렇게 추가하면 `/exams` 허브 페이지에 카드가 자동으로 나타납니다.

---

### 3. 라우트 설정 (페이지)

레벨 시험 / 모의 시험용 라우트는 이미 준비되어 있습니다.

- `src/app/exams/placement/page.tsx` – 배치 시험
- `src/app/exams/level/[slug]/page.tsx` – 레벨 시험 (slug로 구분)
- `src/app/exams/mock/[slug]/page.tsx` – 모의 TOPIK

새 시험은 보통 **데이터만 추가**하면 됩니다.

- `getExam(kind, slug)` / `getExamItems(kind, slug)` 쪽에서 새 slug를 처리하도록 해 두면
- 위 페이지들이 해당 slug로 접속했을 때 `ExamSession`에 데이터를 넘겨줍니다.

---

### 4. 문항 타입별 최소 필수 필드 요약

- **공통 (`AssessmentItemBase`)**
  - `id`: 문자열, 전체 시험에서 유니크
  - `type`: `"mcq"` 등
  - `level`: `"A0" | "A1" | ...`
  - `skill`: `"vocab" | "grammar" | "listening" | ...`
  - `stem.instruction.default`: 문제 지문
  - `scoring.points`: 점수
  - `scoring.autoGrade`: 자동 채점 여부
  - `scoring.key`: 타입별 정답 키

- **MCQ**
  - `interaction.options[]`: `{ id, text.default }`
  - `scoring.key.kind = "mcq"`
  - `scoring.key.correctOptionId`

- **Short answer**
  - `interaction.placeholder.default`
  - `interaction.inputMode`: `"hangul" | "latin" | "free"`
  - `scoring.key.kind = "short_answer"`
  - `scoring.key.accepted`: 정답 리스트

- **True/false**
  - `interaction.statement.default`
  - `scoring.key.kind = "true_false"`
  - `scoring.key.correct: boolean`

나머지 타입은 `src/components/exams/items/*.tsx` 와 `@/types/exam` 정의를 참고해서 필요한 필드를 맞추면 됩니다.

---

### 5. 체크리스트

- [ ] `Exam.id`, `section.id`, `item.id` 전부 유니크하게 작성했는가?
- [ ] `blueprint.sections[].source.itemIds`에 실제 존재하는 item id만 넣었는가?
- [ ] `scoring.key`의 형식이 item `type`과 맞는가?
- [ ] `examsList`에 slug/제목/설명을 추가해서 카드가 보이는지?
- [ ] 브라우저에서 `/exams/...` 접속 시 `ExamSession`이 정상적으로 문항을 순회하는지?

이 가이드대로 작성하면 새 시험을 추가해도 `/exams` 허브 + 시험 세션 UI가 그대로 재사용됩니다.

