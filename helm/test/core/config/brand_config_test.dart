import 'dart:convert';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:waypoint/core/config/brand_config.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('BrandConfig constants match expected configuration schema', () {
    expect(BrandConfig.appName, 'Waycord');
    expect(BrandConfig.appDomain, 'waycord.org');
    expect(BrandConfig.organizationName, isNotEmpty);
    expect(BrandConfig.supportEmail, 'support@waycord.org');
    expect(BrandConfig.privacyEmail, 'privacy@waycord.org');
    expect(BrandConfig.legalEmail, 'legal@waycord.org');
    expect(BrandConfig.jurisdiction, 'India');
    expect(BrandConfig.dataRegion, 'ap-south-1 (Mumbai)');
  });

  test('assets/config/organization.json matches BrandConfig values', () async {
    final jsonStr = await rootBundle.loadString('assets/config/organization.json');
    final Map<String, dynamic> data = jsonDecode(jsonStr);

    expect(data['app_name'], BrandConfig.appName);
    expect(data['app_domain'], BrandConfig.appDomain);
    expect(data['organization_name'], BrandConfig.organizationName);
    expect(data['support_email'], BrandConfig.supportEmail);
    expect(data['privacy_email'], BrandConfig.privacyEmail);
    expect(data['legal_email'], BrandConfig.legalEmail);
    expect(data['jurisdiction'], BrandConfig.jurisdiction);
    expect(data['data_region'], BrandConfig.dataRegion);
  });
}
