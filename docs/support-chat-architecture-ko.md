# 실시간 지원 채팅 위젯 (ChannelTalk 스타일) 아키텍처

이 문서는 `korean-teacher-mj` 프로젝트에 추가된 **실시간 지원 채팅(고객 문의) 위젯**의 구조와 동작 방식을 한국어로 정리한 것입니다.

## 1) 목표

- 사이트 어디서든 열 수 있는 **플로팅 채팅 위젯**
- **게스트도 사용 가능** (로그인 필수 아님)
- 메시지를 보내고 나면 **관리자(미니재)가 `/admin/support` 인박스에서 답변**
- 새 메시지가 **즉시 또는 거의 즉시** 반영되는 “실시간에 가까운” UX

## 2) 전체 구성요소

### 클라이언트 UI

- 위젯: `src/components/support/SupportChatWidget.tsx`
  - 우측 하단 플로팅 버튼 → 채팅창 열기/닫기
  - 서버에 저장된 스레드/메시지 로딩
  - 폴링 기반 리프레시 + (가능하면) Supabase Realtime 구독
  - 상대 작성중(typing) 표시
  - 이메일/이름은 **첫 메시지 이후** 채팅창 내부에서 입력 유도

- 관리자 인박스: `src/app/admin/support/page.tsx`
  - 스레드 리스트 (좌측) + 대화 상세/답장 (우측)
  - 폴링 기반 리프레시 + (가능하면) Supabase Realtime 구독
  - 사용자 작성중(typing) 표시

### 서버 API (Next.js Route Handlers)

#### Public (위젯용)

- `POST /api/public/support/threads`\n  새 스레드 생성
- `GET /api/public/support/threads/[id]`\n  스레드 + 메시지 목록 조회 (+ typing 상태 포함)
- `POST /api/public/support/threads/[id]/messages`\n  멤버 메시지 추가 (email/name은 있으면 스레드에 반영)
- `POST /api/public/support/threads/[id]/read`\n  멤버가 읽음 처리
- `POST /api/public/support/threads/[id]/identity`\n  첫 메시지 이후 이메일/이름을 스레드에 저장
- `POST /api/public/support/threads/[id]/typing`\n  멤버 작성중 상태 heartbeat

#### Admin (관리자 인박스용)

- `GET /api/admin/support/threads`\n  스레드 리스트 조회 (unread 포함)
- `GET /api/admin/support/threads/[id]`\n  스레드 + 메시지 목록 조회 (+ typing 상태 포함)
- `POST /api/admin/support/threads/[id]/messages`\n  관리자 메시지 추가
- `POST /api/admin/support/threads/[id]/read`\n  관리자가 읽음 처리
- `POST /api/admin/support/threads/[id]/typing`\n  관리자 작성중 상태 heartbeat

## 3) 데이터 저장소(영속화)

지원 채팅 데이터는 **MongoDB Atlas**에 영속 저장합니다.

- 연결 유틸: `src/lib/mongo.ts` (`MONGODB_URI`, 선택 `MONGODB_DB`)
- 도메인 로직: `src/lib/supportChats.ts`

### 컬렉션

- `support_threads`
- `support_messages`

### 데이터 모델

- `SupportThread`
  - `id`, `createdAt`, `updatedAt`
  - `status: "open" | "closed"`
  - `email?`, `name?`
  - `lastReadBySupportAt?`, `lastReadByMemberAt?`

- `SupportMessage`
  - `id`, `threadId`, `from: "member" | "support"`, `text`, `createdAt`

## 4) “실시간” 업데이트 전략

### 기본: 폴링(polling)

폴링은 **보조 수단(백업)** 입니다. (네트워크 이슈로 realtime 이벤트를 놓쳤을 때 복구용)

- 위젯: realtime 구독 + 약 60초 폴링(백업)
- 관리자: inbox realtime(`support_inbox`) 구독 + 약 15~60초 폴링(백업)

이 방식은 서버 부하를 크게 줄이고, 체감은 realtime에 가깝게 유지합니다.

### 옵션: Supabase Realtime (가능하면)

프로젝트에는 WebRTC 신호를 위해 Supabase Realtime이 이미 존재합니다. 지원 채팅도 동일한 채널 브로드캐스트를 “가속 장치”로 사용합니다.

- 채널: `support_thread_${threadId}`
- 이벤트: `broadcast` / `event: "support"`
- 동작: 메시지 전송 후 `broadcast`를 날려 상대 UI가 즉시 `GET`으로 새 데이터를 당겨오게 합니다.

추가로 관리자 인박스 갱신을 위해 글로벌 채널을 사용합니다.

- 채널: `support_inbox`
- 목적: 새 스레드/새 메시지 발생 시 관리자 리스트를 즉시 갱신

중요: `src/lib/supabaseClient.ts`는 env가 없으면 throw 합니다. 그래서 위젯/인박스에서는 Supabase를 **동적 import + try/catch**로만 사용해, 설정이 없어도 사이트 전체가 죽지 않게 했습니다.

## 5) 상대 작성중(typing) 표시

작성중 상태는 “영속 데이터”가 아니라 **짧은 TTL의 임시 상태**입니다.

- 저장 로직: `src/lib/supportTyping.ts` (메모리 Map + TTL)
- API로 heartbeat를 보내고(`POST .../typing`), `GET .../[id]` 응답에 `typing`을 포함하여 UI가 표시합니다.

주의: 이 방식은 Node 프로세스 메모리에 의존합니다. (개발 환경/단일 서버에서는 잘 동작) 서버리스/멀티 인스턴스 환경에서는 별도의 공유 저장소(예: Redis, Supabase Realtime presence)가 필요합니다.

## 6) 이메일/이름 수집 정책

요구사항에 따라 이메일/이름은 채팅 시작에 필수로 강제하지 않습니다.

- 첫 메시지 전송은 **게스트로 가능**
- 전송 후, 채팅창 내부에 “reply 받으려면 이메일 추가” 배너를 표시
- 사용자가 입력하면 `POST /api/public/support/threads/[id]/identity`로 저장

## 7) UX 디테일 (깜빡임 최소화)

- 폴링 시 `loading` 텍스트를 매번 렌더링하지 않고, 메시지 목록은 **이전 상태 유지** + 변경이 있을 때만 갱신합니다.
- 전송 상태는 `sending`으로 분리하여 버튼 disabled와 “Sending…” 같은 표시를 안정적으로 처리합니다.
- 새 메시지는 간단한 등장 애니메이션(`supportMsgIn`)으로 부드럽게 표시합니다.

## 8) 향후 확장 포인트

- 스레드 “close/reopen”
- 관리자 인증/권한 보호(현재 `/admin`은 보호 없음)
- 저장소를 JSON 파일 → DB(Supabase table 등)로 마이그레이션
- typing을 Supabase Realtime presence로 전환

