import CoreGraphics

/// Spacing on an 8pt grid (docs/11-design.md). `xxs` is the half step for tight pairs
/// like an icon next to its label.
public enum Spacing {
    public static let grid: CGFloat = 8

    public static let xxs: CGFloat = grid / 2   // 4
    public static let xs: CGFloat = grid         // 8
    public static let sm: CGFloat = grid * 2     // 16
    public static let md: CGFloat = grid * 3     // 24
    public static let lg: CGFloat = grid * 4     // 32
    public static let xl: CGFloat = grid * 6     // 48

    /// Horizontal padding for screen content.
    public static let screen: CGFloat = 20
    /// Inner padding for cards.
    public static let card: CGFloat = grid * 2   // 16
}

/// Corner radius tokens. Use with `.continuous` corner style.
public enum Radius {
    public static let small: CGFloat = 8
    public static let medium: CGFloat = 14
    public static let large: CGFloat = 22
}

/// Fixed sizes.
public enum Size {
    /// Minimum touch target (Apple HIG).
    public static let minTouchTarget: CGFloat = 44
    /// Hairline borders on cards and secondary buttons.
    public static let borderWidth: CGFloat = 1
}

/// Opacity tokens.
public enum Opacity {
    public static let disabled: Double = 0.4
    public static let pressed: Double = 0.85
}

/// Motion tokens. Always gate on Reduce Motion where movement is involved.
public enum Motion {
    /// Scale applied to buttons while pressed (skipped under Reduce Motion).
    public static let pressedScale: CGFloat = 0.97
    /// Short spring duration for press and state changes.
    public static let quick: Double = 0.2
}
