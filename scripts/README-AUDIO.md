# 오디오(TTS) 일괄 생성

Fundamental·블로그 등에서 쓰는 한글 발음 오디오를 **edge-tts**로 한 번에 만드는 방법입니다.

## 준비

```bash
pip install edge-tts
```

## 저장 위치

- **경로**: `public/audio/`
- **파일명**: 재생할 **텍스트 그대로** (가.mp3, 각.mp3, 먹다.mp3). 한글 그대로 씀.

## 생성 방법

### 0) Fundamental 챕터 전부 한 번에 (추천)

**index.ts에 연결된 모든 챕터**의 content 파일을 스캔해서 `word` 값만 자동으로 모은 뒤 TTS 생성.  
txt 목록을 따로 만들 필요 없음.

```bash
node scripts/generate-fundamental-audio.mjs
```


- 느리게: `EDGE_TTS_RATE=-25% node scripts/generate-fundamental-audio.mjs`
- `soundword_table` / `soundword` 블록 안의 `word: "..."` 를 전부 추출해 중복 제거 후 생성.

### 1) 모음×자음 조합 테이블 (가, 나, 다, … 140개)

고정된 14자음×10모음 조합만 필요할 때:

```bash
node scripts/generate-hangeul-syllable-audio.mjs
```

- 느리게: `EDGE_TTS_RATE=-25% node scripts/generate-hangeul-syllable-audio.mjs`

### 2) "/" 가 들어간 단어만 분리해서 재생성 (서 / 소 → 서 + 소 순서로 읽기)

`word`에 슬래시가 있으면(예: `"서 / 소"`, `"가다 / 오다"`) TTS가 한 덩어리로 읽어서 발음이 어색할 수 있음.  
이 스크립트는 **"/" 로 잘라서 각 부분을 따로 TTS 생성한 뒤, ffmpeg로 이어붙여** 한 파일로 저장함.

```bash
node scripts/regenerate-audio-with-slash.mjs
```

- **필요**: `pip install edge-tts`, **ffmpeg** 설치
- `/` 포함된 word만 골라서 전부 덮어써서 생성. (예: `서 - 소.mp3` = "서" 재생 + "소" 재생)
- 느리게: `EDGE_TTS_RATE=-25% node scripts/regenerate-audio-with-slash.mjs`

### 3) 목록 파일로 임의 문장/단어 생성 (배침, 숫자, 표현 등)

챕터마다 필요한 단어·문장이 다를 때:

1. **목록 파일** 만들기: `scripts/audio-lists/이름.txt`
   - 한 줄에 하나씩. 빈 줄·`#` 시작 줄은 무시.
   - 예: `scripts/audio-lists/hangeul-batchim-basics.txt`

2. **실행**:

```bash
node scripts/generate-audio-from-list.mjs scripts/audio-lists/hangeul-batchim-basics.txt
```

- 느리게: `EDGE_TTS_RATE=-25% node scripts/generate-audio-from-list.mjs scripts/audio-lists/파일명.txt`

생성된 파일은 `public/audio/각.mp3`, `public/audio/먹다.mp3` 처럼 **줄 내용 그대로** 이름이 붙습니다.

## 콘텐츠에서 오디오가 잡히는 규칙

- **soundword_table**  
  - `row.word`에 **완성형 한글**(가, 각, 먹다 등)이 있으면 → `/audio/{word}.mp3` 사용.  
  - 없으면(자음/모음만 있을 때) → `meaning` 기준 (Giyeok→giyeok.mp3, A→a.mp3).
- **hangeul_syllable_table**  
  - 셀 = 자음+모음 한 글자 → `/audio/가.mp3`, `/audio/나.mp3` 등 (1번 스크립트로 생성).

**새 챕터에 단어/문장 소리 넣는 방법**:

- **방법 A (추천)**: 콘텐츠에만 `word` 넣어 두고 `node scripts/generate-fundamental-audio.mjs` 한 번 실행 → index에 있는 모든 챕터에서 word를 모아서 일괄 생성.
- **방법 B**: `scripts/audio-lists/챕터이름.txt`에 한 줄에 하나씩 넣고 `node scripts/generate-audio-from-list.mjs scripts/audio-lists/챕터이름.txt` 실행.

## 옵션 (환경 변수)

| 변수 | 예 | 설명 |
|------|-----|------|
| `EDGE_TTS_VOICE` | `ko-KR-InJoonNeural` | TTS 음성 (기본값 동일) |
| `EDGE_TTS_RATE` | `-25%` | 재생 속도. 음수 = 느리게. |

이렇게 해두면 나중에 챕터만 바꿔 가면서 목록 파일 추가하고 위 명령만 다시 돌리면 됩니다.
