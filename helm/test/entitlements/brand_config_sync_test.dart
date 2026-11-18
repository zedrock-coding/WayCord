import 'dart:convert';
import 'dart:io';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Brand Configuration & Legal Documents Sync Verification Tests', () {
    late Map<String, dynamic> orgConfig;

    setUpAll(() {
      // Find workspace root or assets
      File configFile = File('../config/organization.json');
      if (!configFile.existsSync()) {
        configFile = File('assets/config/organization.json');
      }
      expect(configFile.existsSync(), isTrue, reason: 'organization.json must exist');
      final content = configFile.readAsStringSync();
      orgConfig = jsonDecode(content) as Map<String, dynamic>;
    });

    test('config/organization.json schema and authoritative branding are valid', () {
      expect(orgConfig['app_name'], equals('Waycord'));
      expect(orgConfig['app_domain'], equals('waycord.org'));
      expect(orgConfig['support_email'], equals('support@waycord.org'));
      expect(orgConfig['privacy_email'], equals('privacy@waycord.org'));
      expect(orgConfig['legal_email'], equals('legal@waycord.org'));
      expect(orgConfig['jurisdiction'], equals('India'));
      expect(orgConfig['data_region'], equals('ap-south-1 (Mumbai)'));
    });

    test('PRIVACY_POLICY.md and EULA.md reflect centralized configuration without broken placeholders', () {
      final docsToCheck = [
        File('../PRIVACY_POLICY.md'),
        File('../EULA.md'),
        File('assets/Privacy_policy.md'),
        File('assets/EULA.md'),
      ];

      for (final doc in docsToCheck) {
        if (!doc.existsSync()) continue;
        final text = doc.readAsStringSync();

        // Must interpolate actual app name and domain
        expect(text.contains('Waycord'), isTrue, reason: '${doc.path} must contain Waycord');
        expect(text.contains('waycord.org'), isTrue, reason: '${doc.path} must contain waycord.org');

        // Must not contain unrendered template syntax
        expect(text.contains('{{app_name}}'), isFalse, reason: '${doc.path} contains unrendered {{app_name}}');
        expect(text.contains('{{app_domain}}'), isFalse, reason: '${doc.path} contains unrendered {{app_domain}}');
        expect(text.contains('{{support_email}}'), isFalse, reason: '${doc.path} contains unrendered {{support_email}}');
        expect(text.contains('{{privacy_email}}'), isFalse, reason: '${doc.path} contains unrendered {{privacy_email}}');
        expect(text.contains('{{legal_email}}'), isFalse, reason: '${doc.path} contains unrendered {{legal_email}}');
        expect(text.contains('{{jurisdiction}}'), isFalse, reason: '${doc.path} contains unrendered {{jurisdiction}}');
        expect(text.contains('{{data_region}}'), isFalse, reason: '${doc.path} contains unrendered {{data_region}}');
      }
    });
  });
}
