import SwiftUI

/// The single route for haptic feedback, so the user can turn it off in Profile.
///
/// Usage: `.haptic(.success, trigger: result)`. Views never call `.sensoryFeedback` directly.
enum Haptics {
    /// `@AppStorage` key for the user toggle.
    static let enabledKey = "settings.hapticsEnabled"
    static let enabledByDefault = true

    enum Event: Sendable {
        case success, error, selection, impact

        var feedback: SensoryFeedback {
            switch self {
            case .success: .success
            case .error: .error
            case .selection: .selection
            case .impact: .impact
            }
        }
    }
}

private struct HapticModifier<Trigger: Equatable>: ViewModifier {
    let event: Haptics.Event
    let trigger: Trigger

    @AppStorage(Haptics.enabledKey) private var isEnabled = Haptics.enabledByDefault

    func body(content: Content) -> some View {
        content.sensoryFeedback(event.feedback, trigger: trigger) { _, _ in isEnabled }
    }
}

extension View {
    /// Plays `event` when `trigger` changes, if the user has haptics enabled.
    func haptic<Trigger: Equatable>(_ event: Haptics.Event, trigger: Trigger) -> some View {
        modifier(HapticModifier(event: event, trigger: trigger))
    }
}
