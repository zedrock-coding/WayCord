import 'package:flutter/material.dart';

/// REM (Root EM) spacing engine for Flutter.
///
/// Ties spacing, paddings, margins, gaps, and icon sizing to the active font scale.
/// When users scale text, element spacing scales proportionally, preventing
/// layout compression on large fonts or excessive sparsity on small fonts.
class Rem {
  /// Base pixel value corresponding to 1.0 rem.
  static const double baseFontSize = 16.0;

  /// Default lower scale bound for spacing safety.
  static const double minRemScale = 0.8;

  /// Default upper scale bound for spacing safety.
  static const double maxRemScale = 1.35;

  /// Calculates the active proportional font scale factor from [context].
  static double scaleFactor(
    BuildContext context, {
    double min = minRemScale,
    double max = maxRemScale,
  }) {
    final double rawScale = MediaQuery.maybeTextScalerOf(context)?.scale(1.0) ?? 1.0;
    return rawScale.clamp(min, max);
  }

  /// Converts rem [units] into scaled logical pixels based on [context].
  ///
  /// Example: `Rem.from(context, 1.0)` -> ~16.0 logical pixels.
  static double from(
    BuildContext context,
    double units, {
    double min = minRemScale,
    double max = maxRemScale,
  }) {
    return units * baseFontSize * scaleFactor(context, min: min, max: max);
  }

  /// Scales raw pixel values [pixels] proportionally to the active font scale.
  static double px(
    BuildContext context,
    double pixels, {
    double min = minRemScale,
    double max = maxRemScale,
  }) {
    return pixels * scaleFactor(context, min: min, max: max);
  }
}

/// Extension on [BuildContext] for ergonomic rem-based layout spacing.
extension RemContextExtension on BuildContext {
  /// Active rem scale factor derived from ambient [TextScaler].
  double get remScale => Rem.scaleFactor(this);

  /// Computes scaled logical pixels for given rem [units].
  double rem(double units) => Rem.from(this, units);

  /// Scales a base pixel value proportionally to font scale.
  double sp(double pixels) => Rem.px(this, pixels);

  /// Creates a vertical [SizedBox] scaled by rem [units].
  Widget remGapH(double units) => SizedBox(height: rem(units));

  /// Creates a horizontal [SizedBox] scaled by rem [units].
  Widget remGapW(double units) => SizedBox(width: rem(units));

  /// Generates scaled [EdgeInsets] using rem units.
  RemInsets get remInsets => RemInsets(this);
}

/// Helper for generating proportional [EdgeInsets] in rem units.
class RemInsets {
  final BuildContext _context;

  const RemInsets(this._context);

  /// Uniform padding in rem units.
  EdgeInsets all(double units) => EdgeInsets.all(_context.rem(units));

  /// Symmetric horizontal and vertical padding in rem units.
  EdgeInsets symmetric({double horizontal = 0.0, double vertical = 0.0}) {
    return EdgeInsets.symmetric(
      horizontal: _context.rem(horizontal),
      vertical: _context.rem(vertical),
    );
  }

  /// Custom directional padding in rem units.
  EdgeInsets only({
    double left = 0.0,
    double top = 0.0,
    double right = 0.0,
    double bottom = 0.0,
  }) {
    return EdgeInsets.only(
      left: _context.rem(left),
      top: _context.rem(top),
      right: _context.rem(right),
      bottom: _context.rem(bottom),
    );
  }
}

/// Extension on [num] for direct rem conversions.
extension RemNumExtension on num {
  /// Converts number (as rem units) to scaled logical pixels.
  double rem(BuildContext context) => Rem.from(context, toDouble());

  /// Scales number (as base pixels) proportionally with font scale.
  double sp(BuildContext context) => Rem.px(context, toDouble());
}
