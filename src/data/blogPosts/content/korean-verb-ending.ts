import type { VerbEndingData } from "../verbEndingTypes";

export const verbEndingData: VerbEndingData = [
    {
      "form": "-고",
      "phonetic": "-go",
      "frequency": 5,
      "meaning": "and, then",
      "type": "연결",
      "form_rule": "verb stem + 고",
      "verb_type": "둘다",
      "des": "Use this to link two actions like “and/then.” It usually describes actions done by the same person, and the time (past/present) is shown in the final sentence.",
      "core_meaning": "connects actions in sequence",
      "function": "listing actions or sequence",
      "examples": [
        {
          "text": "밥을 먹고 학교에 갔어요.",
          "meaning": "I ate and went to school.",
          "feeling": "neutral factual narration",
          "sound": "/audio/밥을 먹고 학교에 갔어요.mp3"
        },
        {
          "text": "문을 열고 들어왔어요.",
          "meaning": "He opened the door and came in.",
          "feeling": "describing sequence",
          "sound": "/audio/문을 열고 들어왔어요.mp3"
        }
      ]
    },
    {
      "form": "-아/어서",
      "phonetic": "-a/eo-seo",
      "frequency": 5,
      "meaning": "because, so",
      "type": "연결",
      "form_rule": "verb stem + 아/어서",
      "verb_type": "둘다",
      "des": "Use this for a natural reason → result (“because… so…”). It usually works best when the subject is the same, and it’s not used for commands or suggestions.",
      "core_meaning": "cause leading to result",
      "function": "express reason",
      "examples": [
        {
          "text": "비가 와서 집에 있었어요.",
          "meaning": "It rained so I stayed home.",
          "feeling": "natural explanation",
          "sound": "/audio/비가 와서 집에 있었어요.mp3"
        },
        {
          "text": "피곤해서 잤어요.",
          "meaning": "I was tired so I slept.",
          "feeling": "personal reason",
          "sound": "/audio/피곤해서 잤어요.mp3"
        }
      ]
    },
    {
      "form": "-지만",
      "phonetic": "-ji-man",
      "frequency": 5,
      "meaning": "but, although",
      "type": "연결",
      "form_rule": "verb stem + 지만",
      "verb_type": "둘다",
      "des": "Use this to show a clear contrast (“but/although”). It simply connects two opposite facts or feelings, without special restrictions.",
      "core_meaning": "contrast two facts",
      "function": "express contrast",
      "examples": [
        {
          "text": "비싸지만 샀어요.",
          "meaning": "It was expensive but I bought it.",
          "feeling": "contrast decision",
          "sound": "/audio/비싸지만 샀어요.mp3"
        },
        {
          "text": "어렵지만 재미있어요.",
          "meaning": "It is difficult but interesting.",
          "feeling": "mixed feeling",
          "sound": "/audio/어렵지만 재미있어요.mp3"
        }
      ]
    },
    {
      "form": "-(으)면",
      "phonetic": "-(eu)-myeon",
      "frequency": 5,
      "meaning": "if, when",
      "type": "연결",
      "form_rule": "verb stem + 으면/면",
      "verb_type": "둘다",
      "des": "Use this for conditions (“if/when”). It’s common for general rules, habits, or future situations: “If X happens, then Y.”",
      "core_meaning": "condition leading to result",
      "function": "express condition",
      "examples": [
        {
          "text": "시간이 있으면 만나요.",
          "meaning": "If you have time, let's meet.",
          "feeling": "suggestion",
          "sound": "/audio/시간이 있으면 만나요.mp3"
        },
        {
          "text": "비가 오면 안 가요.",
          "meaning": "If it rains, I don't go.",
          "feeling": "conditional decision",
          "sound": "/audio/비가 오면 안 가요.mp3"
        }
      ]
    },
    {
      "form": "-는데",
      "phonetic": "-neun-de",
      "frequency": 5,
      "meaning": "and, but, background",
      "type": "연결",
      "form_rule": "verb stem + 는데",
      "verb_type": "둘다",
      "des": "Use this to set the scene or add soft contrast. It often sounds like you’re giving background information before the main point, or gently pushing to the next sentence.",
      "core_meaning": "provide background context",
      "function": "introduce situation",
      "examples": [
        {
          "text": "지금 바쁜데 나중에 전화할게요.",
          "meaning": "I'm busy now so I'll call later.",
          "feeling": "polite explanation",
          "sound": "/audio/지금 바쁜데 나중에 전화할게요.mp3"
        },
        {
          "text": "좋은데 조금 비싸요.",
          "meaning": "It's good but a bit expensive.",
          "feeling": "soft contrast",
          "sound": "/audio/좋은데 조금 비싸요.mp3"
        }
      ]
    },
    {
      "form": "-고 싶다",
      "phonetic": "-go sip-da",
      "frequency": 5,
      "meaning": "want to",
      "type": "보조",
      "form_rule": "verb stem + 고 싶다",
      "verb_type": "동사",
      "des": "Use this to say what someone wants to do (“want to…”). Most naturally, it describes the speaker’s own desire (I/we), especially in everyday conversation.",
      "core_meaning": "express desire",
      "function": "express want",
      "examples": [
        {
          "text": "한국에 가고 싶어요.",
          "meaning": "I want to go to Korea.",
          "feeling": "desire",
          "sound": "/audio/한국에 가고 싶어요.mp3"
        },
        {
          "text": "쉬고 싶어요.",
          "meaning": "I want to rest.",
          "feeling": "personal desire",
          "sound": "/audio/쉬고 싶어요.mp3"
        }
      ]
    },
    {
      "form": "-아/어야 하다",
      "phonetic": "-a/eo-ya ha-da",
      "frequency": 5,
      "meaning": "must, have to",
      "type": "보조",
      "form_rule": "verb stem + 아/어야 하다",
      "verb_type": "동사",
      "des": "Use this to express strong necessity (“must / have to”). It’s for duties, rules, or situations where you feel you have no choice.",
      "core_meaning": "necessity",
      "function": "express obligation",
      "examples": [
        {
          "text": "공부해야 해요.",
          "meaning": "I have to study.",
          "feeling": "duty",
          "sound": "/audio/공부해야 해요.mp3"
        },
        {
          "text": "지금 가야 해요.",
          "meaning": "I must go now.",
          "feeling": "necessity",
          "sound": "/audio/지금 가야 해요.mp3"
        }
      ]
    },
    {
      "form": "-네요",
      "phonetic": "-ne-yo",
      "frequency": 4,
      "meaning": "I see, oh",
      "type": "종결",
      "form_rule": "verb stem + 네요",
      "verb_type": "둘다",
      "des": "Use this when you notice or realize something in the moment (“Oh, I see!”). It’s polite and often shows surprise, discovery, or admiration.",
      "core_meaning": "express discovery",
      "function": "reaction",
      "examples": [
        {
          "text": "예쁘네요.",
          "meaning": "Oh, it's pretty.",
          "feeling": "admiration",
          "sound": "/audio/예쁘네요.mp3"
        },
        {
          "text": "비가 오네요.",
          "meaning": "Oh, it's raining.",
          "feeling": "realization",
          "sound": "/audio/비가 오네요.mp3"
        }
      ]
    },
    {
      "form": "-지요",
      "phonetic": "-ji-yo",
      "frequency": 4,
      "meaning": "right?, you know",
      "type": "종결",
      "form_rule": "verb stem + 지요",
      "verb_type": "둘다",
      "des": "Use this to gently confirm or seek agreement (“…, right?”). It can also sound like ‘you know’ when you assume the listener already understands.",
      "core_meaning": "seek agreement",
      "function": "confirmation",
      "examples": [
        {
          "text": "좋지요?",
          "meaning": "It's good, right?",
          "feeling": "seeking agreement",
          "sound": "/audio/좋지요?.mp3"
        },
        {
          "text": "어렵지요.",
          "meaning": "It's difficult, you know.",
          "feeling": "shared understanding",
          "sound": "/audio/어렵지요.mp3"
        }
      ]
    },
    {
      "form": "-더라",
      "phonetic": "-deo-ra",
      "frequency": 4,
      "meaning": "I saw, I experienced",
      "type": "종결",
      "form_rule": "verb stem + 더라",
      "verb_type": "둘다",
      "des": "Use this to report something you personally experienced or observed in the past. It feels like recalling what you saw or felt, from your own experience.",
      "core_meaning": "recalling experience",
      "function": "report experience",
      "examples": [
        {
          "text": "맛있더라.",
          "meaning": "It was delicious (I experienced it).",
          "feeling": "personal memory",
          "sound": "/audio/맛있더라.mp3"
        },
        {
          "text": "사람이 많더라.",
          "meaning": "There were many people.",
          "feeling": "recollection",
          "sound": "/audio/사람이 많더라.mp3"
        }
      ]
    },
        {
          "form": "-(으)ㄹ 때",
          "phonetic": "-(eu)l ttae",
          "frequency": 5,
          "meaning": "when, while",
          "type": "연결",
          "form_rule": "verb/adjective stem + (으)ㄹ 때",
          "verb_type": "둘다",
          "des": "Use this to say “when” something happens. It marks the time of an action or situation, like “When I do X, Y happens.”",
          "core_meaning": "marks the time something happens",
          "function": "express time (when)",
          "examples": [
            {
              "text": "시간이 있을 때 책을 읽어요.",
              "meaning": "I read books when I have time.",
              "feeling": "everyday habit",
              "sound": "/audio/시간이 있을 때 책을 읽어요.mp3"
            },
            {
              "text": "처음 한국에 왔을 때 많이 놀랐어요.",
              "meaning": "When I first came to Korea, I was very surprised.",
              "feeling": "past memory",
              "sound": "/audio/처음 한국에 왔을 때 많이 놀랐어요.mp3"
            }
          ]
        },
        {
          "form": "-기 전(에)",
          "phonetic": "-gi jeon(e)",
          "frequency": 5,
          "meaning": "before doing",
          "type": "연결",
          "form_rule": "verb stem + 기 전(에)",
          "verb_type": "동사",
          "des": "Use this to say “before doing something.” It clearly shows that one action happens earlier than another.",
          "core_meaning": "before doing an action",
          "function": "express time (before)",
          "examples": [
            {
              "text": "자기 전에 샤워해요.",
              "meaning": "I shower before sleeping.",
              "feeling": "routine",
              "sound": "/audio/자기 전에 샤워해요.mp3"
            },
            {
              "text": "출발하기 전에 다시 확인하세요.",
              "meaning": "Please check again before you leave.",
              "feeling": "practical instruction",
              "sound": "/audio/출발하기 전에 다시 확인하세요.mp3"
            }
          ]
        },
        {
          "form": "-고 나서",
          "phonetic": "-go na-seo",
          "frequency": 5,
          "meaning": "after doing, and then",
          "type": "연결",
          "form_rule": "verb stem + 고 나서",
          "verb_type": "동사",
          "des": "Use this to say “after doing X, then Y.” It emphasizes that one action is finished first, and the next happens afterward.",
          "core_meaning": "after completing an action",
          "function": "express sequence (after)",
          "examples": [
            {
              "text": "밥을 먹고 나서 커피를 마셨어요.",
              "meaning": "After eating, I drank coffee.",
              "feeling": "natural sequence",
              "sound": "/audio/밥을 먹고 나서 커피를 마셨어요.mp3"
            },
            {
              "text": "숙제를 하고 나서 게임해요.",
              "meaning": "I play games after doing my homework.",
              "feeling": "everyday order",
              "sound": "/audio/숙제를 하고 나서 게임해요.mp3"
            }
          ]
        },
        {
          "form": "-자마자",
          "phonetic": "-ja-ma-ja",
          "frequency": 4,
          "meaning": "as soon as",
          "type": "연결",
          "form_rule": "verb stem + 자마자",
          "verb_type": "동사",
          "des": "Use this for “as soon as.” It means the next action happens immediately, with almost no time in between.",
          "core_meaning": "immediate sequence",
          "function": "express time (immediately after)",
          "examples": [
            {
              "text": "집에 오자마자 잤어요.",
              "meaning": "As soon as I got home, I slept.",
              "feeling": "immediate action",
              "sound": "/audio/집에 오자마자 잤어요.mp3"
            },
            {
              "text": "수업이 끝나자마자 밖에 나갔어요.",
              "meaning": "As soon as class ended, I went outside.",
              "feeling": "quick transition",
              "sound": "/audio/수업이 끝나자마자 밖에 나갔어요.mp3"
            }
          ]
        },
        {
          "form": "-(으)면서",
          "phonetic": "-(eu)myeon-seo",
          "frequency": 5,
          "meaning": "while, as",
          "type": "연결",
          "form_rule": "verb stem + (으)면서",
          "verb_type": "동사",
          "des": "Use this to say two actions happen at the same time (“while doing X, do Y”). It often implies the same subject does both actions.",
          "core_meaning": "two actions at the same time",
          "function": "express simultaneous actions",
          "examples": [
            {
              "text": "음악을 들으면서 공부해요.",
              "meaning": "I study while listening to music.",
              "feeling": "everyday habit",
              "sound": "/audio/음악을 들으면서 공부해요.mp3"
            },
            {
              "text": "걸으면서 이야기했어요.",
              "meaning": "We talked while walking.",
              "feeling": "casual scene",
              "sound": "/audio/걸으면서 이야기했어요.mp3"
            }
          ]
        },
        {
          "form": "-다가",
          "phonetic": "-da-ga",
          "frequency": 4,
          "meaning": "while doing, then (change/stop)",
          "type": "연결",
          "form_rule": "verb stem + 다가",
          "verb_type": "동사",
          "des": "Use this when an action is interrupted or changes: “I was doing X, but then Y happened.” It often suggests a shift, stop, or unexpected turn.",
          "core_meaning": "interruption or change during an action",
          "function": "express interruption/shift",
          "examples": [
            {
              "text": "집에 가다가 친구를 만났어요.",
              "meaning": "While going home, I met a friend.",
              "feeling": "unexpected event",
              "sound": "/audio/집에 가다가 친구를 만났어요.mp3"
            },
            {
              "text": "공부하다가 잠이 들었어요.",
              "meaning": "I was studying and then I fell asleep.",
              "feeling": "action got interrupted",
              "sound": "/audio/공부하다가 잠이 들었어요.mp3"
            }
          ]
        },
        {
          "form": "-기 위해(서)",
          "phonetic": "-gi wi-hae(-seo)",
          "frequency": 4,
          "meaning": "in order to",
          "type": "연결",
          "form_rule": "verb stem + 기 위해(서)",
          "verb_type": "동사",
          "des": "Use this to express purpose (“in order to”). It clearly explains the goal behind an action, often in formal or neutral writing/speech.",
          "core_meaning": "purpose/goal",
          "function": "express purpose",
          "examples": [
            {
              "text": "건강을 위해서 운동해요.",
              "meaning": "I exercise for my health.",
              "feeling": "goal-oriented",
              "sound": "/audio/건강을 위해서 운동해요.mp3"
            },
            {
              "text": "시험에 합격하기 위해 열심히 공부했어요.",
              "meaning": "I studied hard in order to pass the exam.",
              "feeling": "determined",
              "sound": "/audio/시험에 합격하기 위해 열심히 공부했어요.mp3"
            }
          ]
        },
        {
          "form": "-(으)려고",
          "phonetic": "-(eu)ryeo-go",
          "frequency": 5,
          "meaning": "to try/intend to",
          "type": "연결",
          "form_rule": "verb stem + (으)려고",
          "verb_type": "동사",
          "des": "Use this to show intention or plan (“I’m going to / I intend to”). It’s very common in spoken Korean for personal plans.",
          "core_meaning": "intention",
          "function": "express intention",
          "examples": [
            {
              "text": "오늘 일찍 자려고 해요.",
              "meaning": "I’m going to sleep early today.",
              "feeling": "simple plan",
              "sound": "/audio/오늘 일찍 자려고 해요.mp3"
            },
            {
              "text": "밥을 먹으려고 식당에 갔어요.",
              "meaning": "I went to a restaurant to eat.",
              "feeling": "purposeful action",
              "sound": "/audio/밥을 먹으려고 식당에 갔어요.mp3"
            }
          ]
        },
        {
          "form": "-(으)러 가다/오다",
          "phonetic": "-(eu)reo ga-da/o-da",
          "frequency": 4,
          "meaning": "go/come to do",
          "type": "연결",
          "form_rule": "verb stem + (으)러 + 가다/오다",
          "verb_type": "동사",
          "des": "Use this to say you go or come somewhere for a purpose (“go/come to do X”). It focuses on the reason for moving.",
          "core_meaning": "movement with purpose",
          "function": "express purpose of going/coming",
          "examples": [
            {
              "text": "친구를 만나러 갈 거예요.",
              "meaning": "I’m going to meet a friend.",
              "feeling": "casual plan",
              "sound": "/audio/친구를 만나러 갈 거예요.mp3"
            },
            {
              "text": "커피 마시러 왔어요.",
              "meaning": "I came to drink coffee.",
              "feeling": "light intention",
              "sound": "/audio/커피 마시러 왔어요.mp3"
            }
          ]
        },
        {
          "form": "-(으)ㄹ 동안 / -는 동안",
          "phonetic": "-(eu)l dong-an / -neun dong-an",
          "frequency": 4,
          "meaning": "during, while",
          "type": "연결",
          "form_rule": "action: verb stem + 는 동안 / time period: verb/adjective stem + (으)ㄹ 동안",
          "verb_type": "둘다",
          "des": "Use this to say something happens during a time period (“during/while”). It focuses on the duration or time window when something is true.",
          "core_meaning": "during a period of time",
          "function": "express duration",
          "examples": [
            {
              "text": "방학 동안 한국에 있었어요.",
              "meaning": "I stayed in Korea during the vacation.",
              "feeling": "time window",
              "sound": "/audio/방학 동안 한국에 있었어요.mp3"
            },
            {
              "text": "기다리는 동안 책을 읽었어요.",
              "meaning": "I read a book while waiting.",
              "feeling": "filling time",
              "sound": "/audio/기다리는 동안 책을 읽었어요.mp3"
            }
          ]
        },
        {
            "form": "-(으)ㄹ 때마다",
            "phonetic": "-(eu)l ttae-ma-da",
            "frequency": 4,
            "meaning": "every time, whenever",
            "type": "연결",
            "form_rule": "verb/adjective stem + (으)ㄹ 때마다",
            "verb_type": "둘다",
            "des": "Use this for “every time / whenever.” It means the same thing happens repeatedly whenever a certain situation occurs.",
            "core_meaning": "repeated event each time",
            "function": "express repetition (whenever)",
            "examples": [
              {
                "text": "한국 노래를 들을 때마다 기분이 좋아져요.",
                "meaning": "Every time I listen to Korean songs, I feel better.",
                "feeling": "repeated reaction",
                "sound": "/audio/한국 노래를 들을 때마다 기분이 좋아져요.mp3"
              },
              {
                "text": "그 사람을 볼 때마다 웃음이 나요.",
                "meaning": "Whenever I see that person, I start smiling.",
                "feeling": "natural repeated feeling",
                "sound": "/audio/그 사람을 볼 때마다 웃음이 나요.mp3"
              }
            ]
          },
          {
            "form": "-(으)ㄴ/는 후에 / 뒤에",
            "phonetic": "-(eu)n/neun hu-e / dwi-e",
            "frequency": 5,
            "meaning": "after, later",
            "type": "연결",
            "form_rule": "past: verb stem + (으)ㄴ 후에/뒤에, present: verb stem + 는 후에/뒤에",
            "verb_type": "동사",
            "des": "Use this to say “after / later.” It simply places one action after another, often in a neutral, factual way.",
            "core_meaning": "after an action/time",
            "function": "express time (after)",
            "examples": [
              {
                "text": "수업이 끝난 후에 같이 밥 먹어요.",
                "meaning": "After class ends, let’s eat together.",
                "feeling": "simple plan",
                "sound": "/audio/수업이 끝난 후에 같이 밥 먹어요.mp3"
              },
              {
                "text": "일을 한 뒤에 집에 갔어요.",
                "meaning": "After working, I went home.",
                "feeling": "sequence",
                "sound": "/audio/일을 한 뒤에 집에 갔어요.mp3"
              }
            ]
          },
          {
            "form": "-는 한",
            "phonetic": "-neun han",
            "frequency": 3,
            "meaning": "as long as, while (condition holds)",
            "type": "연결",
            "form_rule": "verb stem + 는 한",
            "verb_type": "동사",
            "des": "Use this to mean “as long as.” It says the result stays true while a condition continues, and often sounds a bit firm or rule-like.",
            "core_meaning": "result holds while condition holds",
            "function": "express condition (as long as)",
            "examples": [
              {
                "text": "비가 오는 한 밖에 안 나갈 거예요.",
                "meaning": "As long as it’s raining, I won’t go outside.",
                "feeling": "firm decision",
                "sound": "/audio/비가 오는 한 밖에 안 나갈 거예요.mp3"
              },
              {
                "text": "약속을 지키는 한 믿을게요.",
                "meaning": "As long as you keep your promise, I’ll trust you.",
                "feeling": "conditional trust",
                "sound": "/audio/약속을 지키는 한 믿을게요.mp3"
              }
            ]
          },
          {
            "form": "-(으)ㄹ 경우(에)",
            "phonetic": "-(eu)l gyeong-u(-e)",
            "frequency": 3,
            "meaning": "in case, if (formal)",
            "type": "연결",
            "form_rule": "verb/adjective stem + (으)ㄹ 경우(에)",
            "verb_type": "둘다",
            "des": "Use this for “in case / if,” especially in formal 안내문, rules, or instructions. It sounds more official than -(으)면.",
            "core_meaning": "conditional case (formal)",
            "function": "express condition (formal case)",
            "examples": [
              {
                "text": "문제가 생길 경우에 바로 연락하세요.",
                "meaning": "If a problem occurs, contact us immediately.",
                "feeling": "formal instruction",
                "sound": "/audio/문제가 생길 경우에 바로 연락하세요.mp3"
              },
              {
                "text": "취소할 경우 수수료가 있을 수 있어요.",
                "meaning": "In case of cancellation, there may be a fee.",
                "feeling": "policy notice",
                "sound": "/audio/취소할 경우 수수료가 있을 수 있어요.mp3"
              }
            ]
          },
          {
            "form": "-(으)ㄴ/는 반면(에)",
            "phonetic": "-(eu)n/neun ban-myeon(-e)",
            "frequency": 3,
            "meaning": "whereas, while (contrast)",
            "type": "연결",
            "form_rule": "past: verb/adjective stem + (으)ㄴ 반면(에), present: verb stem + 는 반면(에)",
            "verb_type": "둘다",
            "des": "Use this to compare two sides and highlight a contrast (“whereas/while”). It often feels more written or explanatory than -지만.",
            "core_meaning": "contrast by comparison",
            "function": "express contrast (comparison)",
            "examples": [
              {
                "text": "저는 커피를 좋아하는 반면에 동생은 차를 좋아해요.",
                "meaning": "I like coffee, whereas my younger sibling likes tea.",
                "feeling": "balanced comparison",
                "sound": "/audio/저는 커피를 좋아하는 반면에 동생은 차를 좋아해요.mp3"
              },
              {
                "text": "여름은 덥지만 겨울은 추운 반면에 봄은 따뜻해요.",
                "meaning": "Summer is hot, whereas spring is warm (by comparison).",
                "feeling": "explanatory contrast",
                "sound": "/audio/여름은 덥지만 겨울은 추운 반면에 봄은 따뜻해요.mp3"
              }
            ]
          },
          {
            "form": "-거든(요)",
            "phonetic": "-geo-deun(yo)",
            "frequency": 4,
            "meaning": "because (casual explanation), you see",
            "type": "종결",
            "form_rule": "verb/adjective stem + 거든(요)",
            "verb_type": "둘다",
            "des": "Use this to add a casual, friendly explanation, like “because… you see.” It often sounds like you’re giving a reason after the fact.",
            "core_meaning": "explanatory reason (casual)",
            "function": "give a reason/explanation",
            "examples": [
              {
                "text": "오늘은 못 가요. 일이 있거든요.",
                "meaning": "I can’t go today. I have something to do, you see.",
                "feeling": "casual explanation",
                "sound": "/audio/오늘은 못 가요. 일이 있거든요.mp3"
              },
              {
                "text": "좀 늦을 거예요. 길이 막히거든요.",
                "meaning": "I’ll be a bit late. The traffic is bad, you see.",
                "feeling": "soft justification",
                "sound": "/audio/좀 늦을 거예요. 길이 막히거든요.mp3"
              }
            ]
          },
          {
            "form": "-길래",
            "phonetic": "-gil-lae",
            "frequency": 3,
            "meaning": "so (based on what I saw/heard)",
            "type": "연결",
            "form_rule": "verb/adjective stem + 길래",
            "verb_type": "둘다",
            "des": "Use this when you act based on what you saw or heard, like “Since I noticed/heard X, I did Y.” It feels conversational.",
            "core_meaning": "reason based on observation",
            "function": "explain reason (based on what was seen/heard)",
            "examples": [
              {
                "text": "비가 오길래 우산을 샀어요.",
                "meaning": "Since I saw it was raining, I bought an umbrella.",
                "feeling": "casual observation → action",
                "sound": "/audio/비가 오길래 우산을 샀어요.mp3"
              },
              {
                "text": "힘들어 보이길래 먼저 도와줬어요.",
                "meaning": "Since you looked tired, I helped first.",
                "feeling": "considerate reasoning",
                "sound": "/audio/힘들어 보이길래 먼저 도와줬어요.mp3"
              }
            ]
          },
          {
            "form": "-느라고",
            "phonetic": "-neu-ra-go",
            "frequency": 3,
            "meaning": "because of doing (negative result)",
            "type": "연결",
            "form_rule": "verb stem + 느라고",
            "verb_type": "동사",
            "des": "Use this when doing X caused a negative result, like “Because I was busy doing X, (I couldn’t do Y).” It often implies excuse or regret.",
            "core_meaning": "negative consequence due to focus on action",
            "function": "express reason (negative consequence)",
            "examples": [
              {
                "text": "일하느라고 전화를 못 받았어요.",
                "meaning": "I couldn’t answer because I was working.",
                "feeling": "apologetic excuse",
                "sound": "/audio/일하느라고 전화를 못 받았어요.mp3"
              },
              {
                "text": "준비하느라고 밤을 샜어요.",
                "meaning": "I stayed up all night because I was preparing.",
                "feeling": "tired regret",
                "sound": "/audio/준비하느라고 밤을 샜어요.mp3"
              }
            ]
          },
          {
            "form": "-는 바람에",
            "phonetic": "-neun ba-ram-e",
            "frequency": 3,
            "meaning": "because of (unexpected/negative outcome)",
            "type": "연결",
            "form_rule": "verb stem + 는 바람에",
            "verb_type": "동사",
            "des": "Use this when something happened unexpectedly and caused a bad result. It feels like “because of X (unfortunately), Y happened.”",
            "core_meaning": "unexpected cause leading to negative result",
            "function": "express cause (unfortunate result)",
            "examples": [
              {
                "text": "비가 오는 바람에 소풍을 못 갔어요.",
                "meaning": "Because it rained, we couldn’t go on the picnic.",
                "feeling": "unfortunate situation",
                "sound": "/audio/비가 오는 바람에 소풍을 못 갔어요.mp3"
              },
              {
                "text": "버스를 놓치는 바람에 지각했어요.",
                "meaning": "Because I missed the bus, I was late.",
                "feeling": "regretful",
                "sound": "/audio/버스를 놓치는 바람에 지각했어요.mp3"
              }
            ]
          },
          {
            "form": "-는 탓에",
            "phonetic": "-neun tat-e",
            "frequency": 3,
            "meaning": "because of (blame)",
            "type": "연결",
            "form_rule": "verb stem + 는 탓에",
            "verb_type": "동사",
            "des": "Use this to blame a cause for a bad outcome, like “because of X’s fault.” It can sound critical, so use it carefully.",
            "core_meaning": "cause with blame",
            "function": "express cause (blaming tone)",
            "examples": [
              {
                "text": "내가 늦게 출발하는 탓에 약속에 늦었어요.",
                "meaning": "Because I left late (my fault), I was late for the appointment.",
                "feeling": "self-blame",
                "sound": "/audio/내가 늦게 출발하는 탓에 약속에 늦었어요.mp3"
              },
              {
                "text": "준비를 안 하는 탓에 실수했어요.",
                "meaning": "Because you didn’t prepare (your fault), you made a mistake.",
                "feeling": "critical blame",
                "sound": "/audio/준비를 안 하는 탓에 실수했어요.mp3"
              }
            ]
          },
            {
              "form": "-덕분에",
              "phonetic": "-deok-bun-e",
              "frequency": 4,
              "meaning": "thanks to",
              "type": "연결",
              "form_rule": "noun + 덕분에 / verb stem + (으)ㄴ/는 덕분에",
              "verb_type": "둘다",
              "des": "Use this to say “thanks to” someone or something. It usually highlights a positive result, and can sound appreciative or relieved.",
              "core_meaning": "positive result due to a cause",
              "function": "express cause (positive/thanks)",
              "examples": [
                {
                  "text": "친구 덕분에 숙제를 빨리 끝냈어요.",
                  "meaning": "Thanks to my friend, I finished the homework quickly.",
                  "feeling": "grateful",
                  "sound": "/audio/친구 덕분에 숙제를 빨리 끝냈어요.mp3"
                },
                {
                  "text": "연습을 많이 한 덕분에 잘했어요.",
                  "meaning": "Because I practiced a lot, I did well (thanks to that).",
                  "feeling": "relieved pride",
                  "sound": "/audio/연습을 많이 한 덕분에 잘했어요.mp3"
                }
              ]
            },
            {
              "form": "-다 보니",
              "phonetic": "-da bo-ni",
              "frequency": 4,
              "meaning": "as I kept doing, I realized",
              "type": "연결",
              "form_rule": "verb stem + 다 보니",
              "verb_type": "동사",
              "des": "Use this when something becomes true as a natural result of doing something repeatedly. It feels like “After doing it for a while, I noticed/ended up…”",
              "core_meaning": "natural result discovered over time",
              "function": "express result after repetition/time",
              "examples": [
                {
                  "text": "한국어를 공부하다 보니 재미있어졌어요.",
                  "meaning": "As I kept studying Korean, it became fun.",
                  "feeling": "gradual change",
                  "sound": "/audio/한국어를 공부하다 보니 재미있어졌어요.mp3"
                },
                {
                  "text": "같이 일하다 보니 성격을 알게 됐어요.",
                  "meaning": "After working together for a while, I got to know their personality.",
                  "feeling": "natural realization",
                  "sound": "/audio/같이 일하다 보니 성격을 알게 됐어요.mp3"
                }
              ]
            },
            {
              "form": "-다 보면",
              "phonetic": "-da bo-myeon",
              "frequency": 4,
              "meaning": "if/when you keep doing, eventually",
              "type": "연결",
              "form_rule": "verb stem + 다 보면",
              "verb_type": "동사",
              "des": "Use this to say something will happen eventually if you keep doing something. It’s like “If you keep doing X, you’ll end up Y.”",
              "core_meaning": "eventual outcome with continued action",
              "function": "express eventual result",
              "examples": [
                {
                  "text": "연습하다 보면 늘어요.",
                  "meaning": "If you keep practicing, you’ll improve.",
                  "feeling": "encouraging",
                  "sound": "/audio/연습하다 보면 늘어요.mp3"
                },
                {
                  "text": "살다 보면 그런 날도 있어요.",
                  "meaning": "If you live long enough, there are days like that.",
                  "feeling": "calm wisdom",
                  "sound": "/audio/살다 보면 그런 날도 있어요.mp3"
                }
              ]
            },
            {
              "form": "-더니",
              "phonetic": "-deo-ni",
              "frequency": 3,
              "meaning": "and then (change), after noticing",
              "type": "연결",
              "form_rule": "verb/adjective stem + 더니",
              "verb_type": "둘다",
              "des": "Use this when you noticed one situation, and then a different result happened. It often shows a change over time, like “It was X, and then it became Y.”",
              "core_meaning": "change after observed state",
              "function": "express change/contrast over time",
              "examples": [
                {
                  "text": "아까는 춥더니 지금은 따뜻해요.",
                  "meaning": "It was cold earlier, but now it’s warm.",
                  "feeling": "noticing change",
                  "sound": "/audio/아까는 춥더니 지금은 따뜻해요.mp3"
                },
                {
                  "text": "열심히 하더니 결국 성공했어요.",
                  "meaning": "They worked hard, and in the end they succeeded.",
                  "feeling": "result after effort",
                  "sound": "/audio/열심히 하더니 결국 성공했어요.mp3"
                }
              ]
            },
            {
              "form": "-고 보니(까)",
              "phonetic": "-go bo-ni(kka)",
              "frequency": 3,
              "meaning": "after doing/looking, I realized",
              "type": "연결",
              "form_rule": "verb stem + 고 보니(까)",
              "verb_type": "동사",
              "des": "Use this when you realize something after trying or checking. It feels like “When I did/checked it, I found out…”",
              "core_meaning": "realization after doing/checking",
              "function": "express discovery after action",
              "examples": [
                {
                  "text": "다시 생각해 보고 보니 내가 틀렸어요.",
                  "meaning": "After thinking again, I realized I was wrong.",
                  "feeling": "self-realization",
                  "sound": "/audio/다시 생각해 보고 보니 내가 틀렸어요.mp3"
                },
                {
                  "text": "가서 보니까 문이 닫혀 있었어요.",
                  "meaning": "When I went there, I found the door was closed.",
                  "feeling": "unexpected discovery",
                  "sound": "/audio/가서 보니까 문이 닫혀 있었어요.mp3"
                }
              ]
            },
            {
              "form": "-자",
              "phonetic": "-ja",
              "frequency": 4,
              "meaning": "let’s, as soon as (written/plan)",
              "type": "연결",
              "form_rule": "verb stem + 자",
              "verb_type": "동사",
              "des": "Use this to mean “as soon as X happens, Y happens,” often in writing or fixed expressions. In conversation, it can also sound like a firm suggestion in set phrases.",
              "core_meaning": "immediate trigger or firm proposal (limited)",
              "function": "express immediate sequence (often written)",
              "examples": [
                {
                  "text": "집에 도착하자 바로 전화했어요.",
                  "meaning": "As soon as I arrived home, I called right away.",
                  "feeling": "immediate action",
                  "sound": "/audio/집에 도착하자 바로 전화했어요.mp3"
                },
                {
                  "text": "문을 열자 바람이 들어왔어요.",
                  "meaning": "As soon as I opened the door, wind came in.",
                  "feeling": "instant result",
                  "sound": "/audio/문을 열자 바람이 들어왔어요.mp3"
                }
              ]
            },
            {
              "form": "-고서야",
              "phonetic": "-go-seo-ya",
              "frequency": 3,
              "meaning": "only after",
              "type": "연결",
              "form_rule": "verb stem + 고서야",
              "verb_type": "동사",
              "des": "Use this to emphasize “only after X did Y finally happen.” It often carries a strong tone: delay, regret, or ‘finally’ feeling.",
              "core_meaning": "only after (emphasis)",
              "function": "express delayed result",
              "examples": [
                {
                  "text": "아파 보고서야 건강이 중요하다는 걸 알았어요.",
                  "meaning": "Only after getting sick did I realize health is important.",
                  "feeling": "regretful lesson",
                  "sound": "/audio/아파 보고서야 건강이 중요하다는 걸 알았어요.mp3"
                },
                {
                  "text": "끝까지 해 보고서야 포기했어요.",
                  "meaning": "Only after trying to the end did I give up.",
                  "feeling": "finally / exhausted",
                  "sound": "/audio/끝까지 해 보고서야 포기했어요.mp3"
                }
              ]
            },
            {
              "form": "-(으)ㄴ/는 김에",
              "phonetic": "-(eu)n/neun gim-e",
              "frequency": 3,
              "meaning": "while you’re at it",
              "type": "연결",
              "form_rule": "past: verb stem + (으)ㄴ 김에, present: verb stem + 는 김에",
              "verb_type": "동사",
              "des": "Use this to do an extra action while you’re already doing something. It’s like “Since I’m here / while I’m at it, I’ll also do…”",
              "core_meaning": "take the chance to do something extra",
              "function": "express doing an additional action",
              "examples": [
                {
                  "text": "마트에 간 김에 우유도 샀어요.",
                  "meaning": "Since I went to the mart, I also bought milk.",
                  "feeling": "efficient add-on",
                  "sound": "/audio/마트에 간 김에 우유도 샀어요.mp3"
                },
                {
                  "text": "나온 김에 은행도 들를게요.",
                  "meaning": "Since I’m out anyway, I’ll stop by the bank too.",
                  "feeling": "practical plan",
                  "sound": "/audio/나온 김에 은행도 들를게요.mp3"
                }
              ]
            },
            {
              "form": "-(으)ㄴ/는 대신(에)",
              "phonetic": "-(eu)n/neun dae-sin(-e)",
              "frequency": 4,
              "meaning": "instead of, in return for",
              "type": "연결",
              "form_rule": "past: verb stem + (으)ㄴ 대신(에), present: verb stem + 는 대신(에)",
              "verb_type": "동사",
              "des": "Use this to say “instead of” (choose B rather than A), or “in return for” (A, and as compensation B). Context decides which meaning fits.",
              "core_meaning": "substitution or compensation",
              "function": "express replacement/compensation",
              "examples": [
                {
                  "text": "택시를 타는 대신에 지하철을 탔어요.",
                  "meaning": "Instead of taking a taxi, I took the subway.",
                  "feeling": "practical choice",
                  "sound": "/audio/택시를 타는 대신에 지하철을 탔어요.mp3"
                },
                {
                  "text": "제가 도와준 대신에 커피를 사 줬어요.",
                  "meaning": "In return for my help, they bought me coffee.",
                  "feeling": "fair exchange",
                  "sound": "/audio/제가 도와준 대신에 커피를 사 줬어요.mp3"
                }
              ]
            },
            {
              "form": "-(으)ㄴ/는 데다(가)",
              "phonetic": "-(eu)n/neun de-da(ga)",
              "frequency": 3,
              "meaning": "in addition to, on top of",
              "type": "연결",
              "form_rule": "past: verb/adjective stem + (으)ㄴ 데다(가), present: verb stem + 는 데다(가)",
              "verb_type": "둘다",
              "des": "Use this to add another point on top of the first one (“in addition to / on top of that”). It often stacks reasons or complaints.",
              "core_meaning": "addition of another point",
              "function": "add information (often reasons)",
              "examples": [
                {
                  "text": "비가 오는 데다 바람도 불어요.",
                  "meaning": "On top of raining, it’s also windy.",
                  "feeling": "complaining / unlucky",
                  "sound": "/audio/비가 오는 데다 바람도 불어요.mp3"
                },
                {
                  "text": "그 식당은 맛있는 데다 가격도 싸요.",
                  "meaning": "That restaurant is delicious, and on top of that, it’s cheap.",
                  "feeling": "positive listing",
                  "sound": "/audio/그 식당은 맛있는 데다 가격도 싸요.mp3"
                }
              ]
            },
                {
                  "form": "-(으)ㄴ/는 이상",
                  "phonetic": "-(eu)n/neun i-sang",
                  "frequency": 3,
                  "meaning": "since, as long as (given that)",
                  "type": "연결",
                  "form_rule": "past: verb/adjective stem + (으)ㄴ 이상, present: verb stem + 는 이상",
                  "verb_type": "둘다",
                  "des": "Use this when you accept a situation as a given and draw a firm conclusion: “Since it’s X, we should/must do Y.” It often sounds decisive or 책임감 있는 톤.",
                  "core_meaning": "given condition → firm conclusion",
                  "function": "express reason/condition with firmness",
                  "examples": [
                    {
                      "text": "시작한 이상 끝까지 해야 해요.",
                      "meaning": "Since we started, we must finish to the end.",
                      "feeling": "firm determination",
                      "sound": "/audio/시작한 이상 끝까지 해야 해요.mp3"
                    },
                    {
                      "text": "약속한 이상 꼭 지킬게요.",
                      "meaning": "Since I promised, I’ll definitely keep it.",
                      "feeling": "responsible commitment",
                      "sound": "/audio/약속한 이상 꼭 지킬게요.mp3"
                    }
                  ]
                },
                {
                  "form": "-(으)ㄹ 뿐(만) 아니라",
                  "phonetic": "-(eu)l ppun(man) a-ni-ra",
                  "frequency": 4,
                  "meaning": "not only ... but also",
                  "type": "연결",
                  "form_rule": "verb/adjective stem + (으)ㄹ 뿐(만) 아니라",
                  "verb_type": "둘다",
                  "des": "Use this for “not only A, but also B.” It’s a strong way to add information and emphasize that there’s more than one point.",
                  "core_meaning": "A is true, and B is also true",
                  "function": "add emphasis (not only/but also)",
                  "examples": [
                    {
                      "text": "그 사람은 친절할 뿐만 아니라 일도 잘해요.",
                      "meaning": "That person is not only kind, but also good at work.",
                      "feeling": "strong positive emphasis",
                      "sound": "/audio/그 사람은 친절할 뿐만 아니라 일도 잘해요.mp3"
                    },
                    {
                      "text": "이 앱은 빠를 뿐만 아니라 사용하기도 쉬워요.",
                      "meaning": "This app is not only fast, but also easy to use.",
                      "feeling": "promotional emphasis",
                      "sound": "/audio/이 앱은 빠를 뿐만 아니라 사용하기도 쉬워요.mp3"
                    }
                  ]
                },
                {
                  "form": "-뿐이다",
                  "phonetic": "-ppun-i-da",
                  "frequency": 3,
                  "meaning": "only, nothing but",
                  "type": "종결",
                  "form_rule": "verb/adjective stem + 뿐이다",
                  "verb_type": "둘다",
                  "des": "Use this to downplay or limit something: “It’s only…” / “That’s all.” It can sound matter-of-fact or slightly dismissive depending on tone.",
                  "core_meaning": "limit to only that",
                  "function": "express limitation",
                  "examples": [
                    {
                      "text": "저는 제 할 일만 했을 뿐이에요.",
                      "meaning": "I only did what I had to do.",
                      "feeling": "modest / downplaying",
                      "sound": "/audio/저는 제 할 일만 했을 뿐이에요.mp3"
                    },
                    {
                      "text": "그건 그냥 소문일 뿐이에요.",
                      "meaning": "That’s just a rumor, that’s all.",
                      "feeling": "dismissive but calm",
                      "sound": "/audio/그건 그냥 소문일 뿐이에요.mp3"
                    }
                  ]
                },
                {
                  "form": "-(으)ㄹ수록",
                  "phonetic": "-(eu)l-su-rok",
                  "frequency": 4,
                  "meaning": "the more..., the more...",
                  "type": "연결",
                  "form_rule": "verb/adjective stem + (으)ㄹ수록",
                  "verb_type": "둘다",
                  "des": "Use this for “the more…, the more….” It shows that as one thing increases or continues, another result becomes stronger too.",
                  "core_meaning": "increase/continuation → stronger result",
                  "function": "express proportional relationship",
                  "examples": [
                    {
                      "text": "생각할수록 더 헷갈려요.",
                      "meaning": "The more I think, the more confused I get.",
                      "feeling": "growing confusion",
                      "sound": "/audio/생각할수록 더 헷갈려요.mp3"
                    },
                    {
                      "text": "연습할수록 실력이 늘어요.",
                      "meaning": "The more you practice, the better you get.",
                      "feeling": "encouraging",
                      "sound": "/audio/연습할수록 실력이 늘어요.mp3"
                    }
                  ]
                },
                {
                  "form": "-(으)ㄴ/는 채(로)",
                  "phonetic": "-(eu)n/neun chae(ro)",
                  "frequency": 3,
                  "meaning": "while keeping (a state), without changing",
                  "type": "연결",
                  "form_rule": "past: verb/adjective stem + (으)ㄴ 채(로), present: verb stem + 는 채(로)",
                  "verb_type": "둘다",
                  "des": "Use this to say a state stays the same while another action happens, like “with (something) still…” or “without changing it.” It often sounds written or descriptive.",
                  "core_meaning": "keep a state unchanged",
                  "function": "express maintaining a state",
                  "examples": [
                    {
                      "text": "신발을 신은 채로 들어왔어요.",
                      "meaning": "He came in with his shoes still on.",
                      "feeling": "descriptive / slightly critical",
                      "sound": "/audio/신발을 신은 채로 들어왔어요.mp3"
                    },
                    {
                      "text": "불을 켠 채로 잤어요.",
                      "meaning": "I slept with the light still on.",
                      "feeling": "careless / accidental",
                      "sound": "/audio/불을 켠 채로 잤어요.mp3"
                    }
                  ]
                },
                {
                  "form": "-아/어 놓다",
                  "phonetic": "-a/eo no-ta",
                  "frequency": 4,
                  "meaning": "do and leave it (prepared state)",
                  "type": "보조",
                  "form_rule": "verb stem + 아/어 놓다",
                  "verb_type": "동사",
                  "des": "Use this when you do something in advance and leave it that way, often for preparation. It feels like “do it and keep it ready.”",
                  "core_meaning": "do in advance and keep the result",
                  "function": "express preparation/result kept",
                  "examples": [
                    {
                      "text": "문을 열어 놓았어요.",
                      "meaning": "I left the door open.",
                      "feeling": "prepared / intentional",
                      "sound": "/audio/문을 열어 놓았어요.mp3"
                    },
                    {
                      "text": "음식을 미리 만들어 놓았어요.",
                      "meaning": "I prepared the food in advance.",
                      "feeling": "planning ahead",
                      "sound": "/audio/음식을 미리 만들어 놓았어요.mp3"
                    }
                  ]
                },
                {
                  "form": "-아/어 두다",
                  "phonetic": "-a/eo du-da",
                  "frequency": 4,
                  "meaning": "do and keep it for later",
                  "type": "보조",
                  "form_rule": "verb stem + 아/어 두다",
                  "verb_type": "동사",
                  "des": "Use this when you do something now so it will help later. It’s like “do it ahead of time and save it for later.”",
                  "core_meaning": "do now for later use",
                  "function": "express doing in advance for future",
                  "examples": [
                    {
                      "text": "필요한 자료를 복사해 뒀어요.",
                      "meaning": "I made copies of the needed documents in advance.",
                      "feeling": "prepared",
                      "sound": "/audio/필요한 자료를 복사해 뒀어요.mp3"
                    },
                    {
                      "text": "내일을 위해 돈을 모아 두고 있어요.",
                      "meaning": "I’m saving money for tomorrow/the future.",
                      "feeling": "responsible planning",
                      "sound": "/audio/내일을 위해 돈을 모아 두고 있어요.mp3"
                    }
                  ]
                },
                {
                  "form": "-아/어 버리다",
                  "phonetic": "-a/eo beo-ri-da",
                  "frequency": 4,
                  "meaning": "end up doing (completely), do and finish",
                  "type": "보조",
                  "form_rule": "verb stem + 아/어 버리다",
                  "verb_type": "동사",
                  "des": "Use this when something is done completely, often with emotion. Depending on context, it can feel like relief (“finally done”) or regret (“oops, I did it”).",
                  "core_meaning": "completion with emotion",
                  "function": "express completion (often emotional)",
                  "examples": [
                    {
                      "text": "숙제를 다 해 버렸어요.",
                      "meaning": "I finished all my homework (completely).",
                      "feeling": "relieved completion",
                      "sound": "/audio/숙제를 다 해 버렸어요.mp3"
                    },
                    {
                      "text": "실수로 파일을 지워 버렸어요.",
                      "meaning": "I accidentally deleted the file.",
                      "feeling": "regret / frustration",
                      "sound": "/audio/실수로 파일을 지워 버렸어요.mp3"
                    }
                  ]
                },
                {
                  "form": "-(으)거나",
                  "phonetic": "-(eu)geo-na",
                  "frequency": 5,
                  "meaning": "or",
                  "type": "연결",
                  "form_rule": "verb/adjective stem + (으)거나",
                  "verb_type": "둘다",
                  "des": "Use this to offer choices: “A or B.” It’s neutral and works for both actions and descriptions.",
                  "core_meaning": "choice between options",
                  "function": "express alternative (or)",
                  "examples": [
                    {
                      "text": "집에 있거나 밖에 나갈 거예요.",
                      "meaning": "I’ll either stay home or go out.",
                      "feeling": "simple options",
                      "sound": "/audio/집에 있거나 밖에 나갈 거예요.mp3"
                    },
                    {
                      "text": "피곤하거나 아프면 쉬세요.",
                      "meaning": "If you’re tired or sick, please rest.",
                      "feeling": "caring advice",
                      "sound": "/audio/피곤하거나 아프면 쉬세요.mp3"
                    }
                  ]
                },
                {
                  "form": "-든지(…든지)",
                  "phonetic": "-deun-ji(...deun-ji)",
                  "frequency": 4,
                  "meaning": "either..., or... (doesn't matter which)",
                  "type": "연결",
                  "form_rule": "verb/adjective stem + 든지 (…든지)",
                  "verb_type": "둘다",
                  "des": "Use this for “either A or B, it doesn’t matter.” It emphasizes that any choice is fine, and the speaker is not picky.",
                  "core_meaning": "either option is acceptable",
                  "function": "express open choice (either/or)",
                  "examples": [
                    {
                      "text": "커피든지 차든지 괜찮아요.",
                      "meaning": "Coffee or tea is fine.",
                      "feeling": "easygoing",
                      "sound": "/audio/커피든지 차든지 괜찮아요.mp3"
                    },
                    {
                      "text": "주말에 오든지 평일에 오든지 편한 때 오세요.",
                      "meaning": "Come on the weekend or on a weekday—come whenever it’s convenient.",
                      "feeling": "welcoming / flexible",
                      "sound": "/audio/주말에 오든지 평일에 오든지 편한 때 오세요.mp3"
                    }
                  ]
                },
                    {
                      "form": "-지 (…하지)",
                      "phonetic": "-ji (...ha-ji)",
                      "frequency": 5,
                      "meaning": "right?, isn't it? / (soft emphasis)",
                      "type": "종결",
                      "form_rule": "verb/adjective stem + 지 (often used as A-지, B-지…)",
                      "verb_type": "둘다",
                      "des": "A casual ending that assumes shared understanding, like “right?” or “you know.” It’s also used to list thoughts: “I should do this, and that…”",
                      "core_meaning": "shared understanding / self-talk listing",
                      "function": "seek agreement or think aloud",
                      "examples": [
                        {
                          "text": "그렇지?",
                          "meaning": "Right?",
                          "feeling": "seeking agreement (casual)",
                          "sound": "/audio/그렇지?.mp3"
                        },
                        {
                          "text": "뭘 먹지… 뭐가 좋지…",
                          "meaning": "What should I eat… what would be good…",
                          "feeling": "thinking aloud",
                          "sound": "/audio/뭘 먹지… 뭐가 좋지….mp3"
                        }
                      ]
                    },
                    {
                      "form": "-잖아/잖아요",
                      "phonetic": "-jan-a/-jan-a-yo",
                      "frequency": 5,
                      "meaning": "you know, as you know",
                      "type": "종결",
                      "form_rule": "verb/adjective stem + 잖아/잖아요",
                      "verb_type": "둘다",
                      "des": "Use this when you think the listener already knows the fact, like “you know…” It can sound friendly, but depending on tone it may feel like mild complaining or ‘told you so.’",
                      "core_meaning": "remind of known fact",
                      "function": "appeal to shared knowledge",
                      "examples": [
                        {
                          "text": "내가 바쁘잖아.",
                          "meaning": "You know I’m busy.",
                          "feeling": "slightly complaining (casual)",
                          "sound": "/audio/내가 바쁘잖아.mp3"
                        },
                        {
                          "text": "이거 어렵잖아요.",
                          "meaning": "You know this is hard.",
                          "feeling": "seeking sympathy (polite)",
                          "sound": "/audio/이거 어렵잖아요.mp3"
                        }
                      ]
                    },
                    {
                      "form": "-거든 (설명/전제)",
                      "phonetic": "-geo-deun",
                      "frequency": 4,
                      "meaning": "because / you see (setup tone)",
                      "type": "연결",
                      "form_rule": "verb/adjective stem + 거든, then main clause follows",
                      "verb_type": "둘다",
                      "des": "Use this to set up background or a reason before the main point. It feels like “Because…, (so) …” and often sounds like giving context first.",
                      "core_meaning": "setup reason/background before main clause",
                      "function": "provide background (pre-condition)",
                      "examples": [
                        {
                          "text": "지금 바쁘거든 나중에 이야기하자.",
                          "meaning": "I’m busy right now, so let’s talk later.",
                          "feeling": "setting context first",
                          "sound": "/audio/지금 바쁘거든 나중에 이야기하자.mp3"
                        },
                        {
                          "text": "이거 처음이거든 천천히 해도 돼.",
                          "meaning": "It’s your first time, so you can do it slowly.",
                          "feeling": "reassuring",
                          "sound": "/audio/이거 처음이거든 천천히 해도 돼.mp3"
                        }
                      ]
                    },
                    {
                      "form": "-네/네요",
                      "phonetic": "-ne/-ne-yo",
                      "frequency": 4,
                      "meaning": "oh, I see (discovery)",
                      "type": "종결",
                      "form_rule": "verb/adjective stem + 네/네요",
                      "verb_type": "둘다",
                      "des": "Use this when you notice something right now, like a small ‘Oh!’ reaction. -네요 is polite; -네 is more casual (often to oneself).",
                      "core_meaning": "discovery/realization",
                      "function": "express realization",
                      "examples": [
                        {
                          "text": "생각보다 빠르네요.",
                          "meaning": "Oh, it’s faster than I thought.",
                          "feeling": "surprised realization (polite)",
                          "sound": "/audio/생각보다 빠르네요.mp3"
                        },
                        {
                          "text": "날씨 좋네.",
                          "meaning": "Oh, the weather is nice.",
                          "feeling": "casual observation",
                          "sound": "/audio/날씨 좋네.mp3"
                        }
                      ]
                    },
                    {
                      "form": "-더라/더라고(요)",
                      "phonetic": "-deo-ra/-deo-ra-go(yo)",
                      "frequency": 4,
                      "meaning": "I found/experienced (recollection)",
                      "type": "종결",
                      "form_rule": "verb/adjective stem + 더라/더라고(요)",
                      "verb_type": "둘다",
                      "des": "Use this to share something you personally saw, felt, or experienced in the past. It’s like reporting your own observation: “When I tried it, it was…”",
                      "core_meaning": "past experience report",
                      "function": "report personal experience",
                      "examples": [
                        {
                          "text": "그 영화 진짜 재미있더라고요.",
                          "meaning": "That movie was really fun (from my experience).",
                          "feeling": "sharing experience (polite)",
                          "sound": "/audio/그 영화 진짜 재미있더라고요.mp3"
                        },
                        {
                          "text": "거기 사람 많더라.",
                          "meaning": "There were a lot of people there (I saw it).",
                          "feeling": "casual recollection",
                          "sound": "/audio/거기 사람 많더라.mp3"
                        }
                      ]
                    },
                    {
                      "form": "-나(요)",
                      "phonetic": "-na(yo)",
                      "frequency": 3,
                      "meaning": "I guess / (soft suggestion or wonder)",
                      "type": "종결",
                      "form_rule": "verb/adjective stem + 나(요)",
                      "verb_type": "둘다",
                      "des": "A gentle ending that can sound like a soft suggestion, a light guess, or a mild ‘wondering’ tone. It feels less direct than plain statements.",
                      "core_meaning": "soft tone (gentle/indirect)",
                      "function": "soften a statement or suggestion",
                      "examples": [
                        {
                          "text": "조금 쉬는 게 좋겠나 봐요.",
                          "meaning": "I guess it might be good to rest a bit.",
                          "feeling": "gentle suggestion",
                          "sound": "/audio/조금 쉬는 게 좋겠나 봐요.mp3"
                        },
                        {
                          "text": "이거 괜찮나?",
                          "meaning": "I wonder if this is okay?",
                          "feeling": "uncertain, soft",
                          "sound": "/audio/이거 괜찮나?.mp3"
                        }
                      ]
                    },
                    {
                      "form": "-지 뭐",
                      "phonetic": "-ji mwo",
                      "frequency": 3,
                      "meaning": "well, I guess / anyway",
                      "type": "종결",
                      "form_rule": "verb/adjective stem + 지 뭐",
                      "verb_type": "둘다",
                      "des": "Use this to show light resignation or ‘it is what it is.’ It can feel casual, slightly humorous, or giving up without being too dramatic.",
                      "core_meaning": "resignation with light tone",
                      "function": "show resignation",
                      "examples": [
                        {
                          "text": "비가 오면 못 가지 뭐.",
                          "meaning": "If it rains, I guess we just can’t go.",
                          "feeling": "resigned but casual",
                          "sound": "/audio/비가 오면 못 가지 뭐.mp3"
                        },
                        {
                          "text": "안 되면 다음에 하지 뭐.",
                          "meaning": "If it doesn’t work, we’ll just do it next time.",
                          "feeling": "easygoing resignation",
                          "sound": "/audio/안 되면 다음에 하지 뭐.mp3"
                        }
                      ]
                    },
                    {
                      "form": "-는데요",
                      "phonetic": "-neun-de-yo",
                      "frequency": 5,
                      "meaning": "(soft lead-in), but/and (polite)",
                      "type": "종결",
                      "form_rule": "verb/adjective stem + (는)데요",
                      "verb_type": "둘다",
                      "des": "A polite ending that adds a soft lead-in or leaves room for the next sentence. It can sound like “Well, actually…” or “The thing is…”",
                      "core_meaning": "softening / setting context",
                      "function": "soften or introduce topic",
                      "examples": [
                        {
                          "text": "저 지금 바쁜데요…",
                          "meaning": "I’m busy right now… (so…) ",
                          "feeling": "polite hesitation / hinting",
                          "sound": "/audio/저 지금 바쁜데요….mp3"
                        },
                        {
                          "text": "그건 좋은 생각인데요.",
                          "meaning": "That’s a good idea, but…",
                          "feeling": "polite soft contrast",
                          "sound": "/audio/그건 좋은 생각인데요.mp3"
                        }
                      ]
                    },
                    {
                      "form": "-지요/죠",
                      "phonetic": "-ji-yo/jo",
                      "frequency": 4,
                      "meaning": "right? / you know (polite)",
                      "type": "종결",
                      "form_rule": "verb/adjective stem + 지요/죠",
                      "verb_type": "둘다",
                      "des": "Use this to politely confirm or seek agreement (“…, right?”). It often assumes the listener will understand, and can feel friendly and gentle.",
                      "core_meaning": "polite confirmation",
                      "function": "seek agreement",
                      "examples": [
                        {
                          "text": "괜찮지요?",
                          "meaning": "It’s okay, right?",
                          "feeling": "gentle confirmation",
                          "sound": "/audio/괜찮지요?.mp3"
                        },
                        {
                          "text": "쉽지요.",
                          "meaning": "It’s easy, you know.",
                          "feeling": "friendly assurance",
                          "sound": "/audio/쉽지요.mp3"
                        }
                      ]
                    },
                    {
                      "form": "-려나 / -을까",
                      "phonetic": "-ryeo-na / -(eu)l-kka",
                      "frequency": 4,
                      "meaning": "I wonder if / maybe?",
                      "type": "종결",
                      "form_rule": "verb/adjective stem + 려나 / (으)ㄹ까",
                      "verb_type": "둘다",
                      "des": "Use these to wonder or guess, like “I wonder if…” -을까 is very common and neutral; -려나 feels more casual and ‘talking to yourself’.",
                      "core_meaning": "wondering/guessing",
                      "function": "express uncertainty or curiosity",
                      "examples": [
                        {
                          "text": "지금 오고 있을까?",
                          "meaning": "I wonder if they’re coming now.",
                          "feeling": "curious/uncertain",
                          "sound": "/audio/지금 오고 있을까?.mp3"
                        },
                        {
                          "text": "비가 오려나.",
                          "meaning": "Maybe it’ll rain (I wonder).",
                          "feeling": "casual musing",
                          "sound": "/audio/비가 오려나.mp3"
                        }
                      ]
                    },
                    {
                        "form": "-(으)ㄹ게(요)",
                        "phonetic": "-(eu)l ge(yo)",
                        "frequency": 5,
                        "meaning": "I will (promise / will do it)",
                        "type": "종결",
                        "form_rule": "verb stem + (으)ㄹ게(요)",
                        "verb_type": "동사",
                        "des": "Use this to say “I’ll do it” with a promise-like tone. It often implies you’re doing it for the listener or considering their situation.",
                        "core_meaning": "promise / willing intention",
                        "function": "promise to do something",
                        "examples": [
                          {
                            "text": "내일 전화할게요.",
                            "meaning": "I’ll call you tomorrow.",
                            "feeling": "promise / reassurance",
                            "sound": "/audio/내일 전화할게요.mp3"
                          },
                          {
                            "text": "제가 여기서 기다릴게요.",
                            "meaning": "I’ll wait here.",
                            "feeling": "considerate decision",
                            "sound": "/audio/제가 여기서 기다릴게요.mp3"
                          }
                        ]
                      },
                      {
                        "form": "-(으)ㄹ래(요)",
                        "phonetic": "-(eu)l lae(yo)",
                        "frequency": 4,
                        "meaning": "want to, will (casual intention)",
                        "type": "종결",
                        "form_rule": "verb stem + (으)ㄹ래(요)",
                        "verb_type": "동사",
                        "des": "Use this to express your personal choice or intention, like “I want to / I’m going to.” It can sound casual and self-focused.",
                        "core_meaning": "personal intention/choice",
                        "function": "state intention or preference",
                        "examples": [
                          {
                            "text": "저는 집에 있을래요.",
                            "meaning": "I’m going to stay home.",
                            "feeling": "personal choice",
                            "sound": "/audio/저는 집에 있을래요.mp3"
                          },
                          {
                            "text": "오늘은 일찍 잘래요.",
                            "meaning": "I want to sleep early today.",
                            "feeling": "casual intention",
                            "sound": "/audio/오늘은 일찍 잘래요.mp3"
                          }
                        ]
                      },
                      {
                        "form": "-아/어 주다",
                        "phonetic": "-a/eo ju-da",
                        "frequency": 5,
                        "meaning": "do for someone",
                        "type": "보조",
                        "form_rule": "verb stem + 아/어 주다",
                        "verb_type": "동사",
                        "des": "Use this when you do something for someone (a favor). It adds a warm, helpful 느낌, and is very common in requests and polite offers.",
                        "core_meaning": "do an action as a favor",
                        "function": "express doing for someone",
                        "examples": [
                          {
                            "text": "사진 좀 찍어 주세요.",
                            "meaning": "Please take a photo for me.",
                            "feeling": "polite request",
                            "sound": "/audio/사진 좀 찍어 주세요.mp3"
                          },
                          {
                            "text": "제가 문을 열어 줄게요.",
                            "meaning": "I’ll open the door for you.",
                            "feeling": "helpful offer",
                            "sound": "/audio/제가 문을 열어 줄게요.mp3"
                          }
                        ]
                      },
                      {
                        "form": "-아/어 보다",
                        "phonetic": "-a/eo bo-da",
                        "frequency": 5,
                        "meaning": "try doing",
                        "type": "보조",
                        "form_rule": "verb stem + 아/어 보다",
                        "verb_type": "동사",
                        "des": "Use this to mean “try doing something.” It’s light and practical—often used when suggesting a small experiment or first attempt.",
                        "core_meaning": "try an action",
                        "function": "express trying",
                        "examples": [
                          {
                            "text": "이거 한번 먹어 봐요.",
                            "meaning": "Try eating this once.",
                            "feeling": "friendly suggestion",
                            "sound": "/audio/이거 한번 먹어 봐요.mp3"
                          },
                          {
                            "text": "새 방법을 써 봤어요.",
                            "meaning": "I tried a new method.",
                            "feeling": "experimenting",
                            "sound": "/audio/새 방법을 써 봤어요.mp3"
                          }
                        ]
                      },
                      {
                        "form": "-게 되다",
                        "phonetic": "-ge doe-da",
                        "frequency": 5,
                        "meaning": "end up, come to (naturally)",
                        "type": "보조",
                        "form_rule": "verb stem + 게 되다",
                        "verb_type": "동사",
                        "des": "Use this when something happens naturally over time or due to circumstances, like “I ended up…” or “I came to…” It often avoids blaming anyone directly.",
                        "core_meaning": "change/outcome by circumstance",
                        "function": "express natural outcome/change",
                        "examples": [
                          {
                            "text": "한국에서 살게 됐어요.",
                            "meaning": "I ended up living in Korea.",
                            "feeling": "matter-of-fact outcome",
                            "sound": "/audio/한국에서 살게 됐어요.mp3"
                          },
                          {
                            "text": "자주 만나게 됐어요.",
                            "meaning": "We ended up meeting often.",
                            "feeling": "natural progression",
                            "sound": "/audio/자주 만나게 됐어요.mp3"
                          }
                        ]
                      },
                      {
                        "form": "-(으)ㄹ 것 같다",
                        "phonetic": "-(eu)l geot gat-da",
                        "frequency": 5,
                        "meaning": "seems like, I think (guess)",
                        "type": "종결",
                        "form_rule": "verb/adjective stem + (으)ㄹ 것 같다",
                        "verb_type": "둘다",
                        "des": "Use this to make a soft guess: “I think it will…” / “It seems like…” It sounds less certain and more polite than a strong statement.",
                        "core_meaning": "soft prediction/guess",
                        "function": "express guess",
                        "examples": [
                          {
                            "text": "내일 비가 올 것 같아요.",
                            "meaning": "I think it will rain tomorrow.",
                            "feeling": "uncertain prediction",
                            "sound": "/audio/내일 비가 올 것 같아요.mp3"
                          },
                          {
                            "text": "이게 더 좋은 것 같아요.",
                            "meaning": "I think this is better.",
                            "feeling": "soft opinion",
                            "sound": "/audio/이게 더 좋은 것 같아요.mp3"
                          }
                        ]
                      },
                      {
                        "form": "-나 보다",
                        "phonetic": "-na bo-da",
                        "frequency": 4,
                        "meaning": "it seems (based on evidence)",
                        "type": "종결",
                        "form_rule": "verb/adjective stem + 나 보다",
                        "verb_type": "둘다",
                        "des": "Use this when you infer something from what you see or hear, like “Looks like…” It feels like an evidence-based guess, not just a feeling.",
                        "core_meaning": "inference from evidence",
                        "function": "express inference",
                        "examples": [
                          {
                            "text": "밖에 비가 오나 봐요.",
                            "meaning": "Looks like it’s raining outside.",
                            "feeling": "inference from clues",
                            "sound": "/audio/밖에 비가 오나 봐요.mp3"
                          },
                          {
                            "text": "피곤한가 봐요.",
                            "meaning": "You seem tired.",
                            "feeling": "gentle observation",
                            "sound": "/audio/피곤한가 봐요.mp3"
                          }
                        ]
                      },
                      {
                        "form": "-도록",
                        "phonetic": "-do-rok",
                        "frequency": 4,
                        "meaning": "so that, to the point that",
                        "type": "연결",
                        "form_rule": "verb stem + 도록",
                        "verb_type": "동사",
                        "des": "Use this to express purpose or goal, like “so that…” It’s common in instructions and can sound slightly formal.",
                        "core_meaning": "purpose/goal (so that)",
                        "function": "express purpose",
                        "examples": [
                          {
                            "text": "늦지 않도록 서둘러요.",
                            "meaning": "Hurry so that you’re not late.",
                            "feeling": "instruction / caution",
                            "sound": "/audio/늦지 않도록 서둘러요.mp3"
                          },
                          {
                            "text": "모두가 이해하도록 쉽게 설명했어요.",
                            "meaning": "I explained it simply so everyone could understand.",
                            "feeling": "clear purpose",
                            "sound": "/audio/모두가 이해하도록 쉽게 설명했어요.mp3"
                          }
                        ]
                      },
                      {
                        "form": "-게끔",
                        "phonetic": "-ge-kkeum",
                        "frequency": 3,
                        "meaning": "so that (more casual/colloquial)",
                        "type": "연결",
                        "form_rule": "verb stem + 게끔",
                        "verb_type": "동사",
                        "des": "A more casual way to say “so that.” It’s often used in speech to sound natural and less formal than -도록.",
                        "core_meaning": "purpose (casual so that)",
                        "function": "express purpose (casual)",
                        "examples": [
                          {
                            "text": "잘 들리게끔 크게 말해 주세요.",
                            "meaning": "Please speak loudly so it can be heard well.",
                            "feeling": "practical request",
                            "sound": "/audio/잘 들리게끔 크게 말해 주세요.mp3"
                          },
                          {
                            "text": "헷갈리지 않게끔 정리해 뒀어요.",
                            "meaning": "I organized it so it wouldn’t be confusing.",
                            "feeling": "helpful preparation",
                            "sound": "/audio/헷갈리지 않게끔 정리해 뒀어요.mp3"
                          }
                        ]
                      },
                      {
                        "form": "-지 않다",
                        "phonetic": "-ji an-ta",
                        "frequency": 5,
                        "meaning": "not (do), do not",
                        "type": "보조",
                        "form_rule": "verb/adjective stem + 지 않다",
                        "verb_type": "둘다",
                        "des": "A standard way to make negatives: “do not / is not.” It’s neutral and works in most situations (more formal/clear than 안 + verb).",
                        "core_meaning": "negation",
                        "function": "make negative statements",
                        "examples": [
                          {
                            "text": "저는 커피를 마시지 않아요.",
                            "meaning": "I don’t drink coffee.",
                            "feeling": "neutral statement",
                            "sound": "/audio/저는 커피를 마시지 않아요.mp3"
                          },
                          {
                            "text": "오늘은 춥지 않아요.",
                            "meaning": "It’s not cold today.",
                            "feeling": "simple observation",
                            "sound": "/audio/오늘은 춥지 않아요.mp3"
                          }
                        ]
                      },
                      {
                        "form": "-아/어지다",
                        "phonetic": "-a/eo-ji-da",
                        "frequency": 5,
                        "meaning": "become (change of state)",
                        "type": "보조",
                        "form_rule": "adjective stem + 아/어지다 (also verb stem + 아/어지다 for passive meaning in some cases)",
                        "verb_type": "둘다",
                        "des": "Use this to say something becomes a new state over time (“get/become …”). It’s most common with adjectives for natural change, like ‘get bigger/colder.’",
                        "core_meaning": "change into a state",
                        "function": "express change of state",
                        "examples": [
                          {
                            "text": "날씨가 추워졌어요.",
                            "meaning": "The weather got cold.",
                            "feeling": "natural change",
                            "sound": "/audio/날씨가 추워졌어요.mp3"
                          },
                          {
                            "text": "요즘 더 바빠졌어요.",
                            "meaning": "These days I’ve become busier.",
                            "feeling": "gradual change",
                            "sound": "/audio/요즘 더 바빠졌어요.mp3"
                          }
                        ]
                      },
                      {
                        "form": "-게 하다",
                        "phonetic": "-ge ha-da",
                        "frequency": 4,
                        "meaning": "make/let someone do",
                        "type": "보조",
                        "form_rule": "verb/adjective stem + 게 하다",
                        "verb_type": "둘다",
                        "des": "Use this to cause or allow something: “make/let someone do.” It’s common for instructions, permission, or setting conditions.",
                        "core_meaning": "causation/allowing",
                        "function": "cause or allow an action/state",
                        "examples": [
                          {
                            "text": "아이를 밖에서 놀게 했어요.",
                            "meaning": "I let the child play outside.",
                            "feeling": "allowing",
                            "sound": "/audio/아이를 밖에서 놀게 했어요.mp3"
                          },
                          {
                            "text": "사람들을 기다리게 했어요.",
                            "meaning": "I made people wait.",
                            "feeling": "causing inconvenience",
                            "sound": "/audio/사람들을 기다리게 했어요.mp3"
                          }
                        ]
                      },
                      {
                        "form": "-아/어도 되다",
                        "phonetic": "-a/eo-do doe-da",
                        "frequency": 5,
                        "meaning": "may, can (permission)",
                        "type": "보조",
                        "form_rule": "verb stem + 아/어도 되다",
                        "verb_type": "동사",
                        "des": "Use this to ask or give permission: “Is it okay if I…?” / “You may…” It’s one of the most common permission patterns.",
                        "core_meaning": "permission",
                        "function": "ask/give permission",
                        "examples": [
                          {
                            "text": "여기 앉아도 돼요?",
                            "meaning": "May I sit here?",
                            "feeling": "polite permission request",
                            "sound": "/audio/여기 앉아도 돼요?.mp3"
                          },
                          {
                            "text": "지금 나가도 돼요.",
                            "meaning": "You can leave now.",
                            "feeling": "permission granted",
                            "sound": "/audio/지금 나가도 돼요.mp3"
                          }
                        ]
                      },
                      {
                        "form": "-(으)면 안 되다",
                        "phonetic": "-(eu)myeon an doe-da",
                        "frequency": 5,
                        "meaning": "must not, cannot",
                        "type": "보조",
                        "form_rule": "verb stem + (으)면 안 되다",
                        "verb_type": "동사",
                        "des": "Use this to forbid something: “You must not…” / “You can’t…” It’s common for rules and warnings.",
                        "core_meaning": "prohibition",
                        "function": "express prohibition",
                        "examples": [
                          {
                            "text": "여기에서 담배 피우면 안 돼요.",
                            "meaning": "You must not smoke here.",
                            "feeling": "rule / warning",
                            "sound": "/audio/여기에서 담배 피우면 안 돼요.mp3"
                          },
                          {
                            "text": "늦으면 안 돼요.",
                            "meaning": "You can’t be late.",
                            "feeling": "strict reminder",
                            "sound": "/audio/늦으면 안 돼요.mp3"
                          }
                        ]
                      },
                      {
                        "form": "-(으)ㄹ 수 있다",
                        "phonetic": "-(eu)l su it-da",
                        "frequency": 5,
                        "meaning": "can, be able to",
                        "type": "보조",
                        "form_rule": "verb/adjective stem + (으)ㄹ 수 있다",
                        "verb_type": "둘다",
                        "des": "Use this to express ability or possibility: “can / be able to.” It’s neutral and works in both spoken and written Korean.",
                        "core_meaning": "ability/possibility",
                        "function": "express ability or possibility",
                        "examples": [
                          {
                            "text": "저는 수영할 수 있어요.",
                            "meaning": "I can swim.",
                            "feeling": "ability",
                            "sound": "/audio/저는 수영할 수 있어요.mp3"
                          },
                          {
                            "text": "오늘은 늦을 수 있어요.",
                            "meaning": "I might be late today.",
                            "feeling": "possibility / warning",
                            "sound": "/audio/오늘은 늦을 수 있어요.mp3"
                          }
                        ]
                      },
                      {
                        "form": "-(으)ㄹ 수 없다",
                        "phonetic": "-(eu)l su eop-da",
                        "frequency": 5,
                        "meaning": "cannot, be unable to",
                        "type": "보조",
                        "form_rule": "verb/adjective stem + (으)ㄹ 수 없다",
                        "verb_type": "둘다",
                        "des": "Use this to say something is impossible or you’re not able to do it: “cannot / be unable to.” It’s a clear, neutral negative of -(으)ㄹ 수 있다.",
                        "core_meaning": "inability/impossibility",
                        "function": "express inability or impossibility",
                        "examples": [
                          {
                            "text": "오늘은 갈 수 없어요.",
                            "meaning": "I can’t go today.",
                            "feeling": "clear limitation",
                            "sound": "/audio/오늘은 갈 수 없어요.mp3"
                          },
                          {
                            "text": "그건 믿을 수 없어요.",
                            "meaning": "I can’t believe that.",
                            "feeling": "strong disbelief",
                            "sound": "/audio/그건 믿을 수 없어요.mp3"
                          }
                        ]
                      },
                      {
                        "form": "-아/어야 되다",
                        "phonetic": "-a/eo-ya doe-da",
                        "frequency": 5,
                        "meaning": "must, need to",
                        "type": "보조",
                        "form_rule": "verb stem + 아/어야 되다",
                        "verb_type": "동사",
                        "des": "A very common spoken way to say “must / need to.” It feels slightly more conversational than -아/어야 하다, but the meaning is similar.",
                        "core_meaning": "necessity (spoken)",
                        "function": "express necessity",
                        "examples": [
                          {
                            "text": "지금 가야 돼요.",
                            "meaning": "I have to go now.",
                            "feeling": "everyday necessity",
                            "sound": "/audio/지금 가야 돼요.mp3"
                          },
                          {
                            "text": "내일까지 끝내야 돼요.",
                            "meaning": "I need to finish it by tomorrow.",
                            "feeling": "deadline pressure",
                            "sound": "/audio/내일까지 끝내야 돼요.mp3"
                          }
                        ]
                      },
                      {
                        "form": "-(으)ㄹ지도 모르다",
                        "phonetic": "-(eu)l-ji-do mo-reu-da",
                        "frequency": 4,
                        "meaning": "might, maybe",
                        "type": "종결",
                        "form_rule": "verb/adjective stem + (으)ㄹ지도 모르다",
                        "verb_type": "둘다",
                        "des": "Use this to say something might happen (“maybe / might”). It expresses uncertainty more strongly than -(으)ㄹ 것 같다.",
                        "core_meaning": "uncertain possibility",
                        "function": "express possibility (uncertain)",
                        "examples": [
                          {
                            "text": "오늘 비가 올지도 몰라요.",
                            "meaning": "It might rain today.",
                            "feeling": "uncertain prediction",
                            "sound": "/audio/오늘 비가 올지도 몰라요.mp3"
                          },
                          {
                            "text": "그 사람이 안 올지도 몰라요.",
                            "meaning": "That person might not come.",
                            "feeling": "uncertain concern",
                            "sound": "/audio/그 사람이 안 올지도 몰라요.mp3"
                          }
                        ]
                      },
                      {
                        "form": "-아/어야지",
                        "phonetic": "-a/eo-ya-ji",
                        "frequency": 4,
                        "meaning": "should, I’d better (self-talk / decision)",
                        "type": "종결",
                        "form_rule": "verb stem + 아/어야지",
                        "verb_type": "동사",
                        "des": "Use this to talk to yourself or make a light decision: “I should / I’d better.” It often feels like a small resolution rather than a strict obligation.",
                        "core_meaning": "light decision/resolve",
                        "function": "express resolve (self-talk)",
                        "examples": [
                          {
                            "text": "이제 자야지.",
                            "meaning": "I should sleep now.",
                            "feeling": "small personal decision",
                            "sound": "/audio/이제 자야지.mp3"
                          },
                          {
                            "text": "다음부터는 조심해야지.",
                            "meaning": "From next time, I should be careful.",
                            "feeling": "self-reminder / resolve",
                            "sound": "/audio/다음부터는 조심해야지.mp3"
                          }
                        ]
                      },
                      {
                        "form": "-지 말다",
                        "phonetic": "-ji mal-da",
                        "frequency": 5,
                        "meaning": "don’t (do)",
                        "type": "보조",
                        "form_rule": "verb stem + 지 말다 (imperative: -지 마/마세요)",
                        "verb_type": "동사",
                        "des": "Use this to tell someone not to do something (“don’t…”). It’s the standard negative command/request form.",
                        "core_meaning": "negative command",
                        "function": "tell someone not to do",
                        "examples": [
                          {
                            "text": "걱정하지 마세요.",
                            "meaning": "Please don’t worry.",
                            "feeling": "gentle reassurance",
                            "sound": "/audio/걱정하지 마세요.mp3"
                          },
                          {
                            "text": "여기에서 사진 찍지 마.",
                            "meaning": "Don’t take photos here.",
                            "feeling": "direct prohibition (casual)",
                            "sound": "/audio/여기에서 사진 찍지 마.mp3"
                          }
                        ]
                      },
                        {
                          "form": "-(으)ㄴ/는 후에 / 뒤에",
                          "phonetic": "-(eu)n/neun hu-e / dwi-e",
                          "frequency": 5,
                          "meaning": "after, later",
                          "type": "연결",
                          "form_rule": "past: verb stem + (으)ㄴ 후에/뒤에, present: verb stem + 는 후에/뒤에",
                          "verb_type": "동사",
                          "des": "Use this to say “after / later.” It places one action after another in a neutral, clear way.",
                          "core_meaning": "after an action/time",
                          "function": "express time (after)",
                          "examples": [
                            {
                              "text": "수업이 끝난 후에 같이 밥 먹어요.",
                              "meaning": "After class ends, let’s eat together.",
                              "feeling": "simple plan",
                              "sound": "/audio/수업이 끝난 후에 같이 밥 먹어요.mp3"
                            },
                            {
                              "text": "일을 한 뒤에 집에 갔어요.",
                              "meaning": "After working, I went home.",
                              "feeling": "sequence",
                              "sound": "/audio/일을 한 뒤에 집에 갔어요.mp3"
                            }
                          ]
                        },
                        {
                          "form": "-(으)ㄴ/는 후에 / 뒤에 (재정리)",
                          "phonetic": "-(eu)n/neun hu-e / dwi-e",
                          "frequency": 3,
                          "meaning": "after, later",
                          "type": "연결",
                          "form_rule": "duplicate entry placeholder",
                          "verb_type": "동사",
                          "des": "Placeholder (this item should be removed).",
                          "core_meaning": "duplicate",
                          "function": "duplicate",
                          "examples": [
                            { "text": "중복 항목입니다.", "meaning": "This is a duplicate entry.", "feeling": "placeholder", "sound": "/audio/중복 항목입니다.mp3" }
                          ]
                        },
                        {
                          "form": "-기 전(에)",
                          "phonetic": "-gi jeon(e)",
                          "frequency": 5,
                          "meaning": "before doing",
                          "type": "연결",
                          "form_rule": "verb stem + 기 전(에)",
                          "verb_type": "동사",
                          "des": "Use this to say “before doing something.” It clearly shows one action happens earlier than another.",
                          "core_meaning": "before doing an action",
                          "function": "express time (before)",
                          "examples": [
                            { "text": "자기 전에 샤워해요.", "meaning": "I shower before sleeping.", "feeling": "routine", "sound": "/audio/자기 전에 샤워해요.mp3" },
                            { "text": "출발하기 전에 다시 확인하세요.", "meaning": "Please check again before you leave.", "feeling": "practical instruction", "sound": "/audio/출발하기 전에 다시 확인하세요.mp3" }
                          ]
                        },
                        {
                          "form": "-자마자",
                          "phonetic": "-ja-ma-ja",
                          "frequency": 4,
                          "meaning": "as soon as",
                          "type": "연결",
                          "form_rule": "verb stem + 자마자",
                          "verb_type": "동사",
                          "des": "Use this for “as soon as.” It means something happens immediately, with almost no time in between.",
                          "core_meaning": "immediate sequence",
                          "function": "express time (immediately after)",
                          "examples": [
                            { "text": "집에 오자마자 잤어요.", "meaning": "As soon as I got home, I slept.", "feeling": "immediate action", "sound": "/audio/집에 오자마자 잤어요.mp3" },
                            { "text": "수업이 끝나자마자 밖에 나갔어요.", "meaning": "As soon as class ended, I went outside.", "feeling": "quick transition", "sound": "/audio/수업이 끝나자마자 밖에 나갔어요.mp3" }
                          ]
                        },
                        {
                          "form": "-(으)ㄹ 때",
                          "phonetic": "-(eu)l ttae",
                          "frequency": 5,
                          "meaning": "when",
                          "type": "연결",
                          "form_rule": "verb/adjective stem + (으)ㄹ 때",
                          "verb_type": "둘다",
                          "des": "Use this to say “when” something happens. It marks the time of an action or situation.",
                          "core_meaning": "time marker",
                          "function": "express time (when)",
                          "examples": [
                            { "text": "시간이 있을 때 책을 읽어요.", "meaning": "I read books when I have time.", "feeling": "everyday habit", "sound": "/audio/시간이 있을 때 책을 읽어요.mp3" },
                            { "text": "처음 한국에 왔을 때 많이 놀랐어요.", "meaning": "When I first came to Korea, I was very surprised.", "feeling": "past memory", "sound": "/audio/처음 한국에 왔을 때 많이 놀랐어요.mp3" }
                          ]
                        },
                        {
                          "form": "-(으)ㄹ 때마다",
                          "phonetic": "-(eu)l ttae-ma-da",
                          "frequency": 4,
                          "meaning": "every time",
                          "type": "연결",
                          "form_rule": "verb/adjective stem + (으)ㄹ 때마다",
                          "verb_type": "둘다",
                          "des": "Use this for “every time / whenever.” It means the same thing happens repeatedly whenever a situation occurs.",
                          "core_meaning": "repetition each time",
                          "function": "express repetition",
                          "examples": [
                            { "text": "한국 노래를 들을 때마다 기분이 좋아져요.", "meaning": "Every time I listen to Korean songs, I feel better.", "feeling": "repeated reaction", "sound": "/audio/한국 노래를 들을 때마다 기분이 좋아져요.mp3" },
                            { "text": "그 사람을 볼 때마다 웃음이 나요.", "meaning": "Whenever I see that person, I start smiling.", "feeling": "natural repeated feeling", "sound": "/audio/그 사람을 볼 때마다 웃음이 나요.mp3" }
                          ]
                        },
                        {
                          "form": "-(으)ㄹ 동안 / -는 동안",
                          "phonetic": "-(eu)l dong-an / -neun dong-an",
                          "frequency": 4,
                          "meaning": "during, while",
                          "type": "연결",
                          "form_rule": "action: verb stem + 는 동안 / time period: verb/adjective stem + (으)ㄹ 동안",
                          "verb_type": "둘다",
                          "des": "Use this to say something happens during a time period (“during/while”). It focuses on the duration.",
                          "core_meaning": "during a period",
                          "function": "express duration",
                          "examples": [
                            { "text": "방학 동안 한국에 있었어요.", "meaning": "I stayed in Korea during the vacation.", "feeling": "time window", "sound": "/audio/방학 동안 한국에 있었어요.mp3" },
                            { "text": "기다리는 동안 책을 읽었어요.", "meaning": "I read a book while waiting.", "feeling": "filling time", "sound": "/audio/기다리는 동안 책을 읽었어요.mp3" }
                          ]
                        },
                        {
                          "form": "-(으)면서",
                          "phonetic": "-(eu)myeon-seo",
                          "frequency": 5,
                          "meaning": "while (two actions)",
                          "type": "연결",
                          "form_rule": "verb stem + (으)면서",
                          "verb_type": "동사",
                          "des": "Use this to show two actions happen at the same time (“while doing X, do Y”). Usually the same person does both actions.",
                          "core_meaning": "simultaneous actions",
                          "function": "express simultaneous actions",
                          "examples": [
                            { "text": "음악을 들으면서 공부해요.", "meaning": "I study while listening to music.", "feeling": "everyday habit", "sound": "/audio/음악을 들으면서 공부해요.mp3" },
                            { "text": "걸으면서 이야기했어요.", "meaning": "We talked while walking.", "feeling": "casual scene", "sound": "/audio/걸으면서 이야기했어요.mp3" }
                          ]
                        },
                        {
                          "form": "-다가",
                          "phonetic": "-da-ga",
                          "frequency": 4,
                          "meaning": "while doing, then (change/stop)",
                          "type": "연결",
                          "form_rule": "verb stem + 다가",
                          "verb_type": "동사",
                          "des": "Use this when an action is interrupted or changes: “I was doing X, but then Y happened.” It often implies an unexpected turn.",
                          "core_meaning": "interruption/change",
                          "function": "express interruption/shift",
                          "examples": [
                            { "text": "집에 가다가 친구를 만났어요.", "meaning": "While going home, I met a friend.", "feeling": "unexpected event", "sound": "/audio/집에 가다가 친구를 만났어요.mp3" },
                            { "text": "공부하다가 잠이 들었어요.", "meaning": "I was studying and then I fell asleep.", "feeling": "interrupted action", "sound": "/audio/공부하다가 잠이 들었어요.mp3" }
                          ]
                        },
                        {
                            "form": "-아/어도",
                            "phonetic": "-a/eo-do",
                            "frequency": 5,
                            "meaning": "even if, even though",
                            "type": "연결",
                            "form_rule": "verb/adjective stem + 아/어도",
                            "verb_type": "둘다",
                            "des": "Use this to say the result doesn’t change even if the condition is true (“even if…”). It often feels like permission, acceptance, or ‘it’s fine anyway.’",
                            "core_meaning": "unchanged result despite condition",
                            "function": "express concession (even if)",
                            "examples": [
                              {
                                "text": "늦어도 괜찮아요.",
                                "meaning": "It’s okay even if you’re late.",
                                "feeling": "accepting / permissive",
                                "sound": "/audio/늦어도 괜찮아요.mp3"
                              },
                              {
                                "text": "비가 와도 갈 거예요.",
                                "meaning": "I’ll go even if it rains.",
                                "feeling": "determined",
                                "sound": "/audio/비가 와도 갈 거예요.mp3"
                              }
                            ]
                          },
                          {
                            "form": "-더라도",
                            "phonetic": "-deo-ra-do",
                            "frequency": 4,
                            "meaning": "even if (stronger)",
                            "type": "연결",
                            "form_rule": "verb stem + 더라도",
                            "verb_type": "동사",
                            "des": "A stronger “even if.” It often sounds firm, like you’re emphasizing that you’ll do it no matter what the situation is.",
                            "core_meaning": "strong concession (no matter what)",
                            "function": "express strong concession",
                            "examples": [
                              {
                                "text": "힘들더라도 끝까지 해요.",
                                "meaning": "Even if it’s hard, do it to the end.",
                                "feeling": "encouraging / firm",
                                "sound": "/audio/힘들더라도 끝까지 해요.mp3"
                              },
                              {
                                "text": "비싸더라도 좋은 걸 살래요.",
                                "meaning": "Even if it’s expensive, I’ll buy a good one.",
                                "feeling": "strong preference",
                                "sound": "/audio/비싸더라도 좋은 걸 살래요.mp3"
                              }
                            ]
                          },
                          {
                            "form": "-(으)려면",
                            "phonetic": "-(eu)ryeo-myeon",
                            "frequency": 5,
                            "meaning": "if you want to, in order to",
                            "type": "연결",
                            "form_rule": "verb stem + (으)려면",
                            "verb_type": "동사",
                            "des": "Use this to say “if you want to do X, you need to do Y.” It’s great for advice, requirements, and step-by-step guidance.",
                            "core_meaning": "goal → required condition",
                            "function": "express requirement for a goal",
                            "examples": [
                              {
                                "text": "한국어를 잘하려면 많이 들어야 해요.",
                                "meaning": "If you want to be good at Korean, you need to listen a lot.",
                                "feeling": "advice / guidance",
                                "sound": "/audio/한국어를 잘하려면 많이 들어야 해요.mp3"
                              },
                              {
                                "text": "예약하려면 먼저 회원가입을 하세요.",
                                "meaning": "If you want to make a reservation, please sign up first.",
                                "feeling": "instruction",
                                "sound": "/audio/예약하려면 먼저 회원가입을 하세요.mp3"
                              }
                            ]
                          },
                          {
                            "form": "-기 때문에",
                            "phonetic": "-gi ttae-mun-e",
                            "frequency": 4,
                            "meaning": "because (more formal)",
                            "type": "연결",
                            "form_rule": "verb/adjective stem + 기 때문에",
                            "verb_type": "둘다",
                            "des": "A clearer, more formal way to say “because.” It’s common in writing, explanations, and official-sounding speech.",
                            "core_meaning": "reason/cause (formal)",
                            "function": "express reason (formal)",
                            "examples": [
                              {
                                "text": "비가 오기 때문에 행사가 취소됐어요.",
                                "meaning": "Because it’s raining, the event was canceled.",
                                "feeling": "formal explanation",
                                "sound": "/audio/비가 오기 때문에 행사가 취소됐어요.mp3"
                              },
                              {
                                "text": "시간이 없기 때문에 오늘은 못 가요.",
                                "meaning": "Because I don’t have time, I can’t go today.",
                                "feeling": "clear justification",
                                "sound": "/audio/시간이 없기 때문에 오늘은 못 가요.mp3"
                              }
                            ]
                          },
                          {
                            "form": "-(으)니까",
                            "phonetic": "-(eu)ni-kka",
                            "frequency": 5,
                            "meaning": "because, so",
                            "type": "연결",
                            "form_rule": "verb/adjective stem + (으)니까",
                            "verb_type": "둘다",
                            "des": "Use this to give a reason, often leading naturally into a request, command, or suggestion. It can sound like you’re explaining and then acting on it.",
                            "core_meaning": "reason leading to next action",
                            "function": "express reason (often with suggestion/command)",
                            "examples": [
                              {
                                "text": "늦었으니까 빨리 가요.",
                                "meaning": "Since we’re late, let’s go quickly.",
                                "feeling": "practical push",
                                "sound": "/audio/늦었으니까 빨리 가요.mp3"
                              },
                              {
                                "text": "춥니까 창문 닫아 주세요.",
                                "meaning": "Because it’s cold, please close the window.",
                                "feeling": "polite request with reason",
                                "sound": "/audio/춥니까 창문 닫아 주세요.mp3"
                              }
                            ]
                          },
                          {
                            "form": "-(으)ㄹ 때까지",
                            "phonetic": "-(eu)l ttae-kka-ji",
                            "frequency": 4,
                            "meaning": "until (a time/event)",
                            "type": "연결",
                            "form_rule": "verb/adjective stem + (으)ㄹ 때까지",
                            "verb_type": "둘다",
                            "des": "Use this to say “until” a certain time or event. It clearly marks the end point you’re waiting for or continuing until.",
                            "core_meaning": "end point (until)",
                            "function": "express time limit (until)",
                            "examples": [
                              {
                                "text": "끝날 때까지 기다릴게요.",
                                "meaning": "I’ll wait until it’s finished.",
                                "feeling": "patient commitment",
                                "sound": "/audio/끝날 때까지 기다릴게요.mp3"
                              },
                              {
                                "text": "집에 도착할 때까지 연락해 주세요.",
                                "meaning": "Please 연락 me until you arrive home (keep in touch until then).",
                                "feeling": "caring / cautious",
                                "sound": "/audio/집에 도착할 때까지 연락해 주세요.mp3"
                              }
                            ]
                          },
                          {
                            "form": "-기만 하면",
                            "phonetic": "-gi-man ha-myeon",
                            "frequency": 3,
                            "meaning": "whenever (only if you do)",
                            "type": "연결",
                            "form_rule": "verb stem + 기만 하면",
                            "verb_type": "동사",
                            "des": "Use this for “whenever / as soon as you do X.” It often implies that doing X is the key trigger for Y.",
                            "core_meaning": "trigger condition (whenever X happens)",
                            "function": "express trigger condition",
                            "examples": [
                              {
                                "text": "그 노래를 듣기만 하면 눈물이 나요.",
                                "meaning": "Whenever I listen to that song, I tear up.",
                                "feeling": "emotional trigger",
                                "sound": "/audio/그 노래를 듣기만 하면 눈물이 나요.mp3"
                              },
                              {
                                "text": "집에 가기만 하면 바로 잘 거예요.",
                                "meaning": "As soon as I get home, I’ll sleep right away.",
                                "feeling": "tired / immediate plan",
                                "sound": "/audio/집에 가기만 하면 바로 잘 거예요.mp3"
                              }
                            ]
                          },
                          {
                            "form": "-기는 하지만",
                            "phonetic": "-gi-neun ha-ji-man",
                            "frequency": 3,
                            "meaning": "it is true that..., but",
                            "type": "연결",
                            "form_rule": "verb/adjective stem + 기는 하지만",
                            "verb_type": "둘다",
                            "des": "Use this to admit one point and then contrast it: “It’s true that A, but…” It feels balanced and often polite.",
                            "core_meaning": "acknowledge then contrast",
                            "function": "express concession + contrast",
                            "examples": [
                              {
                                "text": "좋기는 하지만 너무 비싸요.",
                                "meaning": "It’s good, but it’s too expensive.",
                                "feeling": "fair, balanced opinion",
                                "sound": "/audio/좋기는 하지만 너무 비싸요.mp3"
                              },
                              {
                                "text": "가기는 하지만 자주 못 가요.",
                                "meaning": "I do go, but I can’t go often.",
                                "feeling": "clarifying gently",
                                "sound": "/audio/가기는 하지만 자주 못 가요.mp3"
                              }
                            ]
                          },
                          {
                            "form": "-기는커녕",
                            "phonetic": "-gi-neun-keo-nyeong",
                            "frequency": 3,
                            "meaning": "far from, let alone",
                            "type": "연결",
                            "form_rule": "verb/adjective stem + 기는커녕",
                            "verb_type": "둘다",
                            "des": "Use this to say “not only not A, but actually the opposite / not even close.” It’s like “let alone,” and often sounds a bit dramatic or emphatic.",
                            "core_meaning": "strong negation + opposite result",
                            "function": "deny A and emphasize worse/opposite",
                            "examples": [
                              {
                                "text": "도와주기는커녕 방해만 했어요.",
                                "meaning": "Far from helping, they only got in the way.",
                                "feeling": "frustrated / critical",
                                "sound": "/audio/도와주기는커녕 방해만 했어요.mp3"
                              },
                              {
                                "text": "쉬기는커녕 더 바빠졌어요.",
                                "meaning": "I didn’t rest at all—if anything, I got busier.",
                                "feeling": "tired complaint",
                                "sound": "/audio/쉬기는커녕 더 바빠졌어요.mp3"
                              }
                            ]
                          },
                          {
                            "form": "-도록 하다",
                            "phonetic": "-do-rok ha-da",
                            "frequency": 4,
                            "meaning": "make it so that / please do",
                            "type": "보조",
                            "form_rule": "verb stem + 도록 하다",
                            "verb_type": "동사",
                            "des": "Use this to give guidance or an instruction politely, like “Please make sure to…” It’s common in announcements and formal requests.",
                            "core_meaning": "instruction to ensure an action",
                            "function": "give instruction (ensure)",
                            "examples": [
                              {
                                "text": "늦지 않도록 하세요.",
                                "meaning": "Please make sure you are not late.",
                                "feeling": "formal reminder",
                                "sound": "/audio/늦지 않도록 하세요.mp3"
                              },
                              {
                                "text": "문을 꼭 잠그도록 해요.",
                                "meaning": "Make sure to lock the door.",
                                "feeling": "cautious instruction",
                                "sound": "/audio/문을 꼭 잠그도록 해요.mp3"
                              }
                            ]
                          }
  ]


