import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:waypoint/core/entitlements/entitlement_capabilities.dart';
import 'package:waypoint/core/entitlements/entitlement_service.dart';
import 'package:waypoint/core/entitlements/waycord_upgrade_sheet.dart';
import 'package:waypoint/models/unified_task.dart';
import 'package:waypoint/widgets/recurrence_picker_sheet.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    EntitlementService().resetForTesting();
  });

  tearDown(() {
    EntitlementService().resetForTesting();
  });

  Widget buildTestApp({required void Function(RecurrenceRule?) onSelect}) {
    return MaterialApp(
      home: Scaffold(
        body: Builder(
          builder: (context) => ElevatedButton(
            onPressed: () async {
              final rule = await RecurrencePickerSheet.show(
                context,
                anchorDate: DateTime(2026, 11, 18),
              );
              onSelect(rule);
            },
            child: const Text('Open Picker'),
          ),
        ),
      ),
    );
  }

  group('Recurrence & Quota Gate Widget Tests', () {
    testWidgets('Free tier user creating Daily recurring task succeeds without upgrade prompt',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(800, 1400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      EntitlementService().setDevOverrideTier(WaycordTier.free);

      RecurrenceRule? selectedRule;
      await tester.pumpWidget(buildTestApp(onSelect: (rule) {
        selectedRule = rule;
      }));
      await tester.pumpAndSettle();

      // Open the sheet
      await tester.tap(find.text('Open Picker'));
      await tester.pumpAndSettle();

      expect(find.text('Every day'), findsOneWidget);

      // Tap Every day preset
      await tester.tap(find.text('Every day'));
      await tester.pumpAndSettle();

      expect(selectedRule, isNotNull);
      expect(selectedRule!.frequency, equals('daily'));
      expect(selectedRule!.interval, equals(1));
      expect(find.byType(WaycordUpgradeSheet), findsNothing);
    });

    testWidgets('Free tier user tapping Custom Recurrence is blocked and renders WaycordUpgradeSheet',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(800, 1400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      EntitlementService().setDevOverrideTier(WaycordTier.free);

      RecurrenceRule? selectedRule;
      await tester.pumpWidget(buildTestApp(onSelect: (rule) {
        selectedRule = rule;
      }));
      await tester.pumpAndSettle();

      // Open the sheet
      await tester.tap(find.text('Open Picker'));
      await tester.pumpAndSettle();

      expect(find.text('Custom...'), findsOneWidget);
      expect(find.text('PRO'), findsOneWidget);

      // Tap Custom... -> must block and show upgrade sheet
      await tester.tap(find.text('Custom...'));
      await tester.pumpAndSettle();

      expect(find.byType(WaycordUpgradeSheet), findsOneWidget);
      expect(find.text('Unlock Waycord Pro'), findsOneWidget);
      expect(selectedRule, isNull);

      // Dismiss upgrade sheet
      await tester.tap(find.text('Understood'));
      await tester.pumpAndSettle();
      expect(find.byType(WaycordUpgradeSheet), findsNothing);
    });

    testWidgets('Pro tier user tapping Custom Recurrence directly renders custom weekday grid',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(800, 1400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      EntitlementService().setDevOverrideTier(WaycordTier.pro);

      RecurrenceRule? selectedRule;
      await tester.pumpWidget(buildTestApp(onSelect: (rule) {
        selectedRule = rule;
      }));
      await tester.pumpAndSettle();

      // Open the sheet
      await tester.tap(find.text('Open Picker'));
      await tester.pumpAndSettle();

      expect(find.text('Custom...'), findsOneWidget);
      expect(find.text('PRO'), findsNothing);

      // Tap Custom... -> direct navigation to custom recurrence form
      await tester.tap(find.text('Custom...'));
      await tester.pumpAndSettle();

      expect(find.byType(WaycordUpgradeSheet), findsNothing);
      expect(find.text('Custom Recurrence'), findsOneWidget);
      expect(find.text('Repeat every:'), findsOneWidget);

      // Select 'Weeks' from dropdown to reveal custom weekday grid
      await tester.tap(find.text('Days'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Weeks').last);
      await tester.pumpAndSettle();

      // Verify custom weekday chips are rendered
      expect(find.text('M'), findsOneWidget);
      expect(find.text('W'), findsOneWidget);
      expect(find.text('F'), findsOneWidget);

      // Tap Set Recurrence button to verify custom rule can be saved
      await tester.tap(find.text('Set Recurrence'));
      await tester.pumpAndSettle();

      expect(selectedRule, isNotNull);
      expect(selectedRule!.frequency, equals('weekly'));
    });
  });
}
