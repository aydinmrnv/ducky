import SwiftUI

/// Filled accent button: the one primary action on a screen (Check, Continue).
public struct PrimaryButtonStyle: ButtonStyle {
    public init() {}

    public func makeBody(configuration: Configuration) -> some View {
        StyledButtonBody(configuration: configuration, prominence: .primary)
    }
}

/// Outlined button for secondary actions.
public struct SecondaryButtonStyle: ButtonStyle {
    public init() {}

    public func makeBody(configuration: Configuration) -> some View {
        StyledButtonBody(configuration: configuration, prominence: .secondary)
    }
}

public extension ButtonStyle where Self == PrimaryButtonStyle {
    static var learnPrimary: PrimaryButtonStyle { PrimaryButtonStyle() }
}

public extension ButtonStyle where Self == SecondaryButtonStyle {
    static var learnSecondary: SecondaryButtonStyle { SecondaryButtonStyle() }
}

private struct StyledButtonBody: View {
    enum Prominence { case primary, secondary }

    let configuration: ButtonStyleConfiguration
    let prominence: Prominence

    @Environment(\.isEnabled) private var isEnabled
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    private var shape: RoundedRectangle {
        RoundedRectangle(cornerRadius: Radius.medium, style: .continuous)
    }

    var body: some View {
        configuration.label
            .font(LearnFont.button)
            .multilineTextAlignment(.center)
            .foregroundStyle(prominence == .primary ? LearnColor.textOnAccent : LearnColor.accent)
            .padding(.horizontal, Spacing.sm)
            .padding(.vertical, Spacing.xs)
            .frame(maxWidth: .infinity, minHeight: Size.minTouchTarget)
            .background(prominence == .primary ? LearnColor.accent : LearnColor.surface, in: shape)
            .overlay {
                if prominence == .secondary {
                    shape.strokeBorder(LearnColor.border, lineWidth: Size.borderWidth)
                }
            }
            .contentShape(shape)
            .opacity(isEnabled ? (configuration.isPressed ? Opacity.pressed : 1) : Opacity.disabled)
            .scaleEffect(configuration.isPressed && !reduceMotion ? Motion.pressedScale : 1)
            .animation(.spring(duration: Motion.quick), value: configuration.isPressed)
    }
}
