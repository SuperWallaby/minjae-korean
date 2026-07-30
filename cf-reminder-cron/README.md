# Reminder + Newsletter Cron (Cloudflare Worker)

Vercel Hobby에서는 Cron이 지원되지 않으므로, Cloudflare Worker로 스케줄 작업을 호출합니다.

## 스케줄

| Cron | 동작 |
|------|------|
| `*/5 * * * *` | 예약 리마인더 |
| 월 09:00–09:04 KST | 주간 퀴즈 이메일 |
| 목 09:00–09:04 KST | **인기 표현(핀 이미지) 이메일** |

## 설정

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → Workers & Pages
2. 배포:

```bash
cd cf-reminder-cron
npx wrangler deploy
```

3. 시크릿 (최초 1회):

```bash
npx wrangler secret put REMINDER_API_URL
# 예: https://kajakorean.com

npx wrangler secret put ADMIN_API_KEY
# Vercel/Next 앱의 ADMIN_API_KEY와 동일
```

프로젝트 루트에서:

```bash
npm run deploy:cron
```

## 주간 퀴즈 이메일 수동 테스트

```bash
# 미리보기만 (발송 없음)
curl -s -H "x-admin-key: $ADMIN_API_KEY" \
  "https://kajakorean.com/api/admin/newsletter/weekly-quiz/run?dryRun=1"

# 강제 발송 (이번 주 중복 체크 무시)
curl -s -H "x-admin-key: $ADMIN_API_KEY" \
  "https://kajakorean.com/api/admin/newsletter/weekly-quiz/run?force=1"
```

## 인기 표현 이메일 수동 테스트

후보 핀 목록을 로컬에서 갱신한 뒤 배포에 포함하세요:

```bash
node scripts/sync-newsletter-expression-pins.mjs
```

```bash
# 미리보기만 (발송 없음)
curl -s -H "x-admin-key: $ADMIN_API_KEY" \
  "https://kajakorean.com/api/admin/newsletter/popular-expressions/run?dryRun=1"

# 본인에게만 테스트 발송
curl -s -H "x-admin-key: $ADMIN_API_KEY" \
  "https://kajakorean.com/api/admin/newsletter/popular-expressions/run?testTo=you@example.com"

# 강제 전체 발송 (이번 주 중복 체크 무시)
curl -s -H "x-admin-key: $ADMIN_API_KEY" \
  "https://kajakorean.com/api/admin/newsletter/popular-expressions/run?force=1"
```

## 이메일 형식

### 주간 퀴즈
- 한국어 **단어**를 주고, 맞는 **그림 4개** 중 고르기 (A–D)
- 퀴즈 이미지는 vocab quiz R2 CDN URL (`imageUrl`) — Gmail 등에서 `<img>`로 표시
- App Store / Google Play 배지 + 브라우저에서 풀기 링크
- 구독 해지 링크 포함

### 인기 표현 (주 1회)
- Pinterest에 올린 **인기 표현 핀 이미지 1장** + 핵심 표현 글로스
- 올린 지 **10일 이상**된 핀을 우선 (부족하면 더 최근 핀으로 채움)
- 차트 상세 페이지 / vocab hub 링크 + unsubscribe
