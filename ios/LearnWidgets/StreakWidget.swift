import DesignSystem
import SwiftUI
import WidgetKit

/// Placeholder streak widget (M1). Real data arrives via the App Group in M10.
struct StreakWidget: Widget {
    let kind = "StreakWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: StreakProvider()) { entry in
            StreakWidgetView(entry: entry)
                .containerBackground(LearnColor.surface, for: .widget)
        }
        .configurationDisplayName("Streak")
        .description("Keep your streak going.")
        .supportedFamilies([.systemSmall])
    }
}

struct StreakEntry: TimelineEntry {
    let date: Date
    let streak: Int
}

struct StreakProvider: TimelineProvider {
    func placeholder(in context: Context) -> StreakEntry {
        StreakEntry(date: .now, streak: 0)
    }

    func getSnapshot(in context: Context, completion: @escaping (StreakEntry) -> Void) {
        completion(placeholder(in: context))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<StreakEntry>) -> Void) {
        completion(Timeline(entries: [placeholder(in: context)], policy: .never))
    }
}

struct StreakWidgetView: View {
    let entry: StreakEntry

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.xxs) {
            Image(systemName: "flame.fill")
                .font(LearnFont.title)
                .foregroundStyle(LearnColor.mascot)
                .accessibilityHidden(true)
            Spacer(minLength: 0)
            Text(entry.streak, format: .number)
                .font(LearnFont.largeTitle)
                .foregroundStyle(LearnColor.textPrimary)
                .monospacedDigit()
            Text("Day streak")
                .font(LearnFont.footnote)
                .foregroundStyle(LearnColor.textSecondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .accessibilityElement(children: .combine)
    }
}

#Preview(as: .systemSmall) {
    StreakWidget()
} timeline: {
    StreakEntry(date: .now, streak: 0)
    StreakEntry(date: .now, streak: 12)
}
