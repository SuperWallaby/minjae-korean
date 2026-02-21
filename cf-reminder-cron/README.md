# Reminder Cron (Cloudflare Worker)

Vercel Hobby에서는 Cron이 지원되지 않으므로, Cloudflare Worker로 5분마다 리마인더 API를 호출합니다.  
(이미 `vercel.json`에 crons를 넣었다면 Hobby에서는 동작하지 않으므로 해당 블록을 제거해도 됩니다.)

## 설정

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → Workers & Pages에서 로그인
2. 이 디렉터리에서 배포:

```bash
cd cf-reminder-cron
npx wrangler deploy
```

3. 시크릿 설정 (최초 1회):

```bash
npx wrangler secret put REMINDER_API_URL
# 입력: 프로덕션 사이트 URL (예: https://kaja.kr, 끝에 슬래시 없이)

npx wrangler secret put ADMIN_API_KEY
# 입력: Vercel/Next 앱의 ADMIN_API_KEY와 동일한 값
```

## 로컬에서 배포

프로젝트 루트에서:

```bash
yarn deploy:cron
# 또는
npm run deploy:cron
```

## 동작

- Worker가 **5분마다** 실행됩니다 (`*/5 * * * *`)
- `GET {REMINDER_API_URL}/api/admin/reminders/run` 를 `x-admin-key` 헤더로 호출합니다.
- Next 앱의 `ADMIN_API_KEY`와 같은 값을 시크릿으로 넣어두면 됩니다.
