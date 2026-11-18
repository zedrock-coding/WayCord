import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:waypoint/core/entitlements/entitlement_capabilities.dart';
import 'package:waypoint/core/entitlements/entitlement_service.dart';
import 'package:waypoint/core/entitlements/waycord_upgrade_sheet.dart';
import 'package:waypoint/widgets/recurrence_picker_sheet.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    EntitlementService().resetForTesting();
  });

  tearDown(() {
    EntitlementService().resetForTesting();
  });

  Widget buildDirectSheet() {
    return const MaterialApp(
      home: Scaffold(
        body: SingleChildScrollView(
          child: RecurrencePickerSheet(),
        ),
      ),
    );
  }

  testWidgets('Free tier allows daily/weekly presets but locks Custom Recurrence behind WaycordUpgradeSheet',
      (WidgetTester tester) async {
    tester.view.physicalSize = const Size(800, 1400);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    EntitlementService().setDevOverrideTier(WaycordTier.free);

    await tester.pumpWidget(buildDirectSheet());
    await tester.pumpAndSettle();

    expect(find.text('Every day'), findsOneWidget);
    expect(find.text('Custom...'), findsOneWidget);
    expect(find.text('PRO'), findsOneWidget);

    // Tap Custom... -> opens WaycordUpgradeSheet
    await tester.tap(find.text('Custom...'));
    await tester.pumpAndSettle();

    expect(find.byType(WaycordUpgradeSheet), findsOneWidget);
    expect(find.text('Unlock Waycord Pro'), findsOneWidget);

    // Dismiss upgrade sheet
    await tester.tap(find.text('Understood'));
    await tester.pumpAndSettle();
    expect(find.byType(WaycordUpgradeSheet), findsNothing);
  });

  testWidgets('Pro tier unlocks Custom Recurrence form directly without upgrade sheet',
      (WidgetTester tester) async {
    tester.view.physicalSize = const Size(800, 1400);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(() => tester.view.resetPhysicalSize());

    EntitlementService().setDevOverrideTier(WaycordTier.pro);

    await tester.pumpWidget(buildDirectSheet());
    await tester.pumpAndSettle();

    expect(find.text('Custom...'), findsOneWidget);
    expect(find.text('PRO'), findsNothing);

    // Tap Custom... -> switches to custom form directly
    await tester.tap(find.text('Custom...'));
    await tester.pumpAndSettle();

    expect(find.byType(WaycordUpgradeSheet), findsNothing);
    expect(find.text('Repeat every:'), findsOneWidget);
    expect(find.text('Custom Recurrence'), findsOneWidget);
  });
}
