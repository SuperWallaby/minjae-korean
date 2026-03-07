# Stripe 설정 가이드 (Kaja 결제)

## 1. Stripe 계정 및 대시보드

1. [Stripe Dashboard](https://dashboard.stripe.com) 로그인
2. **Developers → API keys**에서 Publishable key / Secret key 확인
3. `.env` (또는 `.env.local`)에 설정:
   ```env
   STRIPE_SECRET_KEY=sk_live_xxxx   # 또는 테스트: sk_test_xxxx
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxx  # 프론트에서 필요 시
   ```

---

## 2. 상품·가격 생성 (Products & Prices)

### 2.1 진단 (Diagnosis)

- **Product**: 이름 예) `진단` 또는 `Diagnosis`
- **Price**: One-time, 금액 예) $10 USD
- 생성 후 **Price ID** 복사 (예: `price_xxxx`)
- `.env`에 추가:
  ```env
  STRIPE_PRICE_FIRST_TRIAL=price_xxxx
  ```

### 2.2 Single Session (1회권)

- **Product**: 이름 예) `Single Session` (50 min, 1회)
- **Price**: One-time, 금액 예) $15 USD
- `.env`에 추가:
  ```env
  STRIPE_PRICE_SINGLE_PASS=price_xxxx
  ```

### 2.3 Growth Program (주당 1/2/3회 → 월 결제)

유저가 **주당 횟수(1x / 2x / 3x)**를 선택한 뒤 **한 달 단위로 결제**하는 상품입니다.

**방법 A: Product 1개 + Price 3개 (권장)**

1. **Product** 생성
   - 이름: `Growth Program`
   - 설명: "Choose 1x, 2x, or 3x per week. Billed monthly."

2. **Price** 3개 생성 (같은 Product 아래):
   - **1x per week**
     - One-time
     - 금액: 예) $49 USD (표시 금액은 `src/data/pricing.ts`에서 수정)
     - Price ID → `STRIPE_PRICE_MONTHLY_1X`
   - **2x per week**
     - One-time
     - 금액: 예) $89 USD
     - Price ID → `STRIPE_PRICE_MONTHLY_2X`
   - **3x per week**
     - One-time
     - 금액: 예) $129 USD
     - Price ID → `STRIPE_PRICE_MONTHLY_3X`

**방법 B: Product 3개**

- Product: `Monthly 1x`, `Monthly 2x`, `Monthly 3x` 각각 생성 후 각각 Price 1개씩 생성
- 각 Price ID를 `STRIPE_PRICE_MONTHLY_1X`, `_2X`, `_3X`에 넣으면 됨.

**.env 예시**

```env
STRIPE_PRICE_MONTHLY_1X=price_xxxx
STRIPE_PRICE_MONTHLY_2X=price_xxxx
STRIPE_PRICE_MONTHLY_3X=price_xxxx
```

---

## 3. 환경 변수 정리

필수 항목:

| 변수명                     | 설명                                   |
| -------------------------- | -------------------------------------- |
| `STRIPE_SECRET_KEY`        | Stripe Secret key (서버 전용)          |
| `STRIPE_PRICE_FIRST_TRIAL` | 진단(Diagnosis) 1회 결제 Price ID      |
| `STRIPE_PRICE_SINGLE_PASS` | Single Session(50 min) Price ID        |
| `STRIPE_PRICE_MONTHLY_1X`  | Growth Program 주 1회 월 결제 Price ID |
| `STRIPE_PRICE_MONTHLY_2X`  | Growth Program 주 2회 월 결제 Price ID |
| `STRIPE_PRICE_MONTHLY_3X`  | Growth Program 주 3회 월 결제 Price ID |

기존에 `STRIPE_PRICE_MONTHLY`를 쓰고 있었다면 제거하고, 위 3개(`_1X`, `_2X`, `_3X`)로 교체하면 됩니다.

---

## 4. Webhook (결제 완료 시 크레딧 지급)

결제 완료 시 학생 계정에 크레딧을 넣으려면 Webhook이 필요합니다.

1. **Stripe Dashboard → Developers → Webhooks**
2. **Add endpoint**
3. **Endpoint URL**:  
   `https://your-domain.com/api/stripe/webhook`  
   (로컬 테스트 시 Stripe CLI로 터널링)
4. **Listen to**: `checkout.session.completed`
5. 생성 후 **Signing secret** 복사 (예: `whsec_xxxx`)
6. `.env`에 추가:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxx
   ```

### 로컬에서 Webhook 테스트 (Stripe CLI)

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

터미널에 출력되는 `whsec_...` 값을 `.env.local`의 `STRIPE_WEBHOOK_SECRET`에 넣으면 됩니다.

---

## 5. 표시 금액/문구 변경

- **표시용 금액·설명**: `src/data/pricing.ts`
  - `amountDisplay`, `label`, `description` 수정
- **실제 청구 금액**: Stripe Dashboard의 각 Price에서 수정

---

## 6. 크레딧 규칙 (현재 앱 동작)

| 상품              | 결제 후 지급        |
| ----------------- | ------------------- |
| 진단 (Diagnosis)  | 1회권 1개           |
| Single Session    | 1회권 1개           |
| Growth Program 1x | 4회권 (한 달 유효)  |
| Growth Program 2x | 8회권 (한 달 유효)  |
| Growth Program 3x | 12회권 (한 달 유효) |

유효기간은 결제일 기준 30일입니다. (코드: `src/app/api/stripe/webhook/route.ts`)
