import DesignSystem
import SwiftUI

/// Profile tab: streak, XP, stats, Sparks, settings, subscription. Settings only for now.
struct ProfileView: View {
    @AppStorage(Haptics.enabledKey) private var hapticsEnabled = Haptics.enabledByDefault

    var body: some View {
        NavigationStack {
            List {
                Section {
                    Toggle(isOn: $hapticsEnabled) {
                        VStack(alignment: .leading, spacing: Spacing.xxs) {
                            Text("Haptics")
                                .font(LearnFont.body)
                                .foregroundStyle(LearnColor.textPrimary)
                            Text("Vibrations for answers and taps.")
                                .font(LearnFont.footnote)
                                .foregroundStyle(LearnColor.textSecondary)
                        }
                    }
                    .haptic(.selection, trigger: hapticsEnabled)
                } header: {
                    Text("Settings")
                }
                .listRowBackground(LearnColor.surface)
            }
            .scrollContentBackground(.hidden)
            .background(LearnColor.background)
            .navigationTitle("Profile")
        }
    }
}

#Preview("Light") { ProfileView() }

#Preview("Dark") { ProfileView().preferredColorScheme(.dark) }

#Preview("Largest Dynamic Type") { ProfileView().dynamicTypeSize(.accessibility5) }
