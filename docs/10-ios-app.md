# iOS app

## Targets

| Target | Purpose |
|---|---|
| `LearnApp` | Main app |
| `LearnWidgets` | Widget extension (Daily Bug, streak) + Live Activities |
| `LearnKit` (Swift package, local) | Shared models, design system, brand, content decoding, grading logic (used by app and widgets) |
| `LearnAppTests` | Swift Testing |

Bundle ID: `one.nullstack.learn` (neutral, permanent). Display name from build settings (`Ducky`).

## Folder structure

```
ios/
├── LearnApp/
│   ├── App/                    # App entry, root navigation, environment setup
│   ├── Features/
│   │   ├── Onboarding/
│   │   ├── Home/               # Learning path
│   │   ├── Lesson/             # Lesson runner + exercise views
│   │   │   ├── Exercises/      # One view per exercise type
│   │   │   └── CodeView/       # Code rendering, tappable lines, highlighting
│   │   ├── DailyBug/
│   │   ├── BuildChallenge/     # WKWebView host + test runner
│   │   ├── Paywall/
│   │   ├── Profile/            # Streak, XP, stats, settings
│   │   ├── Leagues/            # V1.1
│   │   └── Glossary/
│   ├── Services/
│   │   ├── APIClient.swift     # actor, typed endpoints
│   │   ├── AuthService.swift   # Sign in with Apple + Supabase session
│   │   ├── ContentStore.swift  # pack download, cache, lookup
│   │   ├── ProgressStore.swift # SwiftData + sync queue
│   │   ├── PurchaseService.swift # StoreKit 2
│   │   ├── SparkService.swift
│   │   ├── OnDeviceAI.swift    # Foundation Models wrapper (availability-gated)
│   │   ├── Haptics.swift
│   │   └── Notifications.swift
│   └── Resources/              # Localizable.xcstrings, assets, bundled starter pack
├── LearnKit/
│   ├── Brand/                  # Brand constants
│   ├── DesignSystem/           # Colors, typography, spacing, components
│   ├── Models/                 # Codable models mirroring 12-data-models.md
│   └── Grading/                # Pure grading functions (heavily tested)
└── LearnWidgets/
```

## Navigation

Tab bar (3 tabs, keep it minimal):
1. **Learn:** the path (home)
2. **Daily:** Daily Bug, leagues (V1.1), friends (V1.1)
3. **Profile:** streak calendar, XP, stats, Sparks, settings, subscription

Lessons and paywalls present full screen (`fullScreenCover`). Glossary and explanations as sheets with detents.

## Key screens

### Onboarding (goal: solve a real puzzle within 60 seconds)
1. Welcome: Ducky intro, one line ("Ducky writes code. You catch its mistakes.")
2. **Immediately** a first Spot the Bug (very easy). Win it.
3. Quick questions: experience level (never coded / used AI tools / some coding), goal (build my own app / understand AI code / school / career), daily goal (5/10/15 min).
4. Notification permission (with a clear reason: streak reminders, Daily Bug).
5. Sign in with Apple (skippable: continue as guest).
6. Paywall with trial (skippable, "Continue for free" clearly visible).
7. Land on the path with the first lesson highlighted.

### Learning path (home)
- Vertical path of lesson nodes grouped by unit headers. Current node prominent. Completed nodes checked.
- Top bar: streak count, Sparks, hearts (free).
- Track switcher at top.

### Lesson runner
- Progress bar at top, close button, hearts.
- One exercise per screen. Primary button at bottom: Check → Continue.
- Result banner slides up from the bottom (correct/incorrect), with short explanation and "Explain differently" (on-device AI or alternate text).
- End of lesson: XP earned, accuracy, streak extended animation, Ducky reaction.

### Exercise views (one per type)
Each conforms to a protocol:

```swift
protocol ExerciseView: View {
    associatedtype Item: ExerciseItem
    init(item: Item, onAnswer: @escaping (AnswerResult) -> Void)
}
```

Grading is pure and lives in `LearnKit/Grading` (`func grade(_ item: SpotTheBug, answer: SpotTheBugAnswer) -> AnswerResult`). Views never decide correctness themselves.

### CodeView (most important component)
- Renders `[String]` lines in SF Mono with syntax highlighting (lightweight tokenizer for JS/HTML/CSS; no web view).
- Modes: read-only, tappable lines (single/multi select), highlight line(s) with reason, inline blank slots, editable line (code keyboard).
- Line numbers, phone-width design (content authored to fit; horizontal scroll as a fallback only).
- Fully accessible: each line is an accessibility element ("Line 3: total equals total plus item dot price"), with symbol names spoken clearly.

### Code keyboard
- Custom input view above the system keyboard: symbol row `{ } ( ) [ ] ; = " ' < > + - . , ! & |`, and identifier chips (variables in scope from exercise data).
- Used in Hand Fix and short typing exercises only.

### Build Challenge
- Prompt input → loading state with code streaming in (or progressive reveal) → preview tab (WKWebView) + code tab → "Run checks" → requirement checklist with pass/fail → Try again.
- WKWebView config: `WKWebpagePreferences.allowsContentJavaScript = true`, no network (block via `WKContentRuleList` all URLs except `about:`), no navigation (`decidePolicyFor` cancels), non-persistent data store.
- Test script and axe-core bundled in the app, injected with `WKUserScript`; results returned via `WKScriptMessageHandler` as JSON.

### Paywall
- See `08-monetization.md` for rules. Built with StoreKit 2 (custom SwiftUI, or `SubscriptionStoreView` customized to the design system).

## Platform features

- **Widgets (WidgetKit):** small (streak), medium (Daily Bug teaser + streak). Timeline refresh daily + on lesson completion via `WidgetCenter.reloadAllTimelines()`. Shared data via App Group.
- **Live Activities (V1.1):** streak-at-risk in the evening, Daily Bug timer.
- **Foundation Models:** `OnDeviceAI` service checks availability; used for "Explain differently" and hints. Fallback to authored alternate text.
- **Haptics:** `.sensoryFeedback` modifiers (success, error, impact) routed through settings toggle.
- **Notifications:** local notifications for streak reminders and trial ending; remote push optional later.
- **StoreKit 2:** products loaded at launch, `Transaction.updates` listener started at app launch, entitlements cached.

## Persistence

SwiftData models (local):
- `LocalProgress` (lesson/exercise completion, XP events)
- `SeenItem` (pool item ids seen)
- `SyncQueueItem` (pending uploads)
- `CachedPack` metadata (version, checksum, path)

Server is the source of truth for Sparks, purchases, streak (with local optimistic updates). Conflict rule: union of completions, max of XP, server wins for Sparks.

## Accessibility checklist
- Dynamic Type through XXL (layout reflows, code view supports larger mono size with horizontal scroll).
- VoiceOver: every control labeled, code lines readable, result announcements (`AccessibilityNotification.Announcement`).
- Reduce Motion: replace celebrations with fades.
- Color is never the only signal (icons + text for correct/incorrect).
- 44pt minimum touch targets.

## Testing
- Grading logic: exhaustive Swift Testing tests per exercise type.
- Content decoding: decode every JSON fixture from `content/` and a sample pack.
- Spark/streak math: unit tests including time zone and day boundary cases.
- UI: previews for every screen in light/dark and large Dynamic Type.
