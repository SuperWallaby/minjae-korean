/**
 * Expression SEO wave 2 — more phrase / concept / topik / similar (no grids).
 */
import type { VocabInfographicFormatId } from "./formats";

type BundlePriority = "high" | "medium" | "low";
type PhraseLine = { hangul: string; romanization: string; english: string };
type ConceptRow = {
  english: string;
  hangul: string;
  romanization: string;
  visual: string;
};
type TopikRow = {
  english: string;
  topikI: { hangul: string; romanization: string };
  topikII: { hangul: string; romanization: string };
};
type SimilarPair = {
  leftEnglish: string;
  rightEnglish: string;
  leftHangul: string;
  rightHangul: string;
  leftRom: string;
  rightRom: string;
  leftNuance: string;
  rightNuance: string;
};
type VocabBundle = {
  id: string;
  format: VocabInfographicFormatId;
  title: string;
  count: number;
  fit: string;
  priority: BundlePriority;
  tags: string[];
  preview?: string[];
  conceptRows?: ConceptRow[];
  phraseLines?: PhraseLine[];
  similarPair?: SimilarPair;
  topikRows?: TopikRow[];
};

function phrase(
  slug: string,
  title: string,
  lines: PhraseLine[],
  tags: string[],
  priority: BundlePriority = "high",
): VocabBundle {
  return {
    id: `phrase-${slug}`,
    format: "phrase_stack",
    title,
    count: lines.length,
    fit: `Polished ${lines.length}-phrase stack — spoken Korean`,
    priority,
    tags: ["phrase", "spoken", ...tags],
    phraseLines: lines,
    preview: lines.map((l) => l.english),
  };
}

function concept(
  slug: string,
  title: string,
  rows: ConceptRow[],
  tags: string[],
  priority: BundlePriority = "high",
): VocabBundle {
  return {
    id: `concept-${slug}`,
    format: "concept_rows",
    title,
    count: rows.length,
    fit: "Concept diagram panels — situation beats",
    priority,
    tags: ["concept", "grammar", ...tags],
    conceptRows: rows,
    preview: rows.map((r) => r.english),
  };
}

function topik(
  slug: string,
  title: string,
  rows: TopikRow[],
  tags: string[],
  priority: BundlePriority = "high",
): VocabBundle {
  return {
    id: `topik-${slug}`,
    format: "topik_upgrade",
    title,
    count: rows.length,
    fit: `TOPIK I→II upgrade — ${rows.length} pairs`,
    priority,
    tags: ["topik", "upgrade", ...tags],
    topikRows: rows,
    preview: rows.map((r) => r.english),
  };
}

function similar(
  slug: string,
  leftEnglish: string,
  rightEnglish: string,
  leftHangul: string,
  rightHangul: string,
  leftRom: string,
  rightRom: string,
  leftNuance: string,
  rightNuance: string,
  theme: string,
  priority: BundlePriority = "high",
): VocabBundle {
  return {
    id: `sim-${slug}`,
    format: "similar_split",
    title: `${leftEnglish} vs ${rightEnglish}`,
    count: 2,
    fit: `Near-synonyms — ${theme}: ${leftNuance} / ${rightNuance}`,
    priority,
    tags: ["similar", theme],
    similarPair: {
      leftEnglish,
      rightEnglish,
      leftHangul,
      rightHangul,
      leftRom,
      rightRom,
      leftNuance,
      rightNuance,
    },
    preview: [leftEnglish, rightEnglish],
  };
}

const L = (hangul: string, romanization: string, english: string): PhraseLine => ({
  hangul,
  romanization,
  english,
});
const C = (
  english: string,
  hangul: string,
  romanization: string,
  visual: string,
): ConceptRow => ({ english, hangul, romanization, visual });
const T = (
  english: string,
  iH: string,
  iR: string,
  iiH: string,
  iiR: string,
): TopikRow => ({
  english,
  topikI: { hangul: iH, romanization: iR },
  topikII: { hangul: iiH, romanization: iiR },
});

export const EXPR_WAVE2_PHRASE_BUNDLES: VocabBundle[] = [
  phrase("refuse-soft", "Soft refusal phrases in Korean", [
    L("괜찮아요", "gwaenchanayo", "It's okay / I'm fine"),
    L("됐어요", "dwaesseoyo", "I'm good, thanks"),
    L("지금은 괜찮아요", "jigeumeun gwaenchanayo", "Not right now"),
    L("다음에 할게요", "daeume halgeyo", "I'll do it next time"),
    L("생각 좀 해볼게요", "saenggak jom haebolgeyo", "I'll think about it"),
    L("오늘은 어려울 것 같아요", "oneureun eoryeoul geot gatayo", "Today might be hard"),
    L("죄송합니다만", "joesonghamnidaman", "I'm sorry, but…"),
    L("그건 좀…", "geugeon jom…", "That's a bit…"),
  ], ["polite", "daily"]),
  phrase("agree-soft", "Soft agreement phrases in Korean", [
    L("좋아요", "joayo", "Sounds good"),
    L("괜찮네요", "gwaenchannayo", "That works"),
    L("그럴게요", "geureolgeyo", "I'll do that"),
    L("동의해요", "donguihaeyo", "I agree"),
    L("맞아요", "majayo", "That's right"),
    L("좋은 생각이에요", "joeun saenggagieyo", "Good idea"),
    L("그렇게 하죠", "geureoge hajyo", "Let's do that"),
    L("저도요", "jeodoyo", "Me too"),
  ], ["polite", "daily"]),
  phrase("ask-favor", "Asking a favor in Korean", [
    L("부탁 하나 해도 돼요?", "butak hana haedo dwaeyo?", "Can I ask a favor?"),
    L("좀 도와주실 수 있어요?", "jom dowajusil su isseoyo?", "Could you help me?"),
    L("이거 봐 줄래요?", "igeo bwa jullaeyo?", "Can you look at this?"),
    L("잠깐만 기다려 줄래요?", "jamkkanman gidaryeo jullaeyo?", "Can you wait a sec?"),
    L("자리 좀 맡아 줄래요?", "jari jom mata jullaeyo?", "Can you save my seat?"),
    L("사진 찍어 주시겠어요?", "sajin jjigeo jusigesseoyo?", "Could you take a photo?"),
    L("문 좀 열어 주세요", "mun jom yeoreo juseyo", "Please open the door"),
    L("짐 들어 줄래요?", "jim deureo jullaeyo?", "Can you carry this?"),
  ], ["polite", "spoken"]),
  phrase("smalltalk-work", "Work small talk in Korean", [
    L("오늘도 수고하세요", "oneuldo sugohaseyo", "Have a good day at work"),
    L("점심 드셨어요?", "jeomsim deusyeosseoyo?", "Did you have lunch?"),
    L("커피 하실래요?", "keopi hasillaeyo?", "Want coffee?"),
    L("오늘 야근이에요?", "oneul yageunieyo?", "Working late today?"),
    L("주말 잘 보내세요", "jumal jal bonaeseyo", "Have a nice weekend"),
    L("회의 길었어요", "hoeui gireosseoyo", "The meeting ran long"),
    L("메일 확인하셨어요?", "meil hwaginhosyeosseoyo?", "Did you check the email?"),
    L("오늘 날씨 좋네요", "oneul nalssi jonnayo", "Nice weather today"),
  ], ["work", "spoken"]),
  phrase("commute-talk", "Commute phrases in Korean", [
    L("차가 막혀요", "chaga makyeoyo", "There's traffic"),
    L("지하철이 밀려요", "jihacheori millyeoyo", "The subway is crowded"),
    L("환승해야 해요", "hwanseunghaeya haeyo", "I need to transfer"),
    L("곧 도착해요", "got dochakhaeyo", "I'll arrive soon"),
    L("버스 놓쳤어요", "beoseu nochyeosseoyo", "I missed the bus"),
    L("택시 잡았어요", "taeksi jabasseoyo", "I caught a taxi"),
    L("도보로 갈게요", "doboro galgeyo", "I'll walk"),
    L("지각할 것 같아요", "jigakhal geot gatayo", "I might be late"),
  ], ["travel", "daily"]),
  phrase("feeling-check", "Feeling check-in phrases in Korean", [
    L("오늘 기분 어때요?", "oneul gibun eottaeyo?", "How are you feeling today?"),
    L("좀 피곤해 보여요", "jom pigonhae boyeoyo", "You look a bit tired"),
    L("괜찮아요, 걱정 마세요", "gwaenchanayo, geokjeong maseyo", "I'm fine, don't worry"),
    L("스트레스 받아요", "seuteureseu badayo", "I'm stressed"),
    L("기분이 좋아요", "gibuni joayo", "I feel good"),
    L("울고 싶어요", "ulgo sipeoyo", "I feel like crying"),
    L("설레요", "seolleyo", "I'm excited / nervous-happy"),
    L("긴장돼요", "ginjangdwaeyo", "I'm nervous"),
  ], ["feelings", "spoken"]),
  phrase("plans-tonight", "Tonight plans phrases in Korean", [
    L("오늘 저녁 뭐 해요?", "oneul jeonyeok mwo haeyo?", "What are you doing tonight?"),
    L("집에 있을 거예요", "jibe isseul geoyeyo", "I'll stay home"),
    L("친구 만나요", "chingu mannayo", "I'm meeting a friend"),
    L("운동하러 가요", "undonghareo gayo", "I'm going to work out"),
    L("드라마 볼 거예요", "deurama bol geoyeyo", "I'll watch a drama"),
    L("일찍 잘 거예요", "iljjik jal geoyeyo", "I'll sleep early"),
    L("밥 먹으러 갈래요?", "bap meogeureo gallaeayo?", "Want to go eat?"),
    L("내일로 미룰까요?", "naeillo mirulkkayo?", "Shall we put it off till tomorrow?"),
  ], ["plans", "spoken"]),
  phrase("money-pay", "Money & payment phrases in Korean", [
    L("현금으로 할게요", "hyeongeumeuro halgeyo", "I'll pay cash"),
    L("계좌이체 되나요?", "gyejwaiteche doenayo?", "Can I bank transfer?"),
    L("영수증 필요 없어요", "yeongsujeung piryo eopseoyo", "No receipt needed"),
    L("팁은 없나요?", "tibeun eomnayo?", "Is there no tip?"),
    L("분할 결제 되나요?", "bunhal gyeolje doenayo?", "Can I split the payment?"),
    L("할인 쿠폰 있어요", "harin kupon isseoyo", "I have a discount coupon"),
    L("포인트 적립해 주세요", "pointeu jeongniphhae juseyo", "Please add points"),
    L("거스름돈 주세요", "geoseureumdon juseyo", "Change, please"),
  ], ["shopping", "daily"]),
  phrase("apartment-life", "Apartment life phrases in Korean", [
    L("층간소음이 있어요", "cheunggan soeumi isseoyo", "There's noise from upstairs"),
    L("관리비 나왔어요", "gwanribi nawasseoyo", "The maintenance fee came"),
    L("택배 보관함이에요", "taekbae bogwanhamieyo", "It's in the parcel locker"),
    L("엘리베이터 고장이에요", "ellibeiteo gojangieyo", "The elevator is broken"),
    L("분리수거 날이에요", "bunrisugeo narieyo", "It's recycling day"),
    L("보일러가 안 돼요", "boileoga an dwaeyo", "The boiler isn't working"),
    L("수도가 안 나와요", "sudoga an nawayo", "There's no water"),
    L("열쇠를 두고 나왔어요", "yeolsoereul dugo nawasseoyo", "I locked myself out"),
  ], ["home", "daily"]),
  phrase("health-clinic", "Pharmacy & clinic phrases in Korean", [
    L("어디가 불편하세요?", "eodiga bulpyeonhaseyo?", "Where does it hurt?"),
    L("언제부터예요?", "eonjebuteoyeyo?", "Since when?"),
    L("약 처방해 주세요", "yak cheobanghae juseyo", "Please prescribe medicine"),
    L("보험 되나요?", "boheom doenayo?", "Is insurance accepted?"),
    L("주사가 필요해요?", "jusaga piryohaeyo?", "Do I need a shot?"),
    L("알레르기가 있어요", "allereugiga isseoyo", "I have allergies"),
    L("처방전 주세요", "cheobangjeon juseyo", "Prescription, please"),
    L("다시 와야 하나요?", "dasi waya hanayo?", "Do I need to come back?"),
  ], ["health", "beginner"]),
  phrase("school-campus", "Campus phrases in Korean", [
    L("수업이 취소됐어요", "sueobi chwisodwaesseoyo", "Class was canceled"),
    L("과제 제출했어요", "gwaje jejulhaesseoyo", "I submitted the homework"),
    L("시험 언제예요?", "siheom eonjeyeyo?", "When is the exam?"),
    L("도서관 자리 있어요?", "doseogwan jari isseoyo?", "Is there a seat in the library?"),
    L("조별 과제예요", "jobyeol gwajeyeyo", "It's a group project"),
    L("출석 체크해요", "chulseok chekeuhaeyo", "They're taking attendance"),
    L("휴강이에요", "hyugangieyo", "No class today"),
    L("성적 나왔어요", "seongjeok nawasseoyo", "Grades are out"),
  ], ["school", "spoken"]),
  phrase("kpop-talk", "K-pop fan phrases in Korean", [
    L("콘서트 티켓 구했어요", "konseoteu tiket guhaesseoyo", "I got concert tickets"),
    L("최애가 누구예요?", "choeaega nuguyeyo?", "Who's your bias?"),
    L("직캠 봤어요?", "jikkaem bwasseoyo?", "Did you watch the fancam?"),
    L("신곡 나왔어요", "singok nawasseoyo", "A new song dropped"),
    L("응원봉 가져왔어요", "eungwonbong gajyeowasseoyo", "I brought a light stick"),
    L("팬사인회 가요", "paensainhoe gayo", "I'm going to a fansign"),
    L("가사 해석해 줄래요?", "gasa haeseokhae jullaeyo?", "Can you explain the lyrics?"),
    L("무대 미쳤다", "mudae michyeotda", "The stage was insane"),
  ], ["culture", "spoken"]),
  phrase("weather-extreme", "Extreme weather phrases in Korean", [
    L("태풍이 와요", "taepungi wayo", "A typhoon is coming"),
    L("폭염이에요", "pogyeomieyo", "It's a heatwave"),
    L("미세먼지가 심해요", "misemeonjiga simhaeyo", "Fine dust is bad"),
    L("눈 조심하세요", "nun josimhaseyo", "Be careful of the snow"),
    L("우산 챙기세요", "usan chaenggiseyo", "Bring an umbrella"),
    L("길이 얼었어요", "giri eoreosseoyo", "The road is icy"),
    L("환기하세요", "hwangihaseyo", "Air out the room"),
    L("마스크 쓰세요", "maseukeu sseuseyo", "Wear a mask"),
  ], ["weather", "daily"]),
  phrase("dating-first", "First date phrases in Korean", [
    L("오늘 즐거웠어요", "oneul jeulgeowosseoyo", "I had a good time today"),
    L("또 만나고 싶어요", "tto mannago sipeoyo", "I'd like to meet again"),
    L("집까지 데려다 줄까요?", "jipkkaji deryeoda julkkayo?", "Shall I walk you home?"),
    L("연락처 알려 줄래요?", "yeollakcheo allyeo jullaeyo?", "Can I get your number?"),
    L("긴장되네요", "ginjangdoenayo", "I'm a bit nervous"),
    L("메뉴 추천해 주세요", "menyu chucheonhae juseyo", "Recommend a menu, please"),
    L("사진 같이 찍을까요?", "sajin gachi jjigeulkkayo?", "Shall we take a photo?"),
    L("다음에 뭐 할까요?", "daeume mwo halkkayo?", "What should we do next time?"),
  ], ["dating", "spoken"]),
  phrase("kids-parent", "Parenting phrases in Korean", [
    L("손 씻었니?", "son ssiseonni?", "Did you wash your hands?"),
    L("숙제 했어?", "sukje haesseo?", "Did you do homework?"),
    L("조심해서 놀아", "josimhaeseo nora", "Play carefully"),
    L("이제 잘 시간이야", "ije jal siganiya", "It's bedtime"),
    L("야채 먹어야지", "yachae meogeoyaji", "You should eat vegetables"),
    L("소리 지르지 마", "sori jireuji ma", "Don't yell"),
    L("착하네", "chakane", "You're being good"),
    L("엄마/아빠 올게", "eomma/appa olge", "Mom/Dad will be right there"),
  ], ["family", "spoken"]),
  phrase("customer-claim", "Customer complaint phrases in Korean", [
    L("문제가 있어요", "munjega isseoyo", "There's a problem"),
    L("교환해 주세요", "gyohwanhae juseyo", "Please exchange this"),
    L("환불해 주세요", "hwanbulhae juseyo", "Please refund this"),
    L("불량이에요", "bullyangieyo", "It's defective"),
    L("주문과 달라요", "jumunggwa dallayo", "It's different from the order"),
    L("매니저 불러 주세요", "maenijeo bulleo juseyo", "Please call the manager"),
    L("보상해 주실 수 있나요?", "bosanghae jusil su innayo?", "Can you compensate me?"),
    L("다시 확인해 주세요", "dasi hwaginhae juseyo", "Please check again"),
  ], ["shopping", "intermediate"]),
  phrase("online-meeting", "Online meeting phrases in Korean", [
    L("소리 들리세요?", "sori deulliseyo?", "Can you hear me?"),
    L("카메라 켜 주세요", "kamera kyeo juseyo", "Please turn on your camera"),
    L("화면 공유할게요", "hwamyeon gongyuhalgeyo", "I'll share my screen"),
    L("음소거 해제해 주세요", "eumsoogeo haejehae juseyo", "Please unmute"),
    L("잠깐 버퍼링이에요", "jamkkan beopeoringieyo", "There's a bit of lag"),
    L("링크 다시 보내 주세요", "ringkeu dasi bonae juseyo", "Please resend the link"),
    L("녹음해도 될까요?", "nogeumhaedo doelkkayo?", "May I record?"),
    L("다음에 이어서 하죠", "daeume ieoseo hajyo", "Let's continue next time"),
  ], ["work", "tech"]),
  phrase("travel-airport2", "Airport survival phrases in Korean", [
    L("탑승구가 어디예요?", "tapseungguga eodiyeyo?", "Where is the gate?"),
    L("수하물 찾는 곳요", "suhamul chatneun gosyo", "Baggage claim, please"),
    L("환승이에요", "hwanseungieyo", "I'm transferring"),
    L("좌석 변경하고 싶어요", "jwaseok byeongyeonghago sipeoyo", "I'd like to change seats"),
    L("지연되나요?", "jiyeondoenayo?", "Is it delayed?"),
    L("기내식 선택이요", "ginaesik seontaegiyo", "In-flight meal choice"),
    L("출입국 심사요", "churipguk simsayo", "Immigration, please"),
    L("면세점 어디예요?", "myeonsejeom eodiyeyo?", "Where is duty-free?"),
  ], ["travel", "beginner"]),
  phrase("neighbor-polite", "Neighborly phrases in Korean", [
    L("안녕하세요, 옆집이에요", "annyeonghaseyo, yeopjibieyo", "Hi, I'm your neighbor"),
    L("조금 조용히 해 주실 수 있나요?", "jogeum joyonghi hae jusil su innayo?", "Could you keep it down a bit?"),
    L("택배 받아 주셔서 감사해요", "taekbae bada jusyeoseo gamsahaeyo", "Thanks for taking my package"),
    L("쓰레기 버리는 날 아시나요?", "sseuregi beorineun nal asinayo?", "Do you know trash day?"),
    L("주차 자리가 없어요", "jucha jariga eopseoyo", "There's no parking spot"),
    L("초인종 고장이에요", "choinjong gojangieyo", "The doorbell is broken"),
    L("잠깐 빌릴 수 있을까요?", "jamkkan billil su isseulkkayo?", "Could I borrow this briefly?"),
    L("좋은 하루 되세요", "joeun haru doeseyo", "Have a nice day"),
  ], ["home", "polite"]),
  phrase("food-allergy", "Food allergy phrases in Korean", [
    L("알레르기가 있어요", "allereugiga isseoyo", "I have an allergy"),
    L("땅콩 빼 주세요", "ttangkong ppae juseyo", "No peanuts, please"),
    L("해산물 못 먹어요", "haesanmul mot meogeoyo", "I can't eat seafood"),
    L("맵지 않게 해 주세요", "maepji anke hae juseyo", "Please make it not spicy"),
    L("글루텐 프리 있나요?", "geulluten peuri innayo?", "Do you have gluten-free?"),
    L("유제품 빼 주세요", "yujepum ppae juseyo", "No dairy, please"),
    L("돼지고기 빼 주세요", "dwaejigogi ppae juseyo", "No pork, please"),
    L("원재료 알려 주세요", "wonjaeryo allyeo juseyo", "Please tell me the ingredients"),
  ], ["food", "health"]),
];

export const EXPR_WAVE2_CONCEPT_BUNDLES: VocabBundle[] = [
  concept("please-vs-want", "Please vs want in Korean", [
    C("please give", "주세요", "juseyo", "Hands receiving an item politely"),
    C("I want", "갖고 싶어요", "gatgo sipeoyo", "Person pointing at a desired item"),
    C("I'd like to", "하고 싶어요", "hago sipeoyo", "Person looking eager to try an activity"),
    C("may I", "해도 돼요?", "haedo dwaeyo?", "Person asking permission with open palms"),
  ], ["requests", "beginner"]),
  concept("can-cant-scenes", "Can vs can't scenes in Korean", [
    C("I can", "할 수 있어요", "hal su isseoyo", "Person confidently finishing a task"),
    C("I can't", "못해요", "mothaeyo", "Person shaking head at a difficult task"),
    C("I couldn't", "못했어요", "mothaesseoyo", "Person looking regretful after failing"),
    C("I was able to", "할 수 있었어요", "hal su isseosseoyo", "Person celebrating a completed challenge"),
  ], ["ability", "beginner"]),
  concept("have-to-vs-want-to", "Have to vs want to in Korean", [
    C("have to", "해야 해요", "haeya haeyo", "Alarm clock forcing someone out of bed"),
    C("want to", "하고 싶어요", "hago sipeoyo", "Person daydreaming about a hobby"),
    C("don't have to", "안 해도 돼요", "an haedo dwaeyo", "Person relaxing with optional chores undone"),
    C("shouldn't", "하면 안 돼요", "hamyeon an dwaeyo", "Stop sign over a forbidden action"),
  ], ["modality", "beginner"]),
  concept("because-so-scenes", "Because / so scenes in Korean", [
    C("because", "왜냐하면", "waenyahamyeon", "Arrow pointing from cause to effect"),
    C("so / therefore", "그래서", "geuraeseo", "Person concluding after a reason"),
    C("that's why", "그래서요", "geuraeseoyo", "Person explaining a result"),
    C("for that reason", "그 이유로", "geu iyuro", "Checklist of reasons leading to a decision"),
  ], ["connectors", "beginner"]),
  concept("if-when-scenes", "If / when scenes in Korean", [
    C("if", "면", "myeon", "Forked path labeled with a condition"),
    C("when", "때", "ttae", "Clock marking a specific moment"),
    C("after", "후에", "hue", "Calendar flipping to the next day"),
    C("before", "전에", "jeone", "Person preparing before leaving home"),
  ], ["connectors", "beginner"]),
  concept("too-enough-scenes", "Too / enough in Korean", [
    C("too (excess)", "너무", "neomu", "Cup overflowing with liquid"),
    C("a bit", "조금", "jogeum", "Tiny spoonful of sauce"),
    C("enough", "충분해요", "chungbunhaeyo", "Filled battery icon at 100%"),
    C("not enough", "부족해요", "bujokhaeyo", "Almost-empty bottle"),
  ], ["degree", "beginner"]),
  concept("still-already-yet2", "Still / already / yet in Korean", [
    C("still", "아직", "ajik", "Person still waiting at a bus stop"),
    C("already", "벌써", "beolsseo", "Surprised person seeing finished work"),
    C("not yet", "아직 안", "ajik an", "Unchecked to-do list"),
    C("anymore", "더 이상", "deo isang", "Person putting away an old habit"),
  ], ["time", "beginner"]),
  concept("lend-borrow-scenes2", "Lend vs borrow scenes in Korean", [
    C("borrow", "빌려요", "billyeoyo", "Person receiving a book from a friend"),
    C("lend", "빌려줘요", "billyeojwoyo", "Person handing a charger to someone"),
    C("return", "돌려줘요", "dollyeojwoyo", "Person giving the item back"),
    C("keep", "가져요", "gajyeoyo", "Person putting the item in their bag"),
  ], ["verbs", "beginner"]),
  concept("hear-listen-scenes2", "Hear vs listen in Korean", [
    C("hear", "들려요", "deullyeoyo", "Sound waves reaching someone's ears"),
    C("listen", "들어요", "deureoyo", "Person wearing headphones attentively"),
    C("can't hear", "안 들려요", "an deullyeoyo", "Person cupping ear in a noisy place"),
    C("listen carefully", "잘 들어요", "jal deureoyo", "Student focused on a teacher"),
  ], ["verbs", "beginner"]),
  concept("remember-forget2", "Remember vs forget in Korean", [
    C("remember", "기억해요", "gieokhaeyo", "Lightbulb over a remembering person"),
    C("forget", "잊어버렸어요", "ijeobeoryeosseoyo", "Person patting empty pockets"),
    C("remind me", "알려 주세요", "allyeo juseyo", "Phone reminder notification"),
    C("don't forget", "잊지 마세요", "itji maseyo", "Sticky note on a fridge"),
  ], ["cognition", "beginner"]),
  concept("open-close2", "Open vs close in Korean", [
    C("open (door)", "열어요", "yeoreoyo", "Hand opening a door"),
    C("close (door)", "닫아요", "dadayo", "Hand closing a door"),
    C("turn on", "켜요", "kyeoyo", "Finger flipping a light switch on"),
    C("turn off", "꺼요", "kkeoyo", "Finger flipping a light switch off"),
  ], ["daily", "beginner"]),
  concept("put-take-scenes", "Put vs take in Korean", [
    C("put / place", "놓아요", "noayo", "Person setting a cup on a table"),
    C("take / bring", "가져가요", "gajyeogayo", "Person picking up a bag to leave"),
    C("take out", "꺼내요", "kkeonaeyo", "Person taking a phone from a pocket"),
    C("put in", "넣어요", "neoeoyo", "Person putting keys into a bag"),
  ], ["verbs", "beginner"]),
  concept("same-different", "Same vs different in Korean", [
    C("same", "같아요", "gatayo", "Two matching puzzle pieces"),
    C("different", "달라요", "dallayo", "Two mismatched socks"),
    C("similar", "비슷해요", "biseuthaeyo", "Twins with small differences"),
    C("exactly", "정확해요", "jeonghwakhaeyo", "Target hit in the bullseye"),
  ], ["comparison", "beginner"]),
  concept("first-last-next", "First / last / next in Korean", [
    C("first", "먼저", "meonjeo", "Person stepping through a door first"),
    C("last", "마지막", "majimak", "Last page of a book"),
    C("next", "다음", "daeum", "Finger pointing to the next calendar day"),
    C("previous", "이전", "ijeon", "Arrow pointing back to yesterday"),
  ], ["order", "beginner"]),
  concept("inside-outside", "Inside vs outside in Korean", [
    C("inside", "안에", "ane", "Person sitting indoors by a window"),
    C("outside", "밖에", "bakke", "Person standing on a street"),
    C("here", "여기", "yeogi", "Person pointing at the ground near themselves"),
    C("there", "저기", "jeogi", "Person pointing far away"),
  ], ["location", "beginner"]),
  concept("with-without", "With vs without in Korean", [
    C("with", "와/과 함께", "wa/gwa hamkke", "Two friends walking side by side"),
    C("without", "없이", "eopsi", "Empty chair where a friend should be"),
    C("alone", "혼자", "honja", "Person dining alone"),
    C("together", "같이", "gachi", "Group toasting at a table"),
  ], ["companionship", "beginner"]),
  concept("start-stop-continue", "Start / stop / continue in Korean", [
    C("start", "시작해요", "sijakhaeyo", "Starter pistol / play button"),
    C("stop", "멈춰요", "meomchwoyo", "Red stop hand gesture"),
    C("continue", "계속해요", "gyesokhaeyo", "Person jogging without pausing"),
    C("quit", "그만해요", "geumanhaeyo", "Person closing a laptop and standing up"),
  ], ["verbs", "beginner"]),
  concept("right-wrong-scenes", "Right vs wrong in Korean", [
    C("right / correct", "맞아요", "majayo", "Green check mark over an answer"),
    C("wrong", "틀려요", "teullyeoyo", "Red X over an answer"),
    C("almost", "거의", "geoui", "Progress bar near completion"),
    C("exactly right", "정확해요", "jeonghwakhaeyo", "Dart in the bullseye"),
  ], ["evaluation", "beginner"]),
  concept("fast-slow-scenes", "Fast vs slow in Korean", [
    C("fast", "빨라요", "ppallayo", "Person sprinting"),
    C("slow", "느려요", "neuryeoyo", "Snail moving along a path"),
    C("hurry", "서두르세요", "seodureuseyo", "Person checking a watch and rushing"),
    C("take your time", "천천히 하세요", "cheoncheonhi haseyo", "Calm tea being poured slowly"),
  ], ["manner", "beginner"]),
  concept("big-small-scenes", "Big vs small in Korean", [
    C("big", "커요", "keoyo", "Huge suitcase next to a tiny one"),
    C("small", "작아요", "jagayo", "Tiny gift box in large hands"),
    C("many", "많아요", "manayo", "Crowd of people"),
    C("few", "적어요", "jeogeoyo", "Only two apples in a basket"),
  ], ["size", "beginner"]),
];

export const EXPR_WAVE2_TOPIK_BUNDLES: VocabBundle[] = [
  topik("daily-habits", "Daily habits: TOPIK I → II", [
    T("wake up", "일어나다", "ireonada", "기상하다", "gisanghada"),
    T("sleep", "자다", "jada", "취침하다", "chwichimhada"),
    T("eat", "먹다", "meokda", "식사하다", "sikashada"),
    T("exercise", "운동하다", "undonghada", "단련하다", "dallyeonhada"),
    T("study", "공부하다", "gongbuhada", "학습하다", "hakseuphada"),
    T("rest", "쉬다", "swida", "휴식하다", "hyusikhada"),
    T("work", "일하다", "ilhada", "근무하다", "geunmuhada"),
    T("clean", "청소하다", "cheongsohada", "정돈하다", "jeongdonhada"),
  ], ["daily"]),
  topik("feelings-upgrade", "Feelings upgrade: TOPIK I → II", [
    T("happy", "기쁘다", "gippeuda", "행복하다", "haengbokhada"),
    T("sad", "슬프다", "seulpeuda", "우울하다", "uulhada"),
    T("angry", "화나다", "hwanada", "분노하다", "bunnohada"),
    T("scared", "무섭다", "museopda", "공포를 느끼다", "gongporeul neukkida"),
    T("surprised", "놀라다", "nollada", "경악하다", "gyeongakhada"),
    T("bored", "지루하다", "jiruhada", "따분하다", "ttabunhada"),
    T("excited", "신나다", "sinnada", "흥분하다", "heungbunhada"),
    T("worried", "걱정하다", "geokjeonghada", "우려하다", "uryeohada"),
  ], ["emotion"]),
  topik("city-life", "City life: TOPIK I → II", [
    T("live", "살다", "salda", "거주하다", "geojuhada"),
    T("move", "이사하다", "isahada", "이전하다", "ijeonhada"),
    T("rent", "빌리다", "billida", "임차하다", "imchahada"),
    T("pay", "내다", "naeda", "납부하다", "napbuhada"),
    T("save (money)", "모으다", "moeuda", "저축하다", "jeochukhada"),
    T("spend", "쓰다", "sseuda", "지출하다", "jichulhada"),
    T("crowd", "많다", "manta", "혼잡하다", "honjaphada"),
    T("quiet", "조용하다", "joyonghada", "한산하다", "hansanhada"),
  ], ["city"]),
  topik("food-upgrade", "Food verbs: TOPIK I → II", [
    T("cook", "요리하다", "yorihada", "조리하다", "jorihada"),
    T("boil", "끓이다", "kkeurida", "삶다", "samda"),
    T("fry", "굽다", "gupda", "지지다", "jijida"),
    T("taste", "맛보다", "matboda", "시식하다", "sisikhada"),
    T("order", "시키다", "sikida", "주문하다", "jumunhada"),
    T("recommend", "추천하다", "chucheonhada", "권하다", "gwonhada"),
    T("delicious", "맛있다", "masitda", "훌륭하다", "hullyunghada"),
    T("spicy", "맵다", "maepda", "얼큰하다", "eolkkeunhada"),
  ], ["food"]),
  topik("media-verbs", "Media verbs: TOPIK I → II", [
    T("watch", "보다", "boda", "시청하다", "sicheonghada"),
    T("listen", "듣다", "deutda", "청취하다", "cheongchwihada"),
    T("upload", "올리다", "ollida", "업로드하다", "eopdeuhada"),
    T("download", "받다", "batda", "다운로드하다", "daunrodeuhada"),
    T("share", "공유하다", "gongyuhada", "전파하다", "jeonpahada"),
    T("comment", "댓글 달다", "daetgeul dalda", "의견을 남기다", "uigyeoneul namgida"),
    T("search", "찾다", "chatda", "검색하다", "geomsaekhada"),
    T("subscribe", "구독하다", "gudokhada", "구독 신청하다", "gudok sincheonghada"),
  ], ["media"]),
  topik("health-formal", "Health: TOPIK I → II", [
    T("hurt", "아프다", "apeuda", "통증을 느끼다", "tongjeungeul neukkida"),
    T("recover", "낫다", "natda", "회복하다", "hoebokhada"),
    T("exercise", "운동하다", "undonghada", "체육 활동하다", "cheyuk hwaldonghada"),
    T("diet", "다이어트하다", "daieoteuhada", "식이 조절하다", "sigi jojeolhada"),
    T("sleep well", "잘 자다", "jal jada", "숙면하다", "sungmyeonhada"),
    T("stress", "스트레스 받다", "seuteureseu batda", "압박을 받다", "apbageul batda"),
    T("hospital", "병원 가다", "byeongwon gada", "진료받다", "jinryobatda"),
    T("medicine", "약 먹다", "yak meokda", "복용하다", "bogyonghada"),
  ], ["health"]),
  topik("work-formal2", "Work verbs: TOPIK I → II", [
    T("work", "일하다", "ilhada", "업무를 보다", "eommureul boda"),
    T("meet", "만나다", "mannada", "면담하다", "myeondamhada"),
    T("report", "보고하다", "bogohada", "보고를 올리다", "bogoreul ollida"),
    T("prepare", "준비하다", "junbihada", "대비하다", "daebihada"),
    T("finish", "끝내다", "kkeunnaeda", "완료하다", "wanryohada"),
    T("delay", "늦추다", "neutchuda", "연기하다", "yeongihada"),
    T("hire", "뽑다", "ppopda", "채용하다", "chaeyonghada"),
    T("quit", "그만두다", "geumanduda", "퇴사하다", "toesahada"),
  ], ["work"]),
  topik("nature-upgrade", "Nature: TOPIK I → II", [
    T("mountain", "산", "san", "산악", "sanak"),
    T("sea", "바다", "bada", "해양", "haeyang"),
    T("river", "강", "gang", "하천", "hacheon"),
    T("forest", "숲", "sup", "산림", "sallim"),
    T("flower", "꽃", "kkot", "화훼", "hwahwe"),
    T("tree", "나무", "namu", "수목", "sumok"),
    T("sky", "하늘", "haneul", "창공", "changgong"),
    T("earth", "땅", "ttang", "대지", "daeji"),
  ], ["nature"]),
  topik("opinion-verbs", "Opinion verbs: TOPIK I → II", [
    T("think", "생각하다", "saenggakhada", "견해를 갖다", "gyeonhaereul gatda"),
    T("believe", "믿다", "mitda", "확신하다", "hwaksinhada"),
    T("doubt", "의심하다", "uisimhada", "회의하다", "hoeuihada"),
    T("agree", "동의하다", "donguihada", "찬성하다", "chanseonghada"),
    T("disagree", "반대하다", "bandaehada", "이의를 제기하다", "iuireul jegihada"),
    T("suggest", "제안하다", "jeeanhada", "제의하다", "jeuihada"),
    T("decide", "정하다", "jeonghada", "결정하다", "gyeoljeonghada"),
    T("choose", "고르다", "goreuda", "선정하다", "seonjeonghada"),
  ], ["opinion"]),
  topik("travel-formal2", "Travel upgrade: TOPIK I → II", [
    T("trip", "여행", "yeohaeng", "여행길", "yeohaenggil"),
    T("ticket", "표", "pyo", "승차권", "seungchagwon"),
    T("hotel", "호텔", "hotel", "숙박 시설", "sukbak siseol"),
    T("map", "지도", "jido", "안내도", "annaedo"),
    T("luggage", "짐", "jim", "수하물", "suhamul"),
    T("passport", "여권", "yeogwon", "여행 증명서", "yeohaeng jeungmyeongseo"),
    T("tour", "구경", "gugyeong", "관광", "gwangwang"),
    T("souvenir", "기념품", "ginyeompum", "특산품", "teuksanpum"),
  ], ["travel"]),
  topik("study-formal2", "Study verbs: TOPIK I → II", [
    T("read", "읽다", "ikda", "열독하다", "yeoldokhada"),
    T("write", "쓰다", "sseuda", "집필하다", "jippilhada"),
    T("memorize", "외우다", "oeuda", "암기하다", "amgihada"),
    T("review", "복습하다", "bokseuphada", "재학습하다", "jaehakseuphada"),
    T("practice", "연습하다", "yeonseuphada", "숙달하다", "sukdalhada"),
    T("explain", "설명하다", "seolmyeonghada", "해설하다", "haeseolhada"),
    T("ask", "묻다", "mutda", "질의하다", "jiruihada"),
    T("answer", "대답하다", "daedaphada", "응답하다", "eungdaphada"),
  ], ["study"]),
  topik("shopping-formal", "Shopping: TOPIK I → II", [
    T("buy", "사다", "sada", "구매하다", "gumaehada"),
    T("sell", "팔다", "palda", "판매하다", "panmaehada"),
    T("price", "값", "gap", "가격", "gagyeok"),
    T("cheap", "싸다", "ssada", "저렴하다", "jeoryeomhada"),
    T("expensive", "비싸다", "bissada", "고가이다", "gogaida"),
    T("discount", "할인", "harin", "세일", "seil"),
    T("refund", "환불", "hwanbul", "반품", "banpum"),
    T("receipt", "영수증", "yeongsujeung", "거래 명세", "georae myeongse"),
  ], ["shopping"]),
];

export const EXPR_WAVE2_SIMILAR_BUNDLES: VocabBundle[] = [
  similar("send-deliver", "Send", "Deliver", "보내다", "배달하다", "bonaeda", "baedalhada", "send a message/item", "deliver goods", "verbs"),
  similar("open-unlock", "Open", "Unlock", "열다", "잠금 해제하다", "yeolda", "jamgeum haejehada", "open a door/box", "unlock digitally", "verbs"),
  similar("close-lock", "Close", "Lock", "닫다", "잠그다", "datda", "jamgeuda", "close a door", "lock securely", "verbs"),
  similar("save-store", "Save", "Store", "저장하다", "보관하다", "jeojanghada", "bogwanhada", "save a file", "store physically", "verbs"),
  similar("delete-remove", "Delete", "Remove", "삭제하다", "제거하다", "sakjehada", "jegeohada", "delete digital", "remove an object", "verbs"),
  similar("fix-repair", "Fix", "Repair", "고치다", "수리하다", "gochida", "surihada", "casual fix", "formal repair", "verbs"),
  similar("choose-select", "Choose", "Select", "고르다", "선택하다", "goreuda", "seontaekhada", "pick casually", "select formally", "verbs"),
  similar("invite-recommend", "Invite", "Recommend", "초대하다", "추천하다", "chodaehada", "chucheonhada", "invite a person", "recommend a thing", "social"),
  similar("promise-swear", "Promise", "Vow", "약속하다", "맹세하다", "yaksokhada", "maengsehada", "everyday promise", "strong vow", "speech"),
  similar("worry-concern", "Worry", "Be concerned", "걱정하다", "우려하다", "geokjeonghada", "uryeohada", "personal worry", "formal concern", "emotion"),
  similar("enjoy-appreciate", "Enjoy", "Appreciate", "즐기다", "감상하다", "jeulgida", "gamsanghada", "enjoy activity", "appreciate art/music", "verbs"),
  similar("prepare-ready", "Prepare", "Get ready", "준비하다", "채비하다", "junbihada", "chaebihada", "prepare materials", "get oneself ready", "verbs"),
  similar("return-give-back", "Return", "Give back", "돌려주다", "반환하다", "dollyeojuda", "banhwanhada", "give back casually", "formal return", "verbs"),
  similar("miss-long-for", "Miss", "Long for", "보고 싶다", "그리워하다", "bogo sipda", "geuriwohada", "miss someone", "long for deeply", "emotion"),
  similar("hide-conceal", "Hide", "Conceal", "숨기다", "감추다", "sumgida", "gamchuda", "hide an object", "conceal information", "verbs"),
];

export const EXPR_WAVE2_BUNDLES: VocabBundle[] = [
  ...EXPR_WAVE2_PHRASE_BUNDLES,
  ...EXPR_WAVE2_CONCEPT_BUNDLES,
  ...EXPR_WAVE2_TOPIK_BUNDLES,
  ...EXPR_WAVE2_SIMILAR_BUNDLES,
];
